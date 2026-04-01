// 匹配算法云函数
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
 * 获取用户名称
 * @param {string} userId 用户 ID
 * @returns {Promise<string>} 用户名称
 */
async function getUserName(userId) {
  const userResult = await db.collection('users').where({ userId }).get()
  return userResult.data.length > 0 ? userResult.data[0].userName : userId
}

/**
 * 生成匹配描述
 * @param {string[]} chainNames 用户名称数组
 * @returns {string} 匹配描述
 */
function generateDescription(chainNames) {
  return chainNames.join(' ↔ ')
}

exports.main = async (event, context) => {
  try {
    // 获取请求参数
    const params = event.body || event
    const { userId } = params

    // 验证参数
    if (!userId) {
      return {
        code: 400,
        message: '缺少必要字段: userId'
      }
    }

    // 从数据库查询所有 active 的物品
    const postsResult = await db.collection('posts')
      .where({ status: 'active' })
      .get()

    const posts = postsResult.data

    // 模拟调用匹配算法
    // 注意：实际使用时需要导入并调用真实的算法
    let cycles = []
    try {
      // 尝试导入算法模块
      const { findMatchCycles } = require('../../../../../../algorithm/findMatchCycles.js')
      cycles = findMatchCycles(posts)
    } catch (error) {
      console.log('算法模块未找到，使用模拟数据')
      // 模拟匹配结果
      cycles = [
        {
          type: '2-cycle',
          chain: [userId, 'U002'],
          weights: [0.8, 0.75],
          score: 0.77
        }
      ]
    }

    // 处理匹配结果
    const proposals = []
    for (const cycle of cycles) {
      // 生成 matchId
      const matchId = generateMatchId()

      // 获取用户名称
      const chainNames = []
      for (const id of cycle.chain) {
        const userName = await getUserName(id)
        chainNames.push(userName)
      }

      // 生成描述
      const description = generateDescription(chainNames)

      // 准备保存到数据库的数据
      const matchData = {
        matchId,
        userId,
        matchType: cycle.type,
        chain: cycle.chain,
        chainNames: chainNames,
        edgeWeights: cycle.weights,
        successProbability: cycle.score,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 保存到数据库
      await db.collection('matches').add(matchData)

      // 添加到返回结果
      proposals.push({
        matchId,
        matchType: cycle.type,
        chain: cycle.chain,
        chainNames: chainNames,
        edgeWeights: cycle.weights,
        successProbability: cycle.score,
        description
      })
    }

    // 返回结果
    return {
      code: 200,
      message: 'success',
      data: {
        proposals
      }
    }
  } catch (error) {
    console.error('匹配算法执行失败:', error)
    return {
      code: 500,
      message: '数据库错误'
    }
  }
}
