<template>
	<view class="register-container">
		<view class="register-box">
			<view class="logo-section">
				<image class="logo" src="/static/logo.png"></image>
				<text class="app-name">注册账号</text>
			</view>
			
			<view class="form-section">
				<view class="input-group">
					<text class="icon">👤</text>
					<input 
						class="input" 
						type="text" 
						v-model="userName" 
						placeholder="请输入用户名"
						maxlength="20"
					/>
				</view>
				
				<view class="input-group">
					<text class="icon">📱</text>
					<input 
						class="input" 
						type="number" 
						v-model="phone" 
						placeholder="请输入手机号" 
						maxlength="11"
					/>
				</view>
				
				<view class="input-group">
					<text class="icon">🔒</text>
					<input 
						class="input" 
						:type="showPassword ? 'text' : 'password'" 
						v-model="password" 
						placeholder="请输入密码（至少6位）"
					/>
					<text class="toggle-password" @click="togglePassword">
						{{ showPassword ? '👁️' : '👁️‍🗨️' }}
					</text>
				</view>
				
				<view class="input-group">
					<text class="icon">🔒</text>
					<input 
						class="input" 
						:type="showConfirmPassword ? 'text' : 'password'" 
						v-model="confirmPassword" 
						placeholder="请再次输入密码"
					/>
					<text class="toggle-password" @click="toggleConfirmPassword">
						{{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
					</text>
				</view>
				
				<button class="register-btn" @click="handleRegister" :disabled="isLoading">
					{{ isLoading ? '注册中...' : '注册' }}
				</button>
				
				<view class="login-link">
					<text class="text">已有账号?</text>
					<text class="link" @click="goToLogin">立即登录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userName: '',
			phone: '',
			password: '',
			confirmPassword: '',
			showPassword: false,
			showConfirmPassword: false,
			isLoading: false
		}
	},
	methods: {
		togglePassword() {
			this.showPassword = !this.showPassword
		},
		
		toggleConfirmPassword() {
			this.showConfirmPassword = !this.showConfirmPassword
		},
		
		async handleRegister() {
			if (!this.validateForm()) {
				return
			}
			
			if (this.isLoading) {
				return
			}
			
			try {
				this.isLoading = true
				
				uni.showLoading({
					title: '注册中...',
					mask: true
				})
				
				const res = await uniCloud.callFunction({
					name: 'uni-id-cf',
					data: {
						action: 'register',
						params: {
							username: this.userName,
							phone: this.phone,
							password: this.password
						}
					}
				})
				
				uni.hideLoading()
				
				if (res.result.code === 0) {
					uni.showToast({
						title: '注册成功',
						icon: 'success',
						duration: 1500
					})
					
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					uni.showToast({
						title: res.result.msg || '注册失败',
						icon: 'none',
						duration: 2000
					})
				}
			} catch (error) {
				uni.hideLoading()
				
				console.error('注册失败:', error)
				
				uni.showToast({
					title: '网络错误，请稍后重试',
					icon: 'none',
					duration: 2000
				})
			} finally {
				this.isLoading = false
			}
		},
		
		validateForm() {
			if (!this.userName || this.userName.trim() === '') {
				uni.showToast({
					title: '请输入用户名',
					icon: 'none'
				})
				return false
			}
			
			if (this.userName.length < 2) {
				uni.showToast({
					title: '用户名至少2个字符',
					icon: 'none'
				})
				return false
			}
			
			if (!this.phone || this.phone.trim() === '') {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				})
				return false
			}
			
			if (!/^1[3-9]\d{9}$/.test(this.phone)) {
				uni.showToast({
					title: '手机号格式不正确',
					icon: 'none'
				})
				return false
			}
			
			if (!this.password || this.password.trim() === '') {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				})
				return false
			}
			
			if (this.password.length < 6) {
				uni.showToast({
					title: '密码长度不能少于6位',
					icon: 'none'
				})
				return false
			}
			
			if (!this.confirmPassword || this.confirmPassword.trim() === '') {
				uni.showToast({
					title: '请确认密码',
					icon: 'none'
				})
				return false
			}
			
			if (this.password !== this.confirmPassword) {
				uni.showToast({
					title: '两次密码不一致',
					icon: 'none'
				})
				return false
			}
			
			return true
		},
		
		goToLogin() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.register-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 100rpx 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.register-box {
	width: 100%;
	background: #ffffff;
	border-radius: 30rpx;
	padding: 80rpx 60rpx;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
}

.logo-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 80rpx;
}

.logo {
	width: 160rpx;
	height: 160rpx;
	margin-bottom: 30rpx;
}

.app-name {
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
}

.form-section {
	width: 100%;
}

.input-group {
	display: flex;
	align-items: center;
	background: #f5f5f5;
	border-radius: 15rpx;
	padding: 25rpx 30rpx;
	margin-bottom: 30rpx;
	position: relative;
}

.icon {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.input {
	flex: 1;
	font-size: 32rpx;
	color: #333;
}

.toggle-password {
	font-size: 40rpx;
	padding: 10rpx;
}

.register-btn {
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
	margin-bottom: 40rpx;
	border: none;
	margin-top: 50rpx;
}

.register-btn[disabled] {
	opacity: 0.6;
}

.login-link {
	display: flex;
	justify-content: center;
	align-items: center;
}

.text {
	font-size: 28rpx;
	color: #666;
	margin-right: 10rpx;
}

.link {
	font-size: 28rpx;
	color: #667eea;
	font-weight: bold;
}
</style>
