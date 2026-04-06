// 匹配算法云函数 - 集成 findMatchCycles 算法
const db = uniCloud.database()
const { findMatchCycles } = require('./findMatchCycles.js')

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
 * 获取用户名称
 * @param {string} userId 用户 ID
 * @returns {Promise<string>} 用户名称
 */
async function getUserName(userId) {
  try {
    const userResult = await db.collection('users').where({ userId }).get()
    return userResult.data.length > 0 ? userResult.data[0].userName : userId
  } catch (error) {
    console.error('获取用户名称失败:', error)
    return userId
  }
}

/**
 * 将数据库物品格式转换为算法期望的格式
 * @param {Object} post 数据库中的物品对象
 * @param {string} type 类型：'offer' 或 'want'
 * @returns {Object} 算法期望的标签格式
 */
function convertPostToTag(post, type) {
  if (!post || !post.title) return null
  
  // 基础属性
  const attributes = {
    description: post.description || '',
    brand: '通用',
    model: post.type === 'item' ? '物品' : '技能',
    condition: 0.8,
    price: parseFloat(post.price) || 0,
    level: 0.7,
    recognition: 0.7,
    experience: 1,
    certification: ''
  }

  // 根据交易方式调整属性
  if (post.tradeMethod === 'money') {
    attributes.price = parseFloat(post.price) || 0
    attributes.condition = 0.9
  } else if (post.tradeMethod === 'exchange') {
    attributes.description = post.exchangeItems || post.description || ''
  } else if (post.tradeMethod === 'both') {
    attributes.price = parseFloat(post.price) || 0
    attributes.description = `${post.description || ''} ${post.exchangeItems || ''}`.trim()
  }

  return {
    tag: post.title,
    attributes: attributes
  }
}

/**
 * 将数据库物品列表转换为算法期望的用户数据格式
 * @param {Array} posts 数据库物品列表
 * @returns {Promise<Array>} 算法期望的用户数据数组
 */
async function convertPostsToUserData(posts) {
  const userDataMap = new Map()

  for (const post of posts) {
    const userId = post.userId
    
    if (!userDataMap.has(userId)) {
      const userName = await getUserName(userId)
      userDataMap.set(userId, {
        userId: userId,
        userName: userName,
        offerTags: [],
        wantTags: []
      })
    }

    const userData = userDataMap.get(userId)

    // 将当前用户的物品作为 offer
    const offerTag = convertPostToTag(post, 'offer')
    if (offerTag) {
      userData.offerTags.push(offerTag)
    }

    // 根据交换需求生成 want
    if (post.tradeMethod === 'exchange' && post.exchangeItems) {
      const wantPost = {
        ...post,
        title: post.exchangeItems.split('、')[0] || post.exchangeItems,
        description: `想要交换${post.exchangeItems}`,
        tradeMethod: 'both'
      }
      const wantTag = convertPostToTag(wantPost, 'want')
      if (wantTag) {
        userData.wantTags.push(wantTag)
      }
    }
  }

  return Array.from(userDataMap.values())
}

/**
 * 将算法返回的 cycles 格式转换为前端期望的 matches 格式
 * @param {Array} cycles 算法返回的闭环数组
 * @param {string} userId 当前用户ID
 * @returns {Array} 前端期望的匹配结果数组
 */
function convertCyclesToMatches(cycles, userId) {
  if (!cycles || !cycles.cycles || cycles.cycles.length === 0) {
    return []
  }

  const matches = []
  
  for (const cycle of cycles.cycles) {
    // 只保留包含当前用户的匹配
    if (!cycle.path.includes(userId)) continue

    const match = {
      matchId: generateMatchId(),
      matchType: cycle.type === 'pair' ? '2-cycle' : 
                cycle.type === 'triangle' ? '3-cycle' : '4-cycle',
      chain: cycle.path,
      chainNames: cycle.details.map(d => d.userName),
      edgeWeights: [cycle.probability],
      successProbability: cycle.probability,
      description: `${cycle.tags.join(' ↔ ')} 匹配成功`,
      matchScore: cycle.probability,
      matchReason: generateMatchReason(cycle),
      tags: cycle.tags,
      scarcityWeight: cycle.scarcityWeight
    }

    matches.push(match)
  }

  // 按匹配分数排序
  matches.sort((a, b) => b.matchScore - a.matchScore)

  return matches
}

/**
 * 生成匹配原因描述
 * @param {Object} cycle 匹配闭环对象
 * @returns {string} 匹配原因
 */
function generateMatchReason(cycle) {
  if (!cycle || !cycle.tags || cycle.tags.length < 2) {
    return '物品匹配成功'
  }

  const reasons = [
    `物品类型相似，都是${cycle.tags[0]}相关`,
    `供需互补，可以形成交换`,
    `匹配度高，推荐优先考虑`,
    `稀缺性高，建议尽快确认`
  ]

  const index = Math.floor(Math.random() * reasons.length)
  return reasons[index]
}

exports.main = async (event, context) => {
  try {
    // 获取请求参数
    const params = event.body || event
    const { userId, postId } = params

    // 验证参数
    if (!userId) {
      return {
        code: 400,
        message: '缺少必要字段: userId'
      }
    }

    // 1. 获取当前用户的物品
    let userPosts = []
    if (postId) {
      // 如果指定了 postId，获取该物品
      const userPostResult = await db.collection('posts').doc(postId).get()
      if (userPostResult.data) {
        userPosts = [userPostResult.data]
      }
    } else {
      // 否则获取当前用户的所有物品
      const userPostsResult = await db.collection('posts')
        .where({ userId, status: 'active' })
        .get()
      userPosts = userPostsResult.data
    }

    // 2. 获取所有其他用户的活跃物品
    const allPostsResult = await db.collection('posts')
      .where({
        userId: db.command.neq(userId),
        status: 'active'
      })
      .limit(100)
      .get()

    const allOtherPosts = allPostsResult.data

    // 合并所有物品
    const allPosts = [...userPosts, ...allOtherPosts]

    // 检查是否有物品数据
    if (!allPosts || allPosts.length === 0) {
      return {
        code: 200,
        message: 'success',
        data: {
          matches: [],
          message: '暂无可用物品进行匹配'
        }
      }
    }

    // 3. 转换数据格式为算法期望的格式
    const userData = await convertPostsToUserData(allPosts)

    // 检查转换后的数据
    if (!userData || userData.length === 0) {
      return {
        code: 200,
        message: 'success',
        data: {
          matches: [],
          message: '数据处理失败'
        }
      }
    }

    // 4. 调用匹配算法
    const algorithmResult = findMatchCycles(userData, 0.5)

    // 5. 转换结果格式
    const matches = convertCyclesToMatches(algorithmResult, userId)

    // 6. 保存匹配结果到数据库（可选）
    for (const match of matches) {
      try {
        const matchData = {
          matchId: match.matchId,
          userId: userId,
          matchType: match.matchType,
          chain: match.chain,
          chainNames: match.chainNames,
          edgeWeights: match.edgeWeights,
          successProbability: match.successProbability,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await db.collection('matches').add(matchData)
      } catch (saveError) {
        console.error('保存匹配结果失败:', saveError)
        // 继续处理其他匹配结果
      }
    }

    // 7. 返回结果
    return {
      code: 200,
      message: 'success',
      data: {
        matches: matches,
        total: matches.length,
        algorithmInfo: {
          executionTime: algorithmResult.performance ? (algorithmResult.performance.executionTime || 0) : 0,
          totalEdges: algorithmResult.performance ? (algorithmResult.performance.totalEdges || 0) : 0,
          avgProbability: algorithmResult.performance ? (algorithmResult.performance.avgProbability || 0) : 0,
          supplyDemand: algorithmResult.supplyDemand || {}
        }
      }
    }

  } catch (error) {
    console.error('匹配算法执行失败:', error)
    
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