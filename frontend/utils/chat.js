// 聊天工具函数

// 模拟聊天室数据存储
const rooms = {
  'room_1': {
    id: 'room_1',
    name: '交易群聊 1',
    messages: [
      {
        type: 'system',
        content: '欢迎来到交易群聊 1'
      },
      {
        sender: '用户A',
        content: '你好，我对你的物品感兴趣'
      }
    ]
  },
  'room_2': {
    id: 'room_2',
    name: '交易群聊 2',
    messages: [
      {
        type: 'system',
        content: '欢迎来到交易群聊 2'
      },
      {
        sender: '用户B',
        content: '请问这个物品还在吗？'
      }
    ]
  }
}

// 获取助手消息
export function getAssistantMessages(userId) {
  // 模拟数据，实际应该从云函数获取
  return [
    {
      cycleId: 'cycle_1',
      content: '您有一个新的匹配方案，是否接受？',
      status: 'pending'
    },
    {
      cycleId: 'cycle_2',
      content: '您的匹配方案已处理',
      status: 'done'
    }
  ]
}

// 响应循环
export function respondCycle(cycleId, userId, action) {
  // 实际应该调用云函数处理
  console.log('响应循环:', cycleId, userId, action)
  // 这里可以调用 respond 云函数
  /*
  uniCloud.callFunction({
    name: 'respond',
    data: {
      userId: userId,
      matchId: cycleId,
      action: action
    }
  })
  */
}

// 获取聊天室列表
export function getChatRooms(userId) {
  // 模拟数据，实际应该从云函数获取
  return [
    {
      id: 'room_1',
      name: '交易群聊 1'
    },
    {
      id: 'room_2',
      name: '交易群聊 2'
    }
  ]
}

// 创建循环
export function createCycle(cycle) {
  // 实际应该调用云函数处理
  console.log('创建循环:', cycle)
  // 这里可以调用相关云函数
  /*
  uniCloud.callFunction({
    name: 'match',
    data: {
      userId: cycle.users[0]
    }
  })
  */
}

// 获取聊天室信息
export function getRoom(roomId) {
  // 模拟数据，实际应该从云函数获取
  return rooms[roomId] || null
}

// 发送消息
export function sendMessage(roomId, userId, content) {
  // 实际应该调用云函数处理
  console.log('发送消息:', roomId, userId, content)
  
  // 模拟添加消息到聊天室
  if (rooms[roomId]) {
    rooms[roomId].messages.push({
      sender: userId,
      content: content
    })
  }
  
  // 这里可以调用相关云函数
  /*
  uniCloud.callFunction({
    name: 'sendMessage',
    data: {
      roomId: roomId,
      userId: userId,
      content: content
    }
  })
  */
}
