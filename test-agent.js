const https = require('https')

const apiKey = 'sk-619e79f8ade74f40b8ed7f427b95aece'
const appId = 'e18f491c8e69493999dd14e8a9737d23'

const data = JSON.stringify({
  input: {
    prompt: '你是谁？'
  },
  parameters: {}
})

const options = {
  hostname: 'dashscope.aliyuncs.com',
  port: 443,
  path: `/api/v1/apps/${appId}/completion`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': data.length
  }
}

console.log('开始测试 Agent API...')
console.log('请求数据:', data)

const req = https.request(options, (res) => {
  let responseBody = ''

  res.on('data', (chunk) => {
    responseBody += chunk
  })

  res.on('end', () => {
    console.log('响应状态码:', res.statusCode)
    console.log('响应内容:', responseBody)
  })
})

req.on('error', (error) => {
  console.error('请求失败:', error)
})

req.write(data)
req.end()
