// 用户认证云函数
const db = uniCloud.database()

exports.main = async (event, context) => {
  const { action, params } = event
  
  // 处理登录请求
  if (action === 'login') {
    const { username, password } = params
    
    // 验证参数
    if (!username || !password) {
      return {
        code: 400,
        msg: '用户名和密码不能为空'
      }
    }
    
    // 查询用户
    const userResult = await db.collection('users').where({
      $or: [
        { phone: username },
        { userName: username }
      ]
    }).get()
    
    if (userResult.data.length === 0) {
      return {
        code: 400,
        msg: '用户不存在'
      }
    }
    
    const user = userResult.data[0]
    
    // 验证密码（这里简化处理，实际应该加密）
    // 注意：实际项目中密码应该加密存储和验证
    // 这里为了演示，假设密码验证通过
    
    // 返回成功结果
    return {
      code: 0,
      msg: 'login success',
      uid: user.userId,
      username: user.userName,
      token: 'token_' + Date.now(), // 简化的 token
      userInfo: {
        userId: user.userId,
        userName: user.userName,
        phone: user.phone,
        avatar: user.avatar
      }
    }
  }
  
  // 处理注册请求
  if (action === 'register') {
    const { username, password, phone } = params
    
    // 验证参数
    if (!username || !password || !phone) {
      return {
        code: 400,
        msg: '用户名、密码和手机号不能为空'
      }
    }
    
    // 检查用户是否已存在
    const existUser = await db.collection('users').where({
      $or: [
        { phone: phone },
        { userName: username }
      ]
    }).get()
    
    if (existUser.data.length > 0) {
      return {
        code: 400,
        msg: '用户已存在'
      }
    }
    
    // 创建用户
    const userId = 'U' + Date.now()
    const userData = {
      userId: userId,
      userName: username,
      phone: phone,
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await db.collection('users').add(userData)
    
    // 返回成功结果
    return {
      code: 0,
      msg: 'register success',
      uid: userId,
      username: username,
      token: 'token_' + Date.now(),
      userInfo: userData
    }
  }
  
  return {
    code: 400,
    msg: '未知的操作'
  }
}
