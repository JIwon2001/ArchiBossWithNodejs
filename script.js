const results = []; // 결과를 저장할 배열

// 페이지 로드 시 서버에서 결과 가져옴
window.onload = function () {
  getResultsFromServer();
};

function calculateTime() {
  const bossName = document.getElementById("bossNameInput").value;
  let hourInput = parseInt(document.getElementById("hourInput").value);
  const timeInput = document.getElementById("timeInput").value;

  if (bossName.trim() === "") {
    alert("보스의 이름을 입력하세요.");
    return;
  }

  // 보스 이름에 따라 자동으로 추가 시간 설정
  const automaticHours = {
    디켄: 6,
    네르구스: 6,
    킹스톤: 6,
    타이란: 6,
    나투스: 6,
    저거너트: 6,
    바루타: 6,
    "29호": 18,
    마스투스: 18,
    벨루치: 15,
    가나비슈: 15,
    발룸: 15,
    굴라: 15,
  };

  // 자동으로 추가 시간 설정이 있는 경우 해당 값을 사용
  if (bossName in automaticHours) {
    hourInput = automaticHours[bossName];
  }

  // 시간을 24시간 형식으로 파싱 (예: "1400" -> "14:00")
  const parsedTime = parseTimeInput(timeInput);

  if (!parsedTime) {
    alert("올바른 시간 형식을 입력하세요 (예: '1400' 또는 '1523').");
    return;
  }

  // 시간을 더함
  parsedTime.setHours(parsedTime.getHours() + hourInput);

  // 시간을 24시간 형식으로 변환
  const hours = parsedTime.getHours();
  const minutes = parsedTime.getMinutes();

  // 결과를 문자열로 변환 (24시간 형식)
  const resultTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  // 결과를 화면에 출력
  const resultText = `${bossName}의 다음 젠 시간은 ${resultTime} 입니다.`;

  // 결과를 배열에 추가
  const resultObject = {
    resultText: resultText,
    timestamp: parsedTime.getTime(), // 젠 시간의 타임스탬프를 추가
  };

  // 적절한 위치를 찾아서 결과를 추가
  let added = false;
  for (let i = 0; i < results.length; i++) {
    if (results[i].timestamp > resultObject.timestamp) {
      results.splice(i, 0, resultObject);
      added = true;
      break;
    }
  }

  // 적절한 위치가 없으면 맨 끝에 추가
  if (!added) {
    results.push(resultObject);
  }

  // 화면에 정렬된 결과를 표시
  const resultContainer = document.getElementById("result");
  resultContainer.innerHTML = "";
  results.forEach((result) => {
    const p = document.createElement("p");
    p.textContent = result.resultText;
    resultContainer.appendChild(p);
  });

  // 결과를 Node.js 서버에 저장
  saveResultToServer(resultText);
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    calculateTime();
  }
}

// 24시간 형식의 시간 입력을 파싱하는 함수
function parseTimeInput(timeInput) {
  const match = timeInput.match(/^(\d{2})(\d{2})$/);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const parsedTime = new Date();
      parsedTime.setHours(hours);
      parsedTime.setMinutes(minutes);
      return parsedTime;
    }
  }
  return null;
}

function saveResultToServer(resultText) {
  fetch("http://localhost:3000/saveResult", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resultText }),
  })
    .then((response) => {
      if (response.status === 201) {
        console.log("Result saved successfully on the server.");
        // 결과를 저장한 후 서버에서 다시 결과를 가져오도록 호출
        getResultsFromServer();
      }
    })
    .catch((error) => {
      console.error("Error saving result:", error);
    });
}

// 결과 배열을 젠 시간을 기준으로 정렬하는 함수
function sortResultsByTime(results) {
  return results.sort((a, b) => a.timestamp - b.timestamp);
}

function getResultsFromServer() {
  fetch("http://localhost:3000/getResults")
    .then((response) => response.json())
    .then((data) => {
      // 서버에서 가져온 결과로 배열 초기화
      results = data;

      // 결과를 시간순으로 정렬
      const sortedResults = sortResultsByTime(results);

      // 정렬된 결과를 화면에 표시
      const resultContainer = document.getElementById("result");
      resultContainer.innerHTML = "";
      sortedResults.forEach((resultObject) => {
        const p = document.createElement("p");
        p.textContent = resultObject.resultText;
        resultContainer.appendChild(p);
      });
    })
    .catch((error) => {
      console.error("Error fetching results:", error);
    });
}
// 결과를 Local Storage에서 제거하고 결과 배열 초기화
function clearResults() {
  // 로컬 스토리지에서 저장된 결과 제거
  localStorage.removeItem("savedResults");

  // 서버에서 가져오는 결과 초기화
  fetch("http://localhost:3000/clearResults", {
    method: "POST",
  })
    .then((response) => {
      if (response.status === 204) {
        console.log("Results cleared successfully on the server.");
        // 서버에서 결과를 초기화한 후 화면과 클라이언트의 결과 배열도 초기화
        const resultContainer = document.getElementById("result");
        resultContainer.innerHTML = "";
        results.length = 0; // 결과 배열 비우기
      }
    })
    .catch((error) => {
      console.error("Error clearing results:", error);
    });
}
