const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxZosDaXXVMfxpHj__kOQ_BZDOYq8-aQJTtFg991zzRk8OoYjeuLf3s00z7aFqBitWVcQ/exec";
const TOTAL_POINTS = 20;
let assignmentStartTime = Date.now();
let focusLossCount = 0, copyPasteCount = 0, fullscreenExitCount = 0;
let securityEvents = [], lastBlurAt = 0, currentQuestionPage = 0, questionElements = [];
const hebrewLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י"];
const questions = [
  {
    "id": "q1",
    "type": "multi",
    "points": 10,
    "section": "שאלה 1 — שם המספר לפי שם העצם",
    "title": "בחרו בשם המספר הנכון לפי שם העצם.",
    "items": [
      {
        "prompt": "6 חלונות",
        "options": [
          "שש חלונות",
          "שישה חלונות",
          "ששת חלונות",
          "שישים חלונות"
        ],
        "correct": 1
      },
      {
        "prompt": "17 נמלים",
        "options": [
          "שבעה עשר נמלים",
          "שבע עשרה נמלים",
          "שבע עשר נמלים",
          "שבעה עשרה נמלים"
        ],
        "correct": 1
      },
      {
        "prompt": "10 שולחנות",
        "options": [
          "עשר שולחנות",
          "עשרה שולחנות",
          "עשרת שולחנות",
          "עשירית שולחנות"
        ],
        "correct": 1
      },
      {
        "prompt": "23 בתים",
        "options": [
          "עשרים ושלוש בתים",
          "עשרים ושלושה בתים",
          "עשרים ושלושת בתים",
          "עשרים ושלושה בית"
        ],
        "correct": 1
      },
      {
        "prompt": "13 ניירות",
        "options": [
          "שלוש עשרה ניירות",
          "שלושה עשר ניירות",
          "שלושת עשר ניירות",
          "שלושה עשרה ניירות"
        ],
        "correct": 1
      }
    ]
  },
  {
    "id": "q2",
    "type": "multi",
    "points": 5,
    "section": "שאלה 2 — בחרו באפשרות הנכונה",
    "title": "בחרו באפשרות הנכונה מבין שתי האפשרויות בכל משפט.",
    "items": [
      {
        "prompt": "הלכתי לחנות וקניתי ________ מתנות.",
        "options": [
          "שתי",
          "שני"
        ],
        "correct": 0
      },
      {
        "prompt": "על העץ יש ________ ציפורים.",
        "options": [
          "שישים וששה",
          "שישים ושש"
        ],
        "correct": 1
      },
      {
        "prompt": "במדינת ישראל הוקמו ________ ערים.",
        "options": [
          "עשרים ושלוש",
          "עשרים ושלושה"
        ],
        "correct": 0
      },
      {
        "prompt": "במבחן האחרון נכשלו ________ תלמידים.",
        "options": [
          "שמונה",
          "שמונה"
        ],
        "correct": 0
      },
      {
        "prompt": "התלמידים ענו על ________ שאלות.",
        "options": [
          "חמישה עשר",
          "חמש עשרה"
        ],
        "correct": 1
      }
    ]
  },
  {
    "id": "q3",
    "type": "multi",
    "points": 5,
    "section": "שאלה 3 — הקיפו את התשובה הנכונה",
    "title": "בחרו את התשובה הנכונה בכל סעיף.",
    "items": [
      {
        "prompt": "3 המקומות מיוצגים פי 3 מקודמיהם.",
        "options": [
          "שלוש המקומות, פי שלוש",
          "שלושת המקומות, פי שלוש",
          "שלוש המקומות, פי שלושה",
          "שלושת המקומות, פי שלושה"
        ],
        "correct": 3
      },
      {
        "prompt": "בשורה ה־15 יש 4 תאים.",
        "options": [
          "החמש עשרה, ארבע",
          "החמישה עשר, ארבע",
          "החמש עשרה, ארבעה",
          "החמישה עשר, ארבעה"
        ],
        "correct": 2
      },
      {
        "prompt": "פתחו ספר בעמוד 5, פסקה 5!",
        "options": [
          "עמוד חמישה, פסקה חמש",
          "עמוד חמש, פסקה חמש",
          "עמוד חמישה, פסקה חמישה",
          "עמוד חמש, פסקה חמישה"
        ],
        "correct": 1
      },
      {
        "prompt": "ב־3 השבועות האחרונים למדנו על המאה ה־17.",
        "options": [
          "שלושה, שבעה עשר",
          "שלושה, שבע עשרה",
          "שלושת, שבע עשרה",
          "שלוש, שבעה עשר"
        ],
        "correct": 2
      },
      {
        "prompt": "ישיבת הכנסת תיערך ב־28 בנובמבר.",
        "options": [
          "בעשרים ושמונה",
          "בעשרים ושמונָה",
          "בעשרים ושמונת"
        ],
        "correct": 0
      }
    ]
  }
];

function recordSecurityEvent(type, details = "") {
  const time = new Date().toLocaleString("he-IL");
  securityEvents.push(`${time} - ${type}${details ? ": " + details : ""}`);
  updateSecurityPanel();
}

function updateSecurityPanel() {
  const panel = document.getElementById("securityPanel");
  if (!panel) return;
  const totalWarnings = focusLossCount + copyPasteCount + fullscreenExitCount;
  const status = totalWarnings === 0 ? "תקין" : totalWarnings <= 2 ? "אזהרה" : "חשד";
  panel.innerHTML = `<strong>בקרת מטלה:</strong><span>יציאות מהמסך: ${focusLossCount}</span><span>ניסיונות העתקה/הדבקה: ${copyPasteCount}</span><span>יציאות ממסך מלא: ${fullscreenExitCount}</span><span>סטטוס: ${status}</span>`;
}

function showSecurityWarning(message) {
  const warning = document.getElementById("securityWarning");
  if (!warning) return;
  warning.textContent = message;
  warning.classList.remove("hidden");
  setTimeout(() => warning.classList.add("hidden"), 5500);
}

function setupSecurityControls() {
  document.getElementById("fullscreenBtn")?.addEventListener("click", async () => {
    try { await document.documentElement.requestFullscreen(); recordSecurityEvent("כניסה למסך מלא"); }
    catch (error) { showSecurityWarning("הדפדפן לא אישר מעבר למסך מלא. אפשר להמשיך במטלה."); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { focusLossCount++; recordSecurityEvent("יציאה מהמסך / מעבר ללשונית אחרת"); } });
  window.addEventListener("blur", () => { const now = Date.now(); if (now - lastBlurAt > 1500) { lastBlurAt = now; focusLossCount++; recordSecurityEvent("אובדן מיקוד חלון"); } });
  document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement) { fullscreenExitCount++; recordSecurityEvent("יציאה ממסך מלא"); } });
  ["copy","cut","paste"].forEach(eventName => document.addEventListener(eventName, () => { copyPasteCount++; recordSecurityEvent(`ניסיון ${eventName}`); showSecurityWarning("פעולת העתקה/הדבקה נרשמה במערכת."); }));
  updateSecurityPanel();
}

function renderQuestions() {
  const wrapper = document.getElementById("questions");
  questions.forEach(q => {
    const div = document.createElement("div");
    div.className = "question question-page hidden";
    div.dataset.questionId = q.id;
    let html = `<div class="section-title in-question">${q.section}</div>`;
    html += `<div class="q-title">${q.title} <span class="points">(${q.points} נק׳)</span></div>`;
    if (q.type === "choice") {
      html += `<div class="options">`;
      q.options.forEach((option, idx) => html += `<label><input type="radio" name="${q.id}" value="${idx}" /> <span>${option}</span></label>`);
      html += `</div>`;
    }
    if (q.type === "multi") {
      html += `<div class="multi-items">`;
      q.items.forEach((item, itemIdx) => {
        html += `<div class="multi-item"><p><strong>${hebrewLetters[itemIdx]}.</strong> ${item.prompt}</p><div class="options compact">`;
        item.options.forEach((option, optionIdx) => html += `<label><input type="radio" name="${q.id}_${itemIdx}" value="${optionIdx}" /> <span>${option}</span></label>`);
        html += `</div></div>`;
      });
      html += `</div>`;
    }
    div.innerHTML = html;
    wrapper.appendChild(div);
  });
  questionElements = Array.from(document.querySelectorAll(".question-page"));
  setupQuestionNavigation();
  showQuestionPage(0);
}

function setupQuestionNavigation() {
  document.getElementById("prevQuestionBtn")?.addEventListener("click", () => showQuestionPage(currentQuestionPage - 1));
  document.getElementById("nextQuestionBtn")?.addEventListener("click", () => showQuestionPage(currentQuestionPage + 1));
}

function questionAnswered(q) {
  if (q.type === "choice") return Boolean(document.querySelector(`[name="${q.id}"]:checked`));
  if (q.type === "multi") return q.items.some((_, idx) => Boolean(document.querySelector(`[name="${q.id}_${idx}"]:checked`)));
  return false;
}

function showQuestionPage(index) {
  if (!questionElements.length) return;
  currentQuestionPage = Math.max(0, Math.min(index, questionElements.length - 1));
  questionElements.forEach((el, i) => el.classList.toggle("hidden", i !== currentQuestionPage));
  document.getElementById("questionProgress").innerHTML = `<strong>שאלה ${currentQuestionPage + 1} מתוך ${questionElements.length}</strong><div class="progress-bar"><span style="width:${((currentQuestionPage + 1) / questionElements.length) * 100}%"></span></div>`;
  updateQuestionMap();
  document.getElementById("prevQuestionBtn").disabled = currentQuestionPage === 0;
  document.getElementById("nextQuestionBtn").classList.toggle("hidden", currentQuestionPage === questionElements.length - 1);
  document.getElementById("finalSubmitBtn").classList.toggle("hidden", currentQuestionPage !== questionElements.length - 1);
  document.querySelector(".questions-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateQuestionMap() {
  const map = document.getElementById("questionMap");
  map.innerHTML = questions.map((q, i) => `<button type="button" class="${["map-dot", i === currentQuestionPage ? "active" : "", questionAnswered(q) ? "answered" : ""].join(" ")}" data-index="${i}" title="שאלה ${i + 1}">${i + 1}</button>`).join("");
  map.querySelectorAll(".map-dot").forEach(btn => btn.addEventListener("click", () => showQuestionPage(Number(btn.dataset.index))));
}

function setupInteractiveFeatures() {
  document.addEventListener("input", updateQuestionMap);
  document.addEventListener("change", updateQuestionMap);
  document.getElementById("toggleArticleBtn")?.addEventListener("click", () => document.querySelector(".exam-layout")?.classList.toggle("article-collapsed"));
  document.getElementById("increaseTextBtn")?.addEventListener("click", () => { document.body.classList.add("large-text"); document.body.classList.remove("small-text"); });
  document.getElementById("decreaseTextBtn")?.addEventListener("click", () => { document.body.classList.add("small-text"); document.body.classList.remove("large-text"); });
}

function gradeQuestion(q) {
  let earned = 0, answerText = "";
  if (q.type === "choice") {
    const selected = document.querySelector(`[name="${q.id}"]:checked`);
    if (selected) {
      const idx = Number(selected.value);
      answerText = q.options[idx];
      if (idx === q.correct) earned = q.points;
    }
  }
  if (q.type === "multi") {
    const each = q.points / q.items.length;
    const parts = [];
    q.items.forEach((item, itemIdx) => {
      const selected = document.querySelector(`[name="${q.id}_${itemIdx}"]:checked`);
      if (selected) {
        const idx = Number(selected.value);
        parts.push(`${item.prompt} => ${item.options[idx]}`);
        if (idx === item.correct) earned += each;
      } else parts.push(`${item.prompt} => לא נענה`);
    });
    answerText = parts.join(" | ");
  }
  return { earned: Math.round(earned * 10) / 10, answerText };
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!document.getElementById("studentName").value.trim() || !document.getElementById("studentClass").value || !document.getElementById("teacherName").value) {
    showSecurityWarning("יש למלא שם תלמיד/ה, לבחור כיתה ולבחור שם מורה לפני השליחה.");
    return;
  }
  const submitBtn = document.getElementById("finalSubmitBtn");
  submitBtn.disabled = true; submitBtn.textContent = "שולח/ת את המטלה...";
  let score = 0; const review = [], answersForSheet = {};
  questions.forEach(q => {
    const result = gradeQuestion(q);
    score += result.earned; answersForSheet[q.id] = result.answerText;
    review.push({ title: q.title, section: q.section, earned: result.earned, points: q.points, studentAnswer: result.answerText });
  });
  score = Math.round(score * 10) / 10;
  const percent = Math.round((score / TOTAL_POINTS) * 100);
  const payload = {
    studentName: document.getElementById("studentName").value || "",
    studentClass: document.getElementById("studentClass").value || "",
    teacherName: document.getElementById("teacherName").value || "",
    score, percent,
    q1: answersForSheet.q1 || "", q2: answersForSheet.q2 || "", q3: answersForSheet.q3 || "", q4: "", q5: "", q6: "", q7: "", q8: "", q9: "", q10: "", q11a: "", q11b: "", q11c: "",
    focusLossCount, copyPasteCount, fullscreenExitCount,
    elapsedMinutes: Math.round(((Date.now() - assignmentStartTime) / 60000) * 10) / 10,
    securityStatus: (focusLossCount + copyPasteCount + fullscreenExitCount) === 0 ? "תקין" : ((focusLossCount + copyPasteCount + fullscreenExitCount) <= 2 ? "אזהרה" : "חשד"),
    securityEvents: securityEvents.join(" || ")
  };
  let savedToSheet = false, saveMessage = "";
  try {
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, { method:"POST", mode:"no-cors", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(payload) });
    savedToSheet = true; saveMessage = "ההגשה נשלחה לטבלת Google Sheets.";
  } catch (error) {
    saveMessage = "אירעה בעיה בשליחת הנתונים לטבלה. מומלץ לצלם מסך ולפנות למורה.";
  }
  const resultBox = document.getElementById("result");
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `<h2>תוצאה</h2><p class="score">ציון: ${score} מתוך ${TOTAL_POINTS} נקודות (${percent})</p><p><strong>שם:</strong> ${payload.studentName}</p><p><strong>כיתה:</strong> ${payload.studentClass}</p><p><strong>שם המורה:</strong> ${payload.teacherName}</p><p class="${savedToSheet ? "correct" : "wrong"}">${saveMessage}</p><p><strong>בקרת מסך:</strong> יציאות מהמסך: ${payload.focusLossCount}, ניסיונות העתקה/הדבקה: ${payload.copyPasteCount}, יציאות ממסך מלא: ${payload.fullscreenExitCount}, סטטוס: ${payload.securityStatus}</p><h3>פירוט בדיקה</h3>${review.map(item => `<div class="review-item"><p><strong>${item.section}</strong></p><p>${item.title}</p><p><strong>תשובת התלמיד/ה:</strong> ${item.studentAnswer || "לא נענתה"}</p><p class="${item.earned === item.points ? "correct" : item.earned > 0 ? "partial" : "wrong"}">ניקוד: ${item.earned}/${item.points}</p></div>`).join("")}`;
  submitBtn.disabled = false; submitBtn.textContent = "שליחה סופית, שמירת התשובות וחישוב ציון";
  resultBox.scrollIntoView({ behavior: "smooth" });
}

renderQuestions();
setupInteractiveFeatures();
setupSecurityControls();
document.getElementById("assignmentForm").addEventListener("submit", handleSubmit);
