// 处理用户对匹配方案响应的云函数
const db = uniCloud.database()

exports.main = async (event, context) => {
  try {
    // 获取请求参数
    const params = event.body || event
    const { userId, matchId, action } = params

    // 验证参数
    if (!userId || !matchId || !action) {
      return {
        code: 400,
        message: '缺少必要字段'
      }
    }

    // 验证 action 字段
    if (!['accept', 'reject'].includes(action)) {
      return {
        code: 400,
        message: 'action 字段只能是 accept 或 reject'
      }
    }

    // 从数据库查询匹配记录
    const matchResult = await db.collection('matches').where({ matchId }).get()
    if (matchResult.data.length === 0) {
      return {
        code: 400,
        message: '匹配不存在'
      }
    }

    const match = matchResult.data[0]

    // 验证匹配状态是否为 pending
    if (match.status !== 'pending') {
      return {
        code: 400,
        message: '匹配状态不是 pending'
      }
    }

    // 验证用户是否在 chain 中
    if (!match.chain.includes(userId)) {
      return {
        code: 400,
        message: '用户不在匹配链中'
      }
    }

    // 准备更新数据
    const updateData = {
      status: action === 'accept' ? 'accepted' : 'rejected',
      updatedAt: new Date().toISOString()
    }

    // 更新匹配状态
    await db.collection('matches').where({ matchId }).update(updateData)

    // 返回更新结果
    return {
      code: 200,
      message: 'success',
      data: {
        matchId,
        status: updateData.status
      }
    }
  } catch (error) {
    console.error('处理匹配响应失败:', error)
    return {
      code: 500,
      message: '数据库错误'
    }
  }
}
