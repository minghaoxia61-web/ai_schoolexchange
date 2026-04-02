<template>
  <view>

    <view 
      v-for="msg in messages" 
      :key="msg.cycleId"
      class="box"
    >
      <view>{{ msg.content }}</view>

      <!-- ✅ 已处理就显示结果 -->
      <view v-if="msg.status === 'done'" class="done">
        已处理
      </view>

      <!-- ✅ 未处理才显示按钮 -->
      <view v-else>
        <button @click="accept(msg.cycleId)">同意</button>
        <button @click="reject(msg.cycleId)">拒绝</button>
      </view>

    </view>

  </view>
</template>

<script>
import { getAssistantMessages, respondCycle } from '@/utils/chat.js'

export default {
  data() {
    return {
      userId: "U1",
      messages: []
    }
  },
  onShow() {
    this.load()
  },
  methods: {
    load() {
      this.messages = getAssistantMessages(this.userId)
    },

    accept(id) {
      respondCycle(id, this.userId, "accept")

      uni.showToast({
        title: "已同意",
        icon: "success"
      })

      this.load()
    },

    reject(id) {
      respondCycle(id, this.userId, "reject")

      uni.showToast({
        title: "已拒绝",
        icon: "none"
      })

      this.load()
    }
  }
}
</script>

<style>
.box {
  padding: 20rpx;
  border-bottom: 1px solid #ddd;
}

.done {
  color: gray;
  margin-top: 10rpx;
}
</style>