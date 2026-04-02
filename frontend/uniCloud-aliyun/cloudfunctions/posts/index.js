// 获取物品列表云函数
const db = uniCloud.database()
const $ = db.command

exports.main = async (event, context) => {
  try {
    // 获取查询参数
    const { page = 1, pageSize = 10, type = 'all', keyword = '' } = event.queryStringParameters || event

    // 验证参数
    const pageNum = parseInt(page) || 1
    let pageSizeNum = parseInt(pageSize) || 10
    
    // 限制 pageSize 最大不超过 50
    if (pageSizeNum > 50) {
      pageSizeNum = 50
    }

    // 计算偏移量
    const offset = (pageNum - 1) * pageSizeNum

    // 构建查询条件
    let whereCondition = {
      status: 'active'
    }

    // 按类型筛选
    if (type !== 'all' && ['item', 'skill'].includes(type)) {
      whereCondition.type = type
    }

    // 按关键词搜索
    if (keyword) {
      whereCondition = $.and([
        whereCondition,
        $.or([
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ])
      ])
    }

    // 查询总数
    const countResult = await db.collection('posts').where(whereCondition).count()
    const total = countResult.total

    // 查询分页数据
    let posts = await db.collection('posts')
      .where(whereCondition)
      .orderBy('createdAt', 'desc')
      .skip(offset)
      .limit(pageSizeNum)
      .get()

    // 处理数据，尝试关联用户表获取 userName
    const postList = []
    for (const post of posts.data) {
      let userName = '匿名用户'
      
      try {
        // 尝试查询用户信息
        const userResult = await db.collection('users').where({ userId: post.userId }).get()
        if (userResult.data.length > 0 && userResult.data[0].userName) {
          userName = userResult.data[0].userName
        }
      } catch (error) {
        // 如果查询用户失败，使用默认值
        console.log('查询用户信息失败:', error)
      }

      // 构建返回数据
      postList.push({
        postId: post.postId,
        userId: post.userId,
        userName: userName,
        type: post.type,
        title: post.title,
        description: post.description,
        tradeMethod: post.tradeMethod,
        price: post.price || '',
        exchangeItems: post.exchangeItems || '',
        images: post.images || [],
        contact: post.contact,
        createdAt: post.createdAt
      })
    }

    // 返回结果
    return {
      code: 200,
      message: 'success',
      data: {
        list: postList,
        total: total,
        page: pageNum,
        pageSize: pageSizeNum
      }
    }
  } catch (error) {
    console.error('获取物品列表失败:', error)
    return {
      code: 500,
      message: '数据库错误: ' + error.message
    }
  }
}
