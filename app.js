const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 결과를 저장할 배열
let results = [];

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// CORS 설정 (클라이언트와 서버 간 통신을 가능하게 함)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 서버에서 결과를 저장할 때
app.post('/saveResult', (req, res) => {
  const resultText = req.body.resultText;
  const currentTime = new Date(); // 현재 시간을 가져옴

  // 결과를 객체로 저장하고 젠 시간을 추가
  const resultObject = {
    resultText: resultText,
    timestamp: currentTime.toISOString(), // 현재 시간을 ISO 문자열로 저장
  };

  // 결과를 배열에 저장하거나 데이터베이스에 저장하는 코드를 작성
  results.push(resultObject); // 이 예제에서는 배열에 저장

  res.status(201).send('Result saved successfully.');
});


// 결과 가져오기 라우트
app.get('/getResults', (req, res) => {
  res.json(results);
});

// 초기화 라우트 (결과 배열 초기화)
// 결과 초기화 라우트
app.post('/clearResults', (req, res) => {
    // 서버에서 결과를 초기화하는 코드를 작성
    // 예제: 배열 `results`를 빈 배열로 초기화
    results.length = 0;
  
    res.status(204).send('Results cleared successfully.');
  });

module.exports = app;
