// test-api.js - 使用标准 KIMI 模型测试
const https = require('https');

const API_KEY = 'sk-kimi-9Ml0BhDphCFC8b1aicnRkTvDWE4ZgqZFbX1PRhbX4zrDyiQsAItk5QFTeujL6gEx';
const API_BASE = 'api.moonshot.cn';  // 标准 API 地址
const MODEL = 'moonshot-v1-8k';      // 标准模型

function testAPI() {
  console.log('🚀 测试标准 KIMI API...\n');
  
  const prompt = '你是高中数学特级教师，请为导数出一道中档题，包含题目、解答和答案。';

  const requestBody = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: '你是高中数学特级教师，擅长出题和解题。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    stream: false
  };
  
  const data = JSON.stringify(requestBody);

  const options = {
    hostname: API_BASE,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📡 状态码: ${res.statusCode}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(responseData);
        if (json.choices && json.choices[0]) {
          console.log('\n✅ API 调用成功！\n');
          console.log('📝 生成的题目:\n');
          console.log(json.choices[0].message.content);
        } else {
          console.log('\n❌ 错误:', JSON.stringify(json, null, 2));
        }
      } catch (e) {
        console.log('\n❌ 响应:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ 请求失败: ${e.message}`);
  });

  req.write(data);
  req.end();
}

testAPI();
