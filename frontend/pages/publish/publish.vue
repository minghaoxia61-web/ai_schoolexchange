<template>
	<view class="publish-container">
		<view class="form-card">
			<view class="form-item">
				<text class="label">发布类型</text>
				<view class="type-selector">
					<view 
						class="type-item" 
						:class="{ active: formData.type === 'item' }"
						@click="selectType('item')"
					>
						<text class="icon">📦</text>
						<text class="text">闲置物品</text>
					</view>
					<view 
						class="type-item" 
						:class="{ active: formData.type === 'skill' }"
						@click="selectType('skill')"
					>
						<text class="icon">🎯</text>
						<text class="text">技能服务</text>
					</view>
				</view>
			</view>

			<view class="form-item">
				<text class="label">标题</text>
				<input 
					class="input" 
					v-model="formData.title" 
					placeholder="请输入标题"
					maxlength="50"
				/>
			</view>

			<view class="form-item">
				<text class="label">描述</text>
				<textarea 
					class="textarea" 
					v-model="formData.description" 
					placeholder="请详细描述物品或服务信息"
					maxlength="500"
				/>
			</view>

			<view class="form-item">
				<text class="label">接受的交易方式</text>
				<view class="trade-method-selector">
					<view 
						class="method-item" 
						:class="{ active: formData.tradeMethod === 'money' }"
						@click="selectTradeMethod('money')"
					>
						<text class="method-icon">💰</text>
						<text class="method-text">金钱交易</text>
					</view>
					<view 
						class="method-item" 
						:class="{ active: formData.tradeMethod === 'exchange' }"
						@click="selectTradeMethod('exchange')"
					>
						<text class="method-icon">🔄</text>
						<text class="method-text">物品互换</text>
					</view>
					<view 
						class="method-item" 
						:class="{ active: formData.tradeMethod === 'both' }"
						@click="selectTradeMethod('both')"
					>
						<text class="method-icon">🤝</text>
						<text class="method-text">均可</text>
					</view>
				</view>
			</view>

			<view class="form-item" v-if="formData.tradeMethod === 'money'">
				<text class="label">价格</text>
				<input 
					class="input" 
					v-model="formData.price" 
					type="digit" 
					placeholder="请输入价格"
				/>
			</view>

			<view class="form-item" v-if="formData.tradeMethod === 'exchange'">
				<text class="label">可接受的交易物品</text>
				<view class="exchange-input-wrapper">
					<input 
						class="input" 
						v-model="formData.exchangeItems" 
						placeholder="请输入可接受的交易物品"
						@focus="showHistorySuggestions"
					/>
					<view 
						class="history-hint" 
						v-if="hasHistoryItems && showHint"
						@click="selectHistoryItem"
					>
						<text class="hint-icon">💡</text>
						<text class="hint-text">选择历史发布</text>
					</view>
				</view>
				<view class="history-suggestions" v-if="showHistoryList">
					<view 
						class="suggestion-item" 
						v-for="(item, index) in historyItems" 
						:key="index"
						@click="selectHistoryItem(item)"
					>
						<text class="suggestion-title">{{ item.title }}</text>
						<text class="suggestion-type">{{ item.type === 'item' ? '闲置物品' : '技能服务' }}</text>
					</view>
				</view>
			</view>

			<view class="form-item" v-if="formData.tradeMethod === 'both'">
				<text class="label">价格（可选）</text>
				<input 
					class="input" 
					v-model="formData.price" 
					type="digit" 
					placeholder="请输入价格（可选）"
				/>
			</view>

			<view class="form-item" v-if="formData.tradeMethod === 'both'">
				<text class="label">可接受的交易物品（可选）</text>
				<view class="exchange-input-wrapper">
					<input 
						class="input" 
						v-model="formData.exchangeItems" 
						placeholder="请输入可接受的交易物品（可选）"
						@focus="showHistorySuggestions"
					/>
					<view 
						class="history-hint" 
						v-if="hasHistoryItems && showHint"
						@click="toggleHistoryList"
					>
						<text class="hint-icon">💡</text>
						<text class="hint-text">选择历史发布</text>
					</view>
				</view>
				<view class="history-suggestions" v-if="showHistoryList">
					<view 
						class="suggestion-item" 
						v-for="(item, index) in historyItems" 
						:key="index"
						@click="selectHistoryItem(item)"
					>
						<text class="suggestion-title">{{ item.title }}</text>
						<text class="suggestion-type">{{ item.type === 'item' ? '闲置物品' : '技能服务' }}</text>
					</view>
				</view>
			</view>

			<view class="form-item">
				<text class="label">图片上传</text>
				<view class="upload-area">
					<view class="upload-btn" @click="chooseImage">
						<text class="upload-icon">📷</text>
						<text class="upload-text">点击上传</text>
					</view>
					<view class="image-list">
						<view 
							class="image-item" 
							v-for="(item, index) in formData.images" 
							:key="index"
						>
							<image class="image" :src="item" mode="aspectFill"></image>
							<view class="delete-btn" @click="deleteImage(index)">×</view>
						</view>
					</view>
				</view>
			</view>

			<view class="form-item">
				<text class="label">联系方式</text>
				<input 
					class="input" 
					v-model="formData.contact" 
					placeholder="请输入联系方式"
				/>
			</view>

			<button class="submit-btn" @click="handleSubmit" :disabled="isSubmitting">
				{{ isSubmitting ? '发布中...' : '发布' }}
			</button>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'

// 表单数据
const formData = reactive({
	type: 'item',
	title: '',
	description: '',
	tradeMethod: 'money',
	price: '',
	exchangeItems: '',
	images: [],
	contact: ''
})

// 是否正在提交
const isSubmitting = ref(false)

// 是否显示提示
const showHint = ref(false)
// 是否显示历史列表
const showHistoryList = ref(false)

// 历史发布记录
const historyItems = ref([
	{
		id: 1,
		title: '二手笔记本电脑',
		type: 'item'
	},
	{
		id: 2,
		title: '英语口语陪练',
		type: 'skill'
	},
	{
		id: 3,
		title: '吉他教学',
		type: 'skill'
	}
])

// 是否有历史记录
const hasHistoryItems = computed(() => {
	return historyItems.value.length > 0
})

// 选择发布类型
const selectType = (type) => {
	formData.type = type
}

// 选择交易方式
const selectTradeMethod = (method) => {
	formData.tradeMethod = method
	showHint.value = true
}

// 显示历史建议
const showHistorySuggestions = () => {
	if (hasHistoryItems.value && (formData.tradeMethod === 'exchange' || formData.tradeMethod === 'both')) {
		showHint.value = true
	}
}

// 切换历史列表显示
const toggleHistoryList = () => {
	showHistoryList.value = !showHistoryList.value
}

// 选择历史记录项
const selectHistoryItem = (item) => {
	if (typeof item === 'object') {
		formData.exchangeItems = item.title
	} else {
		showHistoryList.value = !showHistoryList.value
	}
	showHint.value = false
}

// 选择图片
const chooseImage = () => {
	uni.chooseImage({
		count: 9 - formData.images.length,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			formData.images.push(...res.tempFilePaths)
		}
	})
}

// 删除图片
const deleteImage = (index) => {
	formData.images.splice(index, 1)
}

// 表单验证
const validateForm = () => {
	// 验证标题
	if (!formData.title || formData.title.trim() === '') {
		uni.showToast({
			title: '请输入标题',
			icon: 'none'
		})
		return false
	}

	// 验证描述
	if (!formData.description || formData.description.trim() === '') {
		uni.showToast({
			title: '请输入描述',
			icon: 'none'
		})
		return false
	}

	// 验证价格（当交易方式为金钱或均可时）
	if (formData.tradeMethod === 'money' && (!formData.price || formData.price.trim() === '')) {
		uni.showToast({
			title: '请输入价格',
			icon: 'none'
		})
		return false
	}

	// 验证交换物品（当交易方式为交换时）
	if (formData.tradeMethod === 'exchange' && (!formData.exchangeItems || formData.exchangeItems.trim() === '')) {
		uni.showToast({
			title: '请输入可接受的交易物品',
			icon: 'none'
		})
		return false
	}

	// 验证联系方式
	if (!formData.contact || formData.contact.trim() === '') {
		uni.showToast({
			title: '请输入联系方式',
			icon: 'none'
		})
		return false
	}

	return true
}

// 清空表单
const resetForm = () => {
	formData.type = 'item'
	formData.title = ''
	formData.description = ''
	formData.tradeMethod = 'money'
	formData.price = ''
	formData.exchangeItems = ''
	formData.images = []
	formData.contact = ''
}

// 发布成功后
async function publishSuccess() {
  uni.showToast({
    title: '发布成功',
    icon: 'success'
  });
  
  // 延迟 1.5 秒后返回首页
  setTimeout(() => {
    // 使用 reLaunch 而不是 navigateTo，这样会重新加载首页
    uni.reLaunch({
      url: '/pages/index/index'
    });
  }, 1500);
}

// 提交表单
const handleSubmit = async () => {
	// 验证表单
	if (!validateForm()) {
		return
	}

	// 如果正在提交，直接返回
	if (isSubmitting.value) {
		return
	}

	try {
		// 设置提交状态
		isSubmitting.value = true

		// 显示加载提示
		uni.showLoading({
			title: '发布中...',
			mask: true
		})

		// 调用云函数发布物品
		const res = await uniCloud.callFunction({
			name: 'publish',
			data: {
				userId: 'U001', // TODO: 实际应该从登录信息获取
				type: formData.type,
				title: formData.title.trim(),
				description: formData.description.trim(),
				tradeMethod: formData.tradeMethod,
				price: formData.price.trim(),
				exchangeItems: formData.exchangeItems.trim(),
				images: formData.images,
				contact: formData.contact.trim()
			}
		})

		// 隐藏加载提示
		uni.hideLoading()

		// 处理返回结果
		if (res.result.code === 200) {
			// 发布成功
			await publishSuccess()

			// 清空表单
			resetForm()
		} else {
			// 发布失败，显示错误信息
			uni.showToast({
				title: res.result.message || '发布失败',
				icon: 'none',
				duration: 2000
			})
		}
	} catch (error) {
		// 隐藏加载提示
		uni.hideLoading()
		
		console.error('发布失败:', error)
		
		// 显示错误提示
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none',
			duration: 2000
		})
	} finally {
		// 取消提交状态
		isSubmitting.value = false
	}
}

// 页面加载时获取历史记录
onMounted(() => {
	const savedHistory = uni.getStorageSync('publishHistory')
	if (savedHistory) {
		historyItems.value = savedHistory
	}
})
</script>

<style scoped>
.publish-container {
	min-height: 100vh;
	background: #f5f5f5;
	padding: 30rpx;
}

.form-card {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 40rpx 30rpx;
}

.form-item {
	margin-bottom: 40rpx;
	position: relative;
}

.label {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

.type-selector {
	display: flex;
	gap: 20rpx;
}

.type-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 15rpx;
	background: #fafafa;
}

.type-item.active {
	border-color: #667eea;
	background: #f0f3ff;
}

.type-item .icon {
	font-size: 48rpx;
	margin-bottom: 10rpx;
}

.type-item .text {
	font-size: 28rpx;
	color: #666;
}

.type-item.active .text {
	color: #667eea;
	font-weight: bold;
}

.trade-method-selector {
	display: flex;
	gap: 15rpx;
}

.method-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 25rpx 15rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	background: #fafafa;
}

.method-item.active {
	border-color: #667eea;
	background: #f0f3ff;
}

.method-icon {
	font-size: 40rpx;
	margin-bottom: 8rpx;
}

.method-text {
	font-size: 24rpx;
	color: #666;
}

.method-item.active .method-text {
	color: #667eea;
	font-weight: bold;
}

.input {
	width: 100%;
	height: 80rpx;
	background: #f5f5f5;
	border-radius: 10rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
}

.textarea {
	width: 100%;
	min-height: 200rpx;
	background: #f5f5f5;
	border-radius: 10rpx;
	padding: 20rpx;
	font-size: 28rpx;
}

.exchange-input-wrapper {
	position: relative;
}

.history-hint {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	padding: 10rpx 15rpx;
	background: #fff7e6;
	border-radius: 8rpx;
	border: 1rpx solid #ffd591;
}

.hint-icon {
	font-size: 24rpx;
	margin-right: 8rpx;
}

.hint-text {
	font-size: 22rpx;
	color: #fa8c16;
}

.history-suggestions {
	position: absolute;
	top: 90rpx;
	left: 0;
	right: 0;
	background: #ffffff;
	border-radius: 10rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	z-index: 100;
	max-height: 400rpx;
	overflow-y: auto;
}

.suggestion-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 25rpx 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.suggestion-item:last-child {
	border-bottom: none;
}

.suggestion-title {
	font-size: 28rpx;
	color: #333;
	flex: 1;
}

.suggestion-type {
	font-size: 22rpx;
	color: #667eea;
	background: #f0f3ff;
	padding: 5rpx 12rpx;
	border-radius: 5rpx;
	margin-left: 20rpx;
}

.upload-area {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.upload-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 200rpx;
	height: 200rpx;
	background: #f5f5f5;
	border-radius: 15rpx;
	border: 2rpx dashed #ddd;
}

.upload-icon {
	font-size: 60rpx;
	margin-bottom: 10rpx;
}

.upload-text {
	font-size: 24rpx;
	color: #999;
}

.image-list {
	display: flex;
	flex-wrap: wrap;
	gap: 15rpx;
}

.image-item {
	position: relative;
	width: 200rpx;
	height: 200rpx;
}

.image {
	width: 100%;
	height: 100%;
	border-radius: 10rpx;
}

.delete-btn {
	position: absolute;
	top: -10rpx;
	right: -10rpx;
	width: 40rpx;
	height: 40rpx;
	background: #ff4d4f;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: bold;
}

.submit-btn {
	width: 100%;
	height: 90rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border-radius: 45rpx;
	font-size: 36rpx;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 20rpx;
	border: none;
}

.submit-btn[disabled] {
	opacity: 0.6;
}
</style>