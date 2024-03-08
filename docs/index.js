const playPanel=document.getElementById("playPanel"),infoPanel=document.getElementById("infoPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),answer=document.getElementById("answer"),romaNode=document.getElementById("roma"),japanese=document.getElementById("japanese"),choices=document.getElementById("choices"),courseOption=document.getElementById("courseOption"),resultNode=document.getElementById("result"),gameTime=120,mode=document.getElementById("mode");let gameTimer;const bgm=new Audio("mp3/bgm.mp3");bgm.volume=.1,bgm.loop=!0;let wordsCount=0,problemCount=0,errorCount=0,mistaken=!1,problems=[],englishVoices=[];const audioContext=new globalThis.AudioContext,audioBufferCache={};loadAudio("keyboard","mp3/keyboard.mp3"),loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3"),loadAudio("incorrect","mp3/cat.mp3"),loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&document.documentElement.setAttribute("data-bs-theme","dark"),localStorage.getItem("bgm")!=1&&(document.getElementById("bgmOn").classList.add("d-none"),document.getElementById("bgmOff").classList.remove("d-none"))}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),document.documentElement.setAttribute("data-bs-theme","light")):(localStorage.setItem("darkMode",1),document.documentElement.setAttribute("data-bs-theme","dark"))}function toggleBGM(){localStorage.getItem("bgm")==1?(document.getElementById("bgmOn").classList.add("d-none"),document.getElementById("bgmOff").classList.remove("d-none"),localStorage.setItem("bgm",0),bgm.pause()):(document.getElementById("bgmOn").classList.remove("d-none"),document.getElementById("bgmOff").classList.add("d-none"),localStorage.setItem("bgm",1),bgm.play())}async function playAudio(e,t){const s=await loadAudio(e,audioBufferCache[e]),n=audioContext.createBufferSource();if(n.buffer=s,t){const e=audioContext.createGain();e.gain.value=t,e.connect(audioContext.destination),n.connect(e),n.start()}else n.connect(audioContext.destination),n.start()}async function loadAudio(e,t){if(audioBufferCache[e])return audioBufferCache[e];const s=await fetch(t),o=await s.arrayBuffer(),n=await audioContext.decodeAudioData(o);return audioBufferCache[e]=n,n}function unlockAudio(){audioContext.resume()}function loadVoices(){const e=new Promise(e=>{let t=speechSynthesis.getVoices();if(t.length!==0)e(t);else{let n=!1;speechSynthesis.addEventListener("voiceschanged",()=>{n=!0,t=speechSynthesis.getVoices(),e(t)}),setTimeout(()=>{n||document.getElementById("noTTS").classList.remove("d-none")},1e3)}}),t=["com.apple.speech.synthesis.voice.Bahh","com.apple.speech.synthesis.voice.Albert","com.apple.speech.synthesis.voice.Hysterical","com.apple.speech.synthesis.voice.Organ","com.apple.speech.synthesis.voice.Cellos","com.apple.speech.synthesis.voice.Zarvox","com.apple.speech.synthesis.voice.Bells","com.apple.speech.synthesis.voice.Trinoids","com.apple.speech.synthesis.voice.Boing","com.apple.speech.synthesis.voice.Whisper","com.apple.speech.synthesis.voice.Deranged","com.apple.speech.synthesis.voice.GoodNews","com.apple.speech.synthesis.voice.BadNews","com.apple.speech.synthesis.voice.Bubbles"];e.then(e=>{englishVoices=e.filter(e=>e.lang=="en-US").filter(e=>!t.includes(e.voiceURI))})}loadVoices();function loopVoice(e,t){speechSynthesis.cancel();const n=new globalThis.SpeechSynthesisUtterance(e);n.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],n.lang="en-US";for(let e=0;e<t;e++)speechSynthesis.speak(n)}function loadProblems(){const e=courseOption.radio.value;fetch(`data/${e}.tsv`).then(e=>e.text()).then(e=>{problems=e.trim().split(`
`).map(e=>{const[t,n]=e.split("	"),s=n.split("|").slice(0,3).join(`
`);return{en:t,ja:s}})}).catch(e=>{console.error(e)})}function nextProblem(){playAudio("correct",.3),wordsCount=0,problemCount+=1,mistaken?errorCount+=1:resultNode.lastChild.classList.remove("table-danger"),mistaken=!1,selectable()}function getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e))+e}function shuffle(e){for(let t=e.length;1<t;t--){const n=Math.floor(Math.random()*t);[e[n],e[t-1]]=[e[t-1],e[n]]}return e}function capitalizeFirstLetter(e){return e.charAt(0).toUpperCase()+e.slice(1)}function selectableWordClickEvent(e){const t=e.target;if(t.parentNode==romaNode){if(t.textContent!="　"){const e=[...romaNode.children],s=[...choices.children],o=e.findIndex(e=>e==t);let n=0;e.slice(o).forEach(e=>{if(e.hasAttribute("data-pos")){const t=parseInt(e.dataset.pos);s[t].classList.remove("d-none"),e.textContent="　",e.removeAttribute("data-id"),e.removeAttribute("data-pos"),n+=1}}),wordsCount-=n}}else{const e=wordsCount,n=[...romaNode.children];let s=t.textContent;if(e==0)s=capitalizeFirstLetter(s);else{const t=n[e].previousSibling;if(t.nodeType==Node.TEXT_NODE)switch(t.textContent){case".":case"!":case"?":s=capitalizeFirstLetter(s)}}if(n[e].textContent=s,n[e].dataset.id=t.dataset.id,n[e].dataset.pos=t.dataset.pos,t.classList.add("d-none"),wordsCount+=1,wordsCount==choices.children.length){const e=n.every((e,t)=>e.dataset.id.split(",").some(e=>t==parseInt(e)));e?nextProblem():(mistaken=!0,playAudio("incorrect",.3))}else playAudio("keyboard")}}function initSelectableWord(){const e=document.createElement("button");return e.className="btn btn-light btn-lg m-1 px-2 choice",e}const selectableWord=initSelectableWord();function setChoices(e,t){const s=e.split(/\s+/).map(e=>e.replace(/([0-9a-zA-Z]+)[,.!?]$/,"$1")).map(e=>{switch(e){case"I":case"X":return e;default:return e.toLowerCase()}}),n={};s.forEach((e,t)=>{e in n?n[e].push(t):n[e]=[t]});const o=s.map((e)=>({en:e,id:n[e]})),i=shuffle(o);for(;t.firstChild;)t.removeChild(t.firstChild);i.forEach((e,n)=>{const s=selectableWord.cloneNode(!0);s.onclick=selectableWordClickEvent,s.textContent=e.en,s.dataset.id=e.id.join(","),s.dataset.pos=n,t.appendChild(s)})}function setRoma(e,t){for(;t.firstChild;)t.removeChild(t.firstChild);e.split(/\s+/).forEach(e=>{const n=selectableWord.cloneNode(!0);if(n.onclick=selectableWordClickEvent,n.textContent="　",t.appendChild(n),/[0-9a-zA-Z]+[,.!?]/.test(e)){const n=e[e.length-1],s=document.createTextNode(n);t.appendChild(s)}})}function addResult(e,t){const n=document.createElement("tr");n.className="table-danger";const s=document.createElement("td"),o=document.createElement("td");s.textContent=e,o.textContent=t,s.className="notranslate",n.appendChild(s),n.appendChild(o),resultNode.appendChild(n)}function selectable(){const e=problems[getRandomInt(0,problems.length)];japanese.textContent=e.ja;const t=e.en;mode.textContent=="EASY"&&loopVoice(t,2),answer.classList.add("d-none"),answer.textContent=t,setChoices(t,choices),setRoma(t,romaNode),addResult(e.en,e.ja)}function countdown(){for(wordsCount=problemCount=errorCount=0,countPanel.classList.remove("d-none"),infoPanel.classList.add("d-none"),playPanel.classList.add("d-none"),scorePanel.classList.add("d-none");resultNode.firstChild;)resultNode.removeChild(resultNode.firstChild);counter.textContent=3;const e=setInterval(()=>{const t=document.getElementById("counter"),n=["skyblue","greenyellow","violet","tomato"];if(parseInt(t.textContent)>1){const e=parseInt(t.textContent)-1;t.style.backgroundColor=n[e],t.textContent=e}else clearInterval(e),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),playPanel.classList.remove("d-none"),selectable(),startGameTimer(),localStorage.getItem("bgm")==1&&bgm.play()},1e3)}function startGame(){clearInterval(gameTimer),initTime(),loadProblems(),countdown()}function startGameTimer(){const e=document.getElementById("time");gameTimer=setInterval(()=>{const t=parseInt(e.textContent);t>0?e.textContent=t-1:(clearInterval(gameTimer),bgm.pause(),playAudio("end"),playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),scoring())},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function scoring(){document.getElementById("score").textContent=problemCount-errorCount,document.getElementById("count").textContent=problemCount}function showAnswer(){answer.classList.remove("d-none"),mistaken=!0}function changeMode(e){e.target.textContent=="EASY"?e.target.textContent="HARD":e.target.textContent="EASY"}mode.onclick=changeMode,document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("toggleBGM").onclick=toggleBGM,document.getElementById("startButton").onclick=startGame,document.getElementById("answerButton").onclick=showAnswer,document.getElementById("voice").onclick=()=>{loopVoice(answer.textContent,1)},document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})