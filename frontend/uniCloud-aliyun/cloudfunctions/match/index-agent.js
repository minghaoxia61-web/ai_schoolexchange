// 匹配算法云函数 - 使用 Agent 进行智能匹配
const db = uniCloud.database()

/**
 * 生成唯一的 matchId
 * @returns {string} 格式为 match_{timestamp}_{random}
 */
function generateMatchId() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 6)
  return `match_${timestamp}_${random}`
}

/**
 * 调用通义千问 API 进行智能匹配
 * @param {Object} userPost 当前用户的物品
 * @param {Array} allPosts 所有其他用户的物品
 * @returns {Promise<Array>} 匹配结果数组
 */
async function callAgentMatching(userPost, allPosts) {
  try {
    // 构建 API 提示
    const prompt = `用户发布的物品：
- 标题：${userPost.title}
- 描述：${userPost.description || '无'}
- 类型：${userPost.type === 'item' ? 'item' : 'skill'}
- 交易方式：${userPost.tradeMethod}
- 价格：${userPost.price || '未定价'}
- 想要交换的物品：${userPost.exchangeItems || '无特定要求'}

其他用户的物品列表：
${allPosts.map((post, index) => `
${index + 1}. ${post.title}
   - 描述：${post.description || '无'}
   - 类型：${post.type === 'item' ? 'item' : 'skill'}
   - 交易方式：${post.tradeMethod}
   - 价格：${post.price || '未定价'}
   - 想要交换的物品：${post.exchangeItems || '无特定要求'}
   - 物品ID：${post.postId}
`).join('')}

请按匹配分数从高到低排序，只返回 JSON 格式。`

    // 你的 API Key
    const apiKey = 'sk-619e79f8ade74f40b8ed7f427b95aece'

    // 调用通义千问 API
    const response = await uniCloud.httpclient.request({
      method: 'POST',
      url: 'https://dashscope.aliyuncs.com/api/v1/apps/e18f491c8e69493999dd14e8a9737d23/completion',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      data: {
        input: {
          prompt: prompt
        },
        parameters: {}
      },
      dataType: 'json',
      timeout: 30000
    })

    // 解析 API 响应
    if (response.status === 200 && response.data && response.data.output) {
      const aiText = response.data.output.text
      
      // 提取 JSON 数组
      const jsonMatch = aiText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const matches = JSON.parse(jsonMatch[0])
        return matches
      }
    }

    // 如果 API 返回格式不对，使用降级方案
    return simpleMatching(userPost, allPosts)
  } catch (error) {
    console.error('通义千问 API 调用失败:', error)
    // API 失败时使用降级方案
    return simpleMatching(userPost, allPosts)
  }
}

/**
 * 使用简单算法进行匹配（降级方案）
 * @param {Object} userPost 当前用户的物品
 * @param {Array} allPosts 所有其他用户的物品
 * @returns {Array} 匹配结果数组
 */
function simpleMatching(userPost, allPosts) {
  const matches = []

  for (const post of allPosts) {
    let score = 0
    const reasons = []

    // 类型匹配（权重 30%）
    if (post.type === userPost.type) {
      score += 0.3
      reasons.push('类型相同')
    } else {
      score += 0.2
      reasons.push('类型互补')
    }

    // 交易方式匹配（权重 25%）
    if (post.tradeMethod === userPost.tradeMethod) {
      score += 0.25
      reasons.push('交易方式匹配')
    } else if (post.tradeMethod === 'both' || userPost.tradeMethod === 'both') {
      score += 0.2
      reasons.push('交易方式兼容')
    } else if (post.tradeMethod === 'both' && userPost.tradeMethod === 'both') {
      score += 0.25
      reasons.push('交易方式完全兼容')
    }

    // 需求匹配（权重 25%）
    if (userPost.exchangeItems) {
      const exchangeItems = userPost.exchangeItems.split(/[\s,，、]+/)
      for (const item of exchangeItems) {
        if (item && post.title.includes(item)) {
          score += 0.25
          reasons.push(`需求匹配：${item}`)
          break
        }
      }
    }

    // 标题关键词匹配（权重 10%）
    const userKeywords = userPost.title.split(/[\s,，、]+/)
    const postKeywords = post.title.split(/[\s,，、]+/)
    const commonKeywords = userKeywords.filter(k => postKeywords.includes(k))
    if (commonKeywords.length > 0) {
      score += 0.1 * (commonKeywords.length / userKeywords.length)
      if (commonKeywords.length > 0) {
        reasons.push(`关键词匹配: ${commonKeywords.join(', ')}`)
      }
    }

    // 描述相似度（权重 10%）
    if (userPost.description && post.description) {
      const descSimilarity = calculateTextSimilarity(userPost.description, post.description)
      score += 0.1 * descSimilarity
      if (descSimilarity > 0.5) {
        reasons.push('描述相似')
      }
    }

    // 确保分数在 0-1 之间
    score = Math.min(Math.max(score, 0), 1)

    if (score > 0.3) {
      matches.push({
        postId: post.postId,
        matchScore: score,
        matchReason: reasons.slice(0, 3).join('；') || '基本匹配'
      })
    }
  }

  // 按分数排序
  matches.sort((a, b) => b.matchScore - a.matchScore)

  return matches.slice(0, 10) // 返回前 10 个
}

/**
 * 计算文本相似度（简单的词频统计）
 * @param {string} text1 文本1
 * @param {string} text2 文本2
 * @returns {number} 相似度 0-1
 */
function calculateTextSimilarity(text1, text2) {
  const words1 = text1.split(/[\s,，、。.！!？?]+/).filter(w => w.length > 0)
  const words2 = text2.split(/[\s,，、。.！!？?]+/).filter(w => w.length > 0)

  if (words1.length === 0 || words2.length === 0) return 0

  const set1 = new Set(words1)
  const set2 = new Set(words2)

  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

exports.main = async (event, context) => {
  try {
    const params = event.body || event
    const { userId, postId } = params

    if (!userId) {
      return {
        code: 400,
        message: '缺少必要字段: userId'
      }
    }

    // 1. 获取当前用户的物品
    let userPost = null
    if (postId) {
      const userPostResult = await db.collection('posts').doc(postId).get()
      userPost = userPostResult.data
    } else {
      const userPostsResult = await db.collection('posts')
        .where({ userId, status: 'active' })
        .limit(1)
        .get()
      userPost = userPostsResult.data[0]
    }

    if (!userPost) {
      return {
        code: 200,
        message: 'success',
        data: {
          matches: [],
          message: '请先发布物品'
        }
      }
    }

    // 2. 获取所有其他用户的活跃物品
    const allPostsResult = await db.collection('posts')
      .where({
        userId: db.command.neq(userId),
        status: 'active'
      })
      .limit(50) // 限制数量
      .get()

    const allPosts = allPostsResult.data

    if (allPosts.length === 0) {
      return {
        code: 200,
        message: 'success',
        data: {
          matches: [],
          message: '暂无其他用户发布的物品'
        }
      }
    }

    // 3. 调用 Agent 匹配
    let matches = []
    let useAgent = false

    try {
      // 尝试调用 Agent
      matches = await callAgentMatching(userPost, allPosts)
      useAgent = true
    } catch (agentError) {
      console.error('Agent 匹配失败，使用降级方案:', agentError)
    }

    // 4. 如果 Agent 失败，使用简单算法
    if (matches.length === 0) {
      matches = simpleMatching(userPost, allPosts)
    }

    // 5. 补充匹配结果的详细信息
    const matchesWithDetails = []
    for (const match of matches) {
      const post = allPosts.find(p => p.postId === match.postId)
      if (post) {
        matchesWithDetails.push({
          matchId: generateMatchId(),
          postId: match.postId,
          userId: post.userId,
          title: post.title,
          description: post.description,
          type: post.type,
          tradeMethod: post.tradeMethod,
          price: post.price,
          exchangeItems: post.exchangeItems,
          images: post.images || [],
          contact: post.contact,
          matchScore: match.matchScore,
          matchReason: match.matchReason,
          useAgent: useAgent
        })
      }
    }

    // 6. 返回结果
    return {
      code: 200,
      message: 'success',
      data: {
        matches: matchesWithDetails,
        total: matchesWithDetails.length,
        useAgent: useAgent
      }
    }

  } catch (error) {
    console.error('匹配失败:', error)
    
    return {
      code: 500,
      message: error.message || '匹配失败',
      data: {
        matches: [],
        error: error.toString()
      }
    }
  }
}
