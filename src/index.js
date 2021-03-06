const playPanel = document.getElementById("playPanel");
const countPanel = document.getElementById("countPanel");
const scorePanel = document.getElementById("scorePanel");
const answer = document.getElementById("answer");
const romaNode = document.getElementById("roma");
const japanese = document.getElementById("japanese");
const choices = document.getElementById("choices");
const courseOption = document.getElementById("courseOption");
const resultNode = document.getElementById("result");
const gameTime = 120;
const mode = document.getElementById("mode");
let gameTimer;
// https://dova-s.jp/bgm/play16041.html
const bgm = new Audio("mp3/bgm.mp3");
bgm.volume = 0.1;
bgm.loop = true;
let wordsCount = 0;
let problemCount = 0;
let errorCount = 0;
let mistaken = false;
let problems = [];
let englishVoices = [];
let keyboardAudio, correctAudio, incorrectAudio, endAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
  if (localStorage.getItem("bgm") != 1) {
    document.getElementById("bgmOn").classList.add("d-none");
    document.getElementById("bgmOff").classList.remove("d-none");
  }
}

function toggleBGM() {
  if (localStorage.getItem("bgm") == 1) {
    document.getElementById("bgmOn").classList.add("d-none");
    document.getElementById("bgmOff").classList.remove("d-none");
    localStorage.setItem("bgm", 0);
    bgm.pause();
  } else {
    document.getElementById("bgmOn").classList.remove("d-none");
    document.getElementById("bgmOff").classList.add("d-none");
    localStorage.setItem("bgm", 1);
    bgm.play();
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio("mp3/keyboard.mp3"),
    loadAudio("mp3/correct.mp3"),
    loadAudio("mp3/cat.mp3"),
    loadAudio("mp3/end.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    keyboardAudio = audioBuffers[0];
    correctAudio = audioBuffers[1];
    incorrectAudio = audioBuffers[2];
    endAudio = audioBuffers[3];
  });
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", () => {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  allVoicesObtained.then((voices) => {
    englishVoices = voices.filter((voice) => voice.lang == "en-US");
  });
}
loadVoices();

function loopVoice(text, n) {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
  msg.lang = "en-US";
  for (let i = 0; i < n; i++) {
    speechSynthesis.speak(msg);
  }
}

function loadProblems() {
  const course = courseOption.radio.value;
  fetch(`data/${course}.tsv`)
    .then((response) => response.text())
    .then((tsv) => {
      problems = tsv.trim().split("\n").map((line) => {
        const [en, jaStr] = line.split("\t");
        const ja = jaStr.split("|").slice(0, 3).join("\n");
        return { en: en, ja: ja };
      });
    }).catch((err) => {
      console.error(err);
    });
}

function nextProblem() {
  playAudio(correctAudio);
  wordsCount = 0;
  problemCount += 1;
  if (mistaken) {
    errorCount += 1;
  } else {
    resultNode.lastChild.classList.remove("table-danger");
  }
  mistaken = false;
  selectable();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];
    array[i] = array[r];
    array[r] = tmp;
  }
  return array;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function selectableWordClickEvent() {
  if (this.parentNode == romaNode) {
    if (this.textContent != "???") {
      const romaChildren = [...romaNode.children];
      const choicesChildren = [...choices.children];
      const romaPos = romaChildren.findIndex((e) => e == this);
      let count = 0;
      romaChildren.slice(romaPos).forEach((e) => {
        if (e.hasAttribute("data-pos")) {
          const pos = parseInt(e.dataset.pos);
          choicesChildren[pos].classList.remove("d-none");
          e.textContent = "???";
          e.removeAttribute("data-id");
          e.removeAttribute("data-pos");
          count += 1;
        }
      });
      wordsCount -= count;
    }
  } else {
    const pos = wordsCount;
    const romaChildren = [...romaNode.children];
    let roma = this.textContent;
    if (pos == 0) {
      roma = capitalizeFirstLetter(roma);
    } else {
      const prev = romaChildren[pos].previousSibling;
      if (prev.nodeType == Node.TEXT_NODE) {
        switch (prev.textContent) {
          case ".":
          case "!":
          case "?":
            roma = capitalizeFirstLetter(roma);
        }
      }
    }
    romaChildren[pos].textContent = roma;
    romaChildren[pos].dataset.id = this.dataset.id;
    romaChildren[pos].dataset.pos = this.dataset.pos;
    this.classList.add("d-none");
    wordsCount += 1;
    if (wordsCount == choices.children.length) {
      const correctAll = romaChildren.every((e, i) => {
        return e.dataset.id.split(",").some((id) => i == parseInt(id));
      });
      if (correctAll) {
        nextProblem();
      } else {
        mistaken = true;
        playAudio(incorrectAudio);
      }
    } else {
      playAudio(keyboardAudio);
    }
  }
}

function initSelectableWord() {
  const span = document.createElement("span");
  span.className = "btn btn-light btn-lg m-1 px-2 choice";
  return span;
}
const selectableWord = initSelectableWord();

function setChoices(roma, choices) {
  const words = roma.split(/\s+/)
    .map((word) => word.replace(/([0-9a-zA-Z]+)[,.!?]$/, "$1"))
    .map((word) => {
      switch (word) {
        case "I":
        case "X":
          return word;
        default:
          return word.toLowerCase();
      }
    });
  const positions = {};
  words.forEach((word, i) => {
    if (word in positions) {
      positions[word].push(i);
    } else {
      positions[word] = [i];
    }
  });
  const indexedWords = words.map((word, _id) => {
    return { en: word, id: positions[word] };
  });
  const shuffled = shuffle(indexedWords);
  while (choices.firstChild) {
    choices.removeChild(choices.firstChild);
  }
  shuffled.forEach((word, pos) => {
    const span = selectableWord.cloneNode(true);
    span.onclick = selectableWordClickEvent;
    span.textContent = word.en;
    span.dataset.id = word.id.join(",");
    span.dataset.pos = pos;
    choices.appendChild(span);
  });
}

function setRoma(roma, romaNode) {
  while (romaNode.firstChild) {
    romaNode.removeChild(romaNode.firstChild);
  }
  roma.split(/\s+/).forEach((word) => {
    const span = selectableWord.cloneNode(true);
    span.onclick = selectableWordClickEvent;
    span.textContent = "???";
    romaNode.appendChild(span);
    if (/[0-9a-zA-Z]+[,.!?]/.test(word)) {
      const symbol = word[word.length - 1];
      const text = document.createTextNode(symbol);
      romaNode.appendChild(text);
    }
  });
}

function addResult(en, ja) {
  const tr = document.createElement("tr");
  tr.className = "table-danger";
  const enNode = document.createElement("td");
  const jaNode = document.createElement("td");
  enNode.textContent = en;
  jaNode.textContent = ja;
  enNode.className = "notranslate";
  tr.appendChild(enNode);
  tr.appendChild(jaNode);
  resultNode.appendChild(tr);
}

function selectable() {
  const problem = problems[getRandomInt(0, problems.length)];
  japanese.textContent = problem.ja;
  const roma = problem.en;
  if (mode.textContent == "EASY") {
    loopVoice(roma, 2);
  }
  answer.classList.add("d-none");
  answer.textContent = roma;
  setChoices(roma, choices);
  setRoma(roma, romaNode);
  addResult(problem.en, problem.ja);
  // resizeFontSize(aa);
}

function countdown() {
  wordsCount = problemCount = errorCount = 0;
  countPanel.classList.remove("d-none");
  playPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  counter.textContent = 3;
  const timer = setInterval(() => {
    const counter = document.getElementById("counter");
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearInterval(timer);
      countPanel.classList.add("d-none");
      playPanel.classList.remove("d-none");
      selectable();
      startGameTimer();
      if (localStorage.getItem("bgm") == 1) {
        bgm.play();
      }
    }
  }, 1000);
}

function replay() {
  clearInterval(gameTimer);
  initTime();
  loadProblems();
  countdown();
  while (resultNode.firstChild) {
    resultNode.removeChild(resultNode.firstChild);
  }
}

function startGameTimer() {
  const timeNode = document.getElementById("time");
  gameTimer = setInterval(() => {
    const t = parseInt(timeNode.textContent);
    if (t > 0) {
      timeNode.textContent = t - 1;
    } else {
      clearInterval(gameTimer);
      bgm.pause();
      playAudio(endAudio);
      playPanel.classList.add("d-none");
      scorePanel.classList.remove("d-none");
      scoring();
    }
  }, 1000);
}

function initTime() {
  document.getElementById("time").textContent = gameTime;
}

function scoring() {
  document.getElementById("score").textContent = problemCount - errorCount;
  document.getElementById("count").textContent = problemCount;
}

function showAnswer() {
  answer.classList.remove("d-none");
  mistaken = true;
}

function changeMode() {
  if (this.textContent == "EASY") {
    this.textContent = "HARD";
  } else {
    this.textContent = "EASY";
  }
}

setChoices(romaNode.textContent, choices);

mode.onclick = changeMode;
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("toggleBGM").onclick = toggleBGM;
document.getElementById("startButton").onclick = replay;
document.getElementById("answerButton").onclick = showAnswer;
document.getElementById("voice").onclick = () => {
  loopVoice(answer.textContent, 1);
};
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
