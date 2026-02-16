// 测试 coding 端点支持的模型
const https = require('https');

const API_KEY = 'sk-kimi-9Ml0BhDphCFC8b1aicnRkTvDWE4ZgqZFbX1PRhbX4zrDyiQsAItk5QFTeujL6gEx';

function testModels() {
  console.log('🚀 测试 coding 端点模型列表...\n');

  const options = {
    hostname: 'api.kimi.com',
    path: '/coding/v1/models',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
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
        console.log('\n📋 可用模型:\n');
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('\n❌ 响应:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ 请求失败: ${e.message}`);
  });

  req.end();
}

testModels();
