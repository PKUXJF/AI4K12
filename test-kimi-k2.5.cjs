// 测试 kimi-k2.5 模型
const https = require('https');

const API_KEY = 'sk-kimi-9Ml0BhDphCFC8b1aicnRkTvDWE4ZgqZFbX1PRhbX4zrDyiQsAItk5QFTeujL6gEx';

function testKimiK25() {
  console.log('🚀 测试 kimi-k2.5 模型...\n');

  const requestBody = {
    model: 'kimi-k2.5',
    messages: [
      {
        role: 'system',
        content: '你是高中数学特级教师，擅长出题和解题。'
      },
      {
        role: 'user',
        content: '请为导数出一道中档题，包含题目、解答和答案。'
      }
    ],
    temperature: 0.7,
    stream: false
  };

  const data = JSON.stringify(requestBody);
  console.log('📤 请求模型: kimi-k2.5');
  console.log('📤 请求体:', JSON.stringify(requestBody, null, 2));
  console.log();

  const options = {
    hostname: 'api.kimi.com',
    path: '/coding/v1/chat/completions',
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
      console.log('\n📥 响应:\n');
      try {
        const json = JSON.parse(responseData);
        console.log(JSON.stringify(json, null, 2));
        
        if (json.choices && json.choices[0]) {
          console.log('\n✅ 成功!\n');
          console.log('📝 内容:\n');
          console.log(json.choices[0].message.content);
        }
      } catch (e) {
        console.log(responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ 请求失败: ${e.message}`);
  });

  req.write(data);
  req.end();
}

testKimiK25();
