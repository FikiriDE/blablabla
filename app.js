let state = {
  page: 'mainMenu',
  cardLimit: 10,
  teamCount: 2,
  roundTime: 60,
  passLimit: 1,
  cards: [],
  allCards: [],
  usedMainTerms: new Set(),
  teamPoints: [],
  teamGuessed: [],
  teamNames: [],
  currentTeam: 0,
  roundCards: [],
  guessedCards: [],
  passedCards: [],
  passesUsed: 0,
  timer: null,
  timeLeft: 60,
  roundInfo: '',
  error: '',
  bulkError: '',
  cardError: '',
  abortReason: '',
  gameEnded: false,
  roundEnded: false
};

// --- Hilfsfunktion: Array mischen (Fisher-Yates) ---
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// --- Render ---
function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  switch (state.page) {
    case 'mainMenu': renderMainMenu(app); break;
    case 'howToPlay': renderHowToPlay(app); break;
    case 'aboutApp': renderAboutApp(app); break;
    case 'impressum': renderImpressum(app); break;
    case 'setup': renderSetup(app); break;
    case 'teamNames': renderTeamNames(app); break;
    case 'cardInput': renderCardInput(app); break;
    case 'startGame': renderStartGame(app); break;
    case 'game': renderGame(app); break;
    case 'abortScreen': renderAbortScreen(app); break;
    case 'endScreen': renderEndScreen(app); break;
  }
}

function topbar(active) {
  return `
  <div class="topbar">
    <button onclick="goto('mainMenu')" class="${active==='mainMenu'?'active':''}">Start</button>
    <button onclick="goto('howToPlay')" class="${active==='howToPlay'?'active':''}">Anleitung</button>
    <button onclick="goto('aboutApp')" class="${active==='aboutApp'?'active':''}">Über die App</button>
  </div>`;
}
function goto(page) {
  if (state.timer) clearInterval(state.timer);
  state.page = page;
  render();
}

function renderMainMenu(app) {
  app.innerHTML = `
    ${topbar('mainMenu')}
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:40vh;">
      <h1>Blablabla</h1>
      <div style="font-size:1.05em;color:#555;text-align:center;margin-bottom:1.5em;max-width:350px;">
        Das Lernspiel nach dem Tabu-Prinzip – Begriffe erklären, Tabuwörter vermeiden, Spaß haben!
      </div>
      <div style="display:flex;justify-content:center;width:100%;">
        <button style="font-size:1.2em;width:90%;max-width:320px;margin:1.5em 0 0.7em 0;" onclick="goto('setup')">Neues Spiel starten</button>
      </div>
    </div>
  `;
}

function renderHowToPlay(app) {
  app.innerHTML = `
    ${topbar('howToPlay')}
    <h2>Anleitung</h2>
    <div class="info-box">
      <ul>
        <li>Lege fest, wie viele Karten und Teams es gibt und wie lang eine Runde dauert.</li>
        <li>Gib für jedes Team einen Namen ein.</li>
        <li>Erstelle Karten einzeln oder lade mehrere Karten auf einmal hoch (s. u.):<br>
          <code>Begriff 1: Unterbegriff 1, Unterbegriff 2, Unterbegriff 3, Unterbegriff 4; Begriff 2: ...</code>
        </li>
        <li>Nach dem Sammeln der Karten kannst du das Spiel starten. Das erste Team beginnt.</li>
        <li>Das Team erklärt die Begriffe, ohne die Tabu-Wörter zu nennen. Pro Runde darf je nach Einstellung mehrmals gepasst werden.</li>
        <li>Nach Ablauf der Zeit werden die erratenen Begriffe gezählt. Dann ist das nächste Team an der Reihe.</li>
        <li>Das Spiel endet, wenn alle Karten erraten wurden oder wenn es vorzeitig abgebrochen wird.</li>
      </ul>
    </div>
  `;
}

function renderAboutApp(app) {
  app.innerHTML = `
    ${topbar('aboutApp')}
    <h2>Über die App</h2>
    <div class="info-box">
      <p>
        Diese Web-App wurde entwickelt, um Unterrichtsinhalte spielerisch nach dem Tabu-Prinzip zu wiederholen.<br>
        Die App funktioniert komplett im Browser und speichert keine Daten dauerhaft.<br><br>
        <strong>Programmierer:</strong> L. Pongrac<br>
        <strong>Kontakt:</strong> <a href="mailto:fikiri@icloud.com">fikiri@icloud.com</a>
      </p>
    </div>
  `;
}

function renderImpressum(app) {
  app.innerHTML = `
    ${topbar('')}
    <h2>Impressum</h2>
    <div class="info-box">
      <p>Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG).</p>
      <p>
        <strong>Lars Pongrac</strong><br>
        Freiherr-vom-Stein-Straße 23<br>
        59379 Selm<br>
        Deutschland
      </p>
      <p>
        <strong>Kontakt:</strong><br>
        E-Mail: <a href="mailto:fikiri@icloud.com">fikiri@icloud.com</a>
      </p>
      <p>
        Blablabla wird von mir privat und nicht-kommerziell betrieben
        (keine Werbung, keine Bezahlfunktionen, keine gewerbliche Nutzung
        der App selbst).
      </p>
    </div>
    <div style="display:flex;justify-content:center;">
      <button onclick="goto('mainMenu')" style="width:80%;">Zurück zum Hauptmenü</button>
    </div>
  `;
}

function renderSetup(app) {
  let cardOpts = '';
  for(let i=5;i<=50;i+=5) cardOpts += `<option value="${i}" ${i===state.cardLimit?'selected':''}>${i}</option>`;
  
  let passOpts = '';
  for(let i=1;i<=5;i++) passOpts += `<option value="${i}" ${i===state.passLimit?'selected':''}>${i}</option>`;
  passOpts += `<option value="999" ${state.passLimit===999?'selected':''}>Unbegrenzt</option>`;
  
  app.innerHTML = `
    ${topbar('mainMenu')}
    <h2>Neues Spiel</h2>
    <label>
      Wie viele Karten sollen gesammelt werden?
      <select id="cardCount">${cardOpts}</select>
    </label>
    <label>
      Wie viele Teams spielen?
      <select id="teamCount">
        <option value="2" ${state.teamCount===2?'selected':''}>2</option>
        <option value="3" ${state.teamCount===3?'selected':''}>3</option>
        <option value="4" ${state.teamCount===4?'selected':''}>4</option>
      </select>
    </label>
    <label>
      Rundenzeit (Sekunden)
      <select id="roundTime">
        <option value="30" ${state.roundTime===30?'selected':''}>30</option>
        <option value="45" ${state.roundTime===45?'selected':''}>45</option>
        <option value="60" ${state.roundTime===60?'selected':''}>60</option>
        <option value="90" ${state.roundTime===90?'selected':''}>90</option>
      </select>
    </label>
    <label>
      Passen pro Runde erlaubt
      <select id="passLimit">${passOpts}</select>
    </label>
    <div style="display:flex;justify-content:center;margin-top:1em;">
      <button onclick="saveSetup()">Weiter</button>
    </div>
  `;
  document.getElementById('cardCount').onchange = e => { state.cardLimit = parseInt(e.target.value);}
  document.getElementById('teamCount').onchange = e => { state.teamCount = parseInt(e.target.value);}
  document.getElementById('roundTime').onchange = e => { state.roundTime = parseInt(e.target.value);}
  document.getElementById('passLimit').onchange = e => { state.passLimit = parseInt(e.target.value);}
}

function renderTeamNames(app) {
  let teamInputs = '';
  for(let i=0; i<state.teamCount; i++) {
    teamInputs += `
      <label>
        Name für Team ${i+1}
        <input id="teamName${i}" value="${state.teamNames[i] || `Team ${i+1}`}" placeholder="Team ${i+1}">
      </label>
    `;
  }
  
  app.innerHTML = `
    ${topbar('mainMenu')}
    <h2>Teamnamen festlegen</h2>
    <div class="team-names-container">
      ${teamInputs}
    </div>
    <div style="display:flex;justify-content:center;margin-top:1em;">
      <button onclick="saveTeamNames()">Weiter</button>
    </div>
  `;
}

function renderCardInput(app) {
  app.innerHTML = `
    ${topbar('mainMenu')}
    <h3>Karte <span id="cardNr">${state.cards.length + 1}</span> / <span id="cardTotal">${state.cardLimit}</span></h3>
    <form id="cardForm">
      <input id="mainTerm" placeholder="Hauptbegriff" autocomplete="off" required
        onblur="mainTermCheck(this.value)">
      <div id="mainTermHint" style="color:var(--danger);font-weight:500;"></div>
      <input id="sub1" placeholder="Unterbegriff 1" autocomplete="off" required>
      <input id="sub2" placeholder="Unterbegriff 2" autocomplete="off" required>
      <input id="sub3" placeholder="Unterbegriff 3" autocomplete="off" required>
      <input id="sub4" placeholder="Unterbegriff 4" autocomplete="off" required>
      <div style="display:flex;justify-content:center;">
        <button type="submit">Karte speichern</button>
      </div>
    </form>
    <div id="cardError" style="color:var(--danger);font-weight:500;">${state.cardError||''}</div>
    <div style="margin:1em 0 0.5em 0;font-weight:500;">Oder mehrere Karten auf einmal hochladen:</div>
    <textarea id="bulkCards" rows="4" placeholder="Begriff 1: Unterbegriff 1, Unterbegriff 2, Unterbegriff 3, Unterbegriff 4; Begriff 2: ..."></textarea>
    <div style="display:flex;justify-content:center;">
      <button onclick="addBulkCards()" type="button">Karten hochladen</button>
    </div>
    <div id="bulkError" style="color:var(--danger);font-weight:500;">${state.bulkError||''}</div>
    <div style="display:flex;justify-content:center;margin-top:1em;">
      <button class="abort-btn" onclick="abortGame('abbruch')">Abbrechen</button>
    </div>
  `;
  document.getElementById('cardForm').onsubmit = addCard;
}

function renderStartGame(app) {
  app.innerHTML = `
    ${topbar('mainMenu')}
    <div class="info-box" id="startGameInfo">
      Das Kartenset ist vollständig.<br>
      <b>Nach dem Klick auf „Spiel starten" beginnt das Team ${state.teamNames[0]}!</b>
    </div>
    <div style="display:flex;justify-content:center;margin:2em 0 1em 0;">
      <button style="width:70%;font-size:1.2em;max-width:320px;" onclick="showGame()">Spiel starten</button>
    </div>
    <div style="display:flex;justify-content:center;">
      <button class="abort-btn" onclick="abortGame('abbruch')">Abbrechen</button>
    </div>
  `;
}

function renderGame(app) {
  const passText = state.passLimit === 999 ? 
    "Unbegrenzt" : 
    `${state.passesUsed}/${state.passLimit}`;
  
  app.innerHTML = `
    ${topbar('mainMenu')}
    <div class="points">${state.teamPoints.map((p,i)=>`${state.teamNames[i]}: ${p} ${p===1?'Punkt':'Punkte'} (erraten: ${state.teamGuessed[i]})`).join('<br>')}</div>
    <div id="teamTurn" class="team-highlight" style="text-align:center;font-weight:700;font-size:1.5em;margin:1em 0 0.3em 0;">
      <span style="background:var(--accent);color:#fff;padding:0.25em 1em;border-radius:1em;box-shadow:0 1px 6px #0002;">
        Am Zug: ${state.teamNames[state.currentTeam]}
      </span>
    </div>
    <div class="timer" id="timer">${formatTime(state.timeLeft)}</div>
    <div class="card" id="gameCard"></div>
    <div class="team-btns">
      <button onclick="markGuessed()" id="guessBtn" ${state.roundEnded ? "disabled" : ""}>Erraten</button>
      <button onclick="passCard()" id="passBtn" ${(state.passesUsed >= state.passLimit || state.roundEnded) ? 'disabled class="btn-disabled"':''}>
        Passen (${passText})
      </button>
    </div>
    <div id="roundInfo">${state.roundInfo||''}</div>
    ${state.roundEnded && state.cards.length > 0 ? `
      <div style="display:flex;justify-content:center;margin-top:1em;">
        <button onclick="nextTeam()" style="background:var(--success);width:100%;max-width:320px;font-size:1.2em;">
          Nächstes Team starten
        </button>
      </div>` : ""}
    <div style="display:flex;justify-content:center;margin-top:1em;">
      <button onclick="abortGame('abbruch')" class="abort-btn">Spiel abbrechen</button>
    </div>
  `;
  if (!state.roundEnded) showNextCard();
}

function renderAbortScreen(app) {
  app.innerHTML = `
    ${topbar('mainMenu')}
    <h2>Spiel abgebrochen</h2>
    <div class="points">${state.teamPoints.map((p,i)=>`${state.teamNames[i]}: ${p} ${p===1?'Punkt':'Punkte'} (erraten: ${state.teamGuessed[i]})`).join('<br>')}</div>
    <div style="display:flex;justify-content:center;margin-top:1em;">
      <button onclick="downloadCardsPDF()">Karten als PDF herunterladen</button>
    </div>
    <div style="display:flex;justify-content:center;margin-top:2em;">
      <button onclick="goto('mainMenu')" style="width:80%;">Zurück zum Hauptmenü</button>
    </div>
  `;
}

function renderEndScreen(app) {
  // Sortiere Teams nach Punkten (höchste zuerst)
  let teamResults = state.teamPoints.map((points, idx) => ({
    name: state.teamNames[idx],
    points: points,
    guessed: state.teamGuessed[idx]
  })).sort((a, b) => b.points - a.points);
  
  let resultsHTML = '';
  teamResults.forEach((team, idx) => {
    let style = idx === 0 ? 'color:var(--success);font-weight:bold;font-size:1.2em;' : '';
    resultsHTML += `<div style="${style}">${idx+1}. ${team.name}: ${team.points} ${team.points===1?'Punkt':'Punkte'} (erraten: ${team.guessed})</div>`;
  });
  
  app.innerHTML = `
    ${topbar('mainMenu')}
    <h2>Alle Begriffe wurden gespielt!</h2>
    <div class="points">${resultsHTML}</div>
    <div style="display:flex;justify-content:center;margin-top:1em;">
      <button onclick="downloadCardsPDF()">Karten als PDF herunterladen</button>
    </div>
    <div style="display:flex;justify-content:center;margin-top:2em;">
      <button onclick="goto('mainMenu')" style="width:80%;">Zurück zum Hauptmenü</button>
    </div>
  `;
}

// --- Spiellogik ---
function saveSetup() {
  state.teamNames = Array(state.teamCount).fill('').map((_, i) => `Team ${i+1}`);
  goto('teamNames');
}

function saveTeamNames() {
  for(let i=0; i<state.teamCount; i++) {
    let name = document.getElementById(`teamName${i}`).value.trim();
    state.teamNames[i] = name || `Team ${i+1}`;
  }
  startCardInput();
}

function startCardInput() {
  state.cards = [];
  state.allCards = [];
  state.usedMainTerms = new Set();
  state.teamPoints = Array(state.teamCount).fill(0);
  state.teamGuessed = Array(state.teamCount).fill(0);
  state.cardError = '';
  state.bulkError = '';
  state.page = 'cardInput';
  render();
}

function mainTermCheck(value) {
  const hint = document.getElementById('mainTermHint');
  if (!value.trim()) {
    hint.textContent = '';
    return;
  }
  if (state.usedMainTerms.has(value.trim().toLowerCase())) {
    hint.textContent = "Begriff existiert bereits!";
  } else {
    hint.textContent = "";
  }
}

function addCard(e) {
  e.preventDefault();
  const main = document.getElementById('mainTerm').value.trim();
  const sub1 = document.getElementById('sub1').value.trim();
  const sub2 = document.getElementById('sub2').value.trim();
  const sub3 = document.getElementById('sub3').value.trim();
  const sub4 = document.getElementById('sub4').value.trim();
  if (state.usedMainTerms.has(main.toLowerCase())) {
    state.cardError = "Hauptbegriff existiert bereits!";
    render();
    document.getElementById('mainTerm').focus();
    return;
  }
  state.cardError = '';
  state.cards.push({main, subs: [sub1, sub2, sub3, sub4]});
  state.usedMainTerms.add(main.toLowerCase());
  if (state.cards.length < state.cardLimit) {
    render();
    document.getElementById('mainTerm').focus();
  } else {
    // Speichere die vollständige Kartenliste für den PDF-Export
    state.allCards = state.cards.map(card => ({main: card.main, subs: [...card.subs]}));
    state.page = 'startGame';
    render();
  }
}

function addBulkCards() {
  const input = document.getElementById('bulkCards').value.trim();
  state.bulkError = '';
  if(!input) {
    state.bulkError = "Bitte gib Kartendaten ein.";
    render();
    return;
  }
  let entries = input.split(';').map(e=>e.trim()).filter(e=>e.length>0);
  let added = 0;
  for(let entry of entries){
    let [main, subs] = entry.split(':');
    if(!main || !subs) continue;
    main = main.trim();
    if (state.usedMainTerms.has(main.toLowerCase())) continue;
    let subArr = subs.split(',').map(s=>s.trim()).filter(s=>s.length>0);
    if(subArr.length!==4) continue;
    state.cards.push({main, subs: subArr});
    state.usedMainTerms.add(main.toLowerCase());
    added++;
    if(state.cards.length>=state.cardLimit) break;
  }
  if (added === 0) {
    state.bulkError = "Keine gültigen Karten gefunden oder alle Begriffe bereits vorhanden.";
    render();
    return;
  }
  if(state.cards.length>=state.cardLimit){
    state.allCards = state.cards.map(card => ({main: card.main, subs: [...card.subs]}));
    state.page = 'startGame';
    render();
  } else {
    render();
  }
}

function showGame() {
  state.roundCards = shuffleArray([...state.cards]);
  state.guessedCards = [];
  state.passedCards = [];
  state.currentTeam = 0;
  state.passesUsed = 0;
  state.roundInfo = '';
  state.timeLeft = state.roundTime;
  state.roundEnded = false;
  state.page = 'game';
  render();
  startTimer();
}

function startTimer() {
  state.roundEnded = false;
  state.timer = setInterval(() => {
    state.timeLeft--;
    document.getElementById('timer').textContent = formatTime(state.timeLeft);
    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      state.timer = null;
      endRound(true); // true = Zeit abgelaufen
    }
  }, 1000);
}

function showNextCard() {
  if (state.roundCards.length === 0) {
    endRound(false);
    return;
  }
  const card = state.roundCards[0];
  document.getElementById('gameCard').innerHTML = `
    <div class="main-term">${card.main}</div>
    <ul>
      <li>${card.subs[0]}</li>
      <li>${card.subs[1]}</li>
      <li>${card.subs[2]}</li>
      <li>${card.subs[3]}</li>
    </ul>
  `;
}

function markGuessed() {
  if (state.roundEnded || state.roundCards.length === 0) return;
  state.guessedCards.push(state.roundCards[0]);
  state.roundCards.shift();
  state.teamGuessed[state.currentTeam]++;
  showNextCard();
  render();
}

function passCard() {
  if (state.roundEnded || state.passesUsed >= state.passLimit || state.roundCards.length <= 1) return;
  state.passesUsed++;
  // Karte ans Ende stellen, damit sie in der nächsten Runde wieder drankommt
  state.roundCards.push(state.roundCards.shift());
  showNextCard();
  render();
}

function endRound(timeIsUp = false) {
  clearInterval(state.timer);
  state.timer = null;
  state.roundEnded = true;
  // Punkte nur einmal vergeben!
  state.teamPoints[state.currentTeam] += state.guessedCards.length;
  let info = `Erratene Karten: ${state.guessedCards.map(c => c.main).join(", ") || "Keine"}`;
  if (timeIsUp) {
    info = `<b>Zeit ist abgelaufen!</b><br>Das Team ${state.teamNames[state.currentTeam]} hat ${state.guessedCards.length} Punkt${state.guessedCards.length===1?'':'e'} erreicht.<br><br>` + info;
  }
  state.roundInfo = info;

  // --- NEU: Prüfen, ob das Spiel vorbei ist ---
  // Simuliere das Entfernen der erratenen Karten
  const verbleibendeKarten = state.cards.filter(card => !state.guessedCards.includes(card));
  if (verbleibendeKarten.length === 0) {
    state.cards = [];
    state.page = 'endScreen';
    render();
    return;
  }

  render();
}

function nextTeam() {
  // Entferne NUR erratene Karten aus dem Pool, gepasste Karten bleiben erhalten
  state.cards = state.cards.filter(card => !state.guessedCards.includes(card));
  state.currentTeam = (state.currentTeam + 1) % state.teamCount;
  // Neue Runde: Karten = verbleibende + gepasste Karten, dann mischen!
  state.roundCards = shuffleArray([...state.cards]);
  state.guessedCards = [];
  state.passesUsed = 0;
  state.roundInfo = '';
  state.timeLeft = state.roundTime;
  state.timer = null;
  state.teamGuessed[state.currentTeam] = 0;
  state.roundEnded = false;
  state.page = 'game';
  render();
  startTimer();
}

function abortGame(reason) {
  if (state.timer) clearInterval(state.timer);
  state.abortReason = reason;
  state.page = 'abortScreen';
  render();
}

// PDF-Export: immer alle Begriffe vor Spielstart (state.allCards)
function downloadCardsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);

  if (!state.allCards || state.allCards.length === 0) {
    doc.text("Keine Karten vorhanden.", 10, 20);
    doc.save("blablabla_karten.pdf");
    return;
  }

  let text = state.allCards.map(card =>
    `${card.main}: ${card.subs.join(", ")}`
  ).join("; ");

  let lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 20);
  doc.save("blablabla_karten.pdf");
}

function formatTime(sec) {
  return `${Math.floor(sec/60)}:${("0"+(sec%60)).slice(-2)}`;
}

// --- Initialisierung ---
render();

// --- Für Buttons im globalen Scope ---
window.goto = goto;
window.saveSetup = saveSetup;
window.saveTeamNames = saveTeamNames;
window.startCardInput = startCardInput;
window.addCard = addCard;
window.addBulkCards = addBulkCards;
window.showGame = showGame;
window.markGuessed = markGuessed;
window.passCard = passCard;
window.nextTeam = nextTeam;
window.abortGame = abortGame;
window.downloadCardsPDF = downloadCardsPDF;
window.mainTermCheck = mainTermCheck;
