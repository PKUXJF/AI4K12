// 测试 SiliconFlow API
const https = require('https');

const API_KEY = 'sk-lqduodenmjylybzcjmquritedcnaojyjnbjmjatvtehqyuzo';
const API_BASE = 'api.siliconflow.cn';
const MODEL = 'Pro/moonshotai/Kimi-K2.5';

function testAPI() {
  console.log('🚀 测试 SiliconFlow API...\n');
  
  const requestBody = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: '你是高中数学特级教师，擅长出题和解题。'
      },
      {
        role: 'user',
        content: '请为导数出一道中档难度的数学题，包含题目、解答和答案。'
      }
    ],
    temperature: 0.7,
    max_tokens: 4096,
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
          console.log('\n📊 Token 使用:', json.usage);
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
