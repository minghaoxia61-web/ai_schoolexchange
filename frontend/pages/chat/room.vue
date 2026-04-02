<template>
  <view class="container">

    <view v-for="(msg,index) in messages" :key="index">

      <view v-if="msg.type === 'system'" class="system">
        {{ msg.content }}
      </view>

      <view v-else class="msg">
        {{ msg.sender }}：{{ msg.content }}
      </view>

    </view>

    <view class="inputBox">
      <input v-model="input" placeholder="输入消息"/>
      <button @click="send">发送</button>
    </view>

  </view>
</template>

<script>
import { getRoom, sendMessage } from '@/utils/chat.js'

export default {
  data() {
    return {
      roomId: "",
      userId: "U1",
      messages: [],
      input: ""
    }
  },
  onLoad(options) {
    this.roomId = options.id
    this.load()
  },
  methods: {
    load() {
      const room = getRoom(this.roomId)
      if (room) {
        this.messages = room.messages
      }
    },
    send() {
      if (!this.input) return

      sendMessage(this.roomId, this.userId, this.input)
      this.input = ""
      this.load()
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
}

.system {
  text-align: center;
  color: gray;
  margin: 20rpx 0;
}

.msg {
  margin: 10rpx;
}

.inputBox {
  display: flex;
}
</style>