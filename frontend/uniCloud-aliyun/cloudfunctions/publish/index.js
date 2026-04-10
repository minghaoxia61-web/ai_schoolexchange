// 发布物品云函数
const db = uniCloud.database()

/**
 * 生成唯一的 postId
 * @returns {string} 格式为 post_{timestamp}_{random}
 */
function generatePostId() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 6)
  return `post_${timestamp}_${random}`
}

/**
 * 验证发布物品的参数
 * @param {Object} params 请求参数
 * @returns {Object} 验证结果，包含 code 和 message
 */
function validateParams(params) {
  // 验证必填字段
  const requiredFields = ['userId', 'type', 'title', 'description', 'tradeMethod', 'contact']
  for (const field of requiredFields) {
    if (!params[field]) {
      return { code: 400, message: `缺少必要字段: ${field}` }
    }
  }

  // 验证 type 字段
  if (!['item', 'skill'].includes(params.type)) {
    return { code: 400, message: 'type 字段只能是 item 或 skill' }
  }

  // 验证 title 字段长度
  if (params.title.length < 1 || params.title.length > 200) {
    return { code: 400, message: 'title 字段长度必须在 1-200 之间' }
  }

  // 验证 description 字段长度
  if (params.description.length < 1 || params.description.length > 500) {
    return { code: 400, message: 'description 字段长度必须在 1-500 之间' }
  }

  // 验证 tradeMethod 字段
  if (!['money', 'exchange', 'both'].includes(params.tradeMethod)) {
    return { code: 400, message: 'tradeMethod 字段只能是 money、exchange 或 both' }
  }

  // 验证价格字段
  if (['money', 'both'].includes(params.tradeMethod) && !params.price) {
    return { code: 400, message: '当 tradeMethod 为 money 或 both 时，price 字段为必填' }
  }

  // 验证交换物品字段
  if (['exchange', 'both'].includes(params.tradeMethod) && !params.exchangeItems) {
    return { code: 400, message: '当 tradeMethod 为 exchange 或 both 时，exchangeItems 字段为必填' }
  }

  return { code: 200, message: 'success' }
}

exports.main = async (event, context) => {
  try {
    // 获取请求参数
    const params = event.body || event

    // 验证参数
    const validationResult = validateParams(params)
    if (validationResult.code !== 200) {
      return validationResult
    }

    // 生成唯一的 postId
    const postId = generatePostId()

    // 准备数据
    const postData = {
      postId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      description: params.description,
      tradeMethod: params.tradeMethod,
      price: params.price || '',
      exchangeItems: params.exchangeItems || '',
      images: params.images || [],
      contact: params.contact,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 保存到数据库
    await db.collection('posts').add(postData)

    // 返回成功结果
    // 7. 返回结果
    const result = {
      code: 200,
      message: 'success',
      data: { postId }
    }
    
    console.log('发布成功，返回结果:', JSON.stringify(result))
    return result

  } catch (error) {
    console.error('发布物品失败:', error)
    return {
      code: 500,
      message: '数据库错误'
    }
  }
}
