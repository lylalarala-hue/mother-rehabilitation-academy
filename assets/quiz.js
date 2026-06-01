/* ============================================================
   確認テスト 共通エンジン（全DAY共通・基本的に編集不要）
   ── 各 dayX.html の window.QUIZ から設定と設問を受け取り、
      ヘッダー・問題・採点・解説・結果記録までを描画します。
      見た目は assets/quiz.css、記録先は CONFIG.endpoint。
   ============================================================ */
const CONFIG = window.QUIZ.config;
const QUESTIONS = window.QUIZ.questions;

/* ページ全体を描画（旧 quiz-day1.html の <body> と同一マークアップ） */
document.getElementById('app').innerHTML = `
  <div class="masthead">
    <img class="logo" src="assets/logo.png" alt="産前産後リハビリアカデミー" alt="産前産後リハビリアカデミー"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
    <div class="wordmark">
      <span class="wm-mark">産</span>
      <span class="wm-text">産前産後リハビリアカデミー</span>
      <span class="wm-sub">Perinatal &amp; Postnatal Rehabilitation Academy</span>
    </div>
    <span class="pill">確認テスト</span>
  </div>

  <!-- ===== START ===== -->
  <div class="card" id="start">
    <div class="eyebrow" id="dayLabel"></div>
    <h1 id="dayTitle"></h1>
    <p class="lead">オンライン座学の内容を確認するテストです。合格すると、対面ハンズオンへの参加準備が整います。落ち着いて取り組んでください。</p>
    <ul class="rules">
      <li><span class="ic">問</span><span><b id="qnum"></b>問の選択式です（所要 約5〜8分）</span></li>
      <li><span class="ic">%</span><span>合格ラインは <b id="passLabel"></b>。<b>合格するまで何度でも</b>再受験できます</span></li>
      <li><span class="ic">解</span><span>回答後にすべての問題の<b>解説</b>が表示されます。復習に活用してください</span></li>
      <li><span class="ic">注</span><span>各回に<b>リスク管理・禁忌</b>の設問が含まれます。実技前の安全確認として重要です</span></li>
    </ul>
    <label class="fld" for="name">お名前（フルネーム）</label>
    <input type="text" id="name" placeholder="例）山田 花子" autocomplete="name" />
    <p class="hint">※ 結果記録に使用します。申込時のお名前と同じ表記で入力してください。</p>
    <div class="btn-row">
      <button class="btn btn-primary" id="startBtn" disabled>テストを始める</button>
    </div>
    <p class="sample-note">＊ 現在は動作確認用のサンプル問題です（後日スライドから差し替えます）</p>
  </div>

  <!-- ===== QUIZ ===== -->
  <div class="card hide" id="quiz">
    <div class="top">
      <span class="qcount" id="qcount"></span>
      <span class="tag" id="qtag"></span>
    </div>
    <div class="bar"><i id="barFill" style="width:0%"></i></div>
    <div class="q" id="qText"></div>
    <div class="opts" id="opts"></div>
    <div class="btn-row">
      <button class="btn btn-primary" id="nextBtn" disabled>次へ</button>
    </div>
  </div>

  <!-- ===== RESULT ===== -->
  <div class="card hide" id="result">
    <div class="scorewrap">
      <div class="ring" id="ring"><span class="num" id="scoreNum"></span></div>
      <div class="verdict" id="verdict"></div>
      <div class="vsub" id="vsub"></div>
    </div>
    <div class="banner" id="banner"></div>
    <div class="review">
      <h3>復習 ── 全問の解説</h3>
      <div id="reviewList"></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost hide" id="retryBtn">もう一度挑戦する</button>
    </div>
    <p class="foot" id="recordNote"></p>
  </div>

  <div class="sitefoot">
    <span class="org">主催 マザーヘルス協会　／　共催 ENCOUNTER　／　後援 想千グループ</span><br>
    © 産前産後リハビリアカデミー
  </div>
`;

/* ============================================================
   ③ ロジック（基本的に編集不要）
   ============================================================ */
const $ = id => document.getElementById(id);
const total = QUESTIONS.length;
const passNeed = Math.ceil(total * CONFIG.passRatio);
let cur = 0, picks = [], attempt = 0, userName = "";

// 初期表示
$("dayLabel").textContent = CONFIG.day;
$("dayTitle").textContent = CONFIG.title + " ── 確認テスト";
$("qnum").textContent = total;
$("passLabel").textContent = Math.round(CONFIG.passRatio*100) + "％（" + total + "問中 " + passNeed + "問）";

$("name").addEventListener("input", e => {
  userName = e.target.value.trim();
  $("startBtn").disabled = userName.length === 0;
});
$("startBtn").addEventListener("click", startQuiz);
$("nextBtn").addEventListener("click", goNext);
$("retryBtn").addEventListener("click", () => { startQuiz(); });

function startQuiz(){
  cur = 0; picks = new Array(total).fill(null); attempt++;
  $("start").classList.add("hide");
  $("result").classList.add("hide");
  $("quiz").classList.remove("hide");
  render();
}

function render(){
  const item = QUESTIONS[cur];
  $("qcount").textContent = "問 " + (cur+1) + " / " + total;
  $("qtag").textContent = item.tag || "";
  $("qtag").style.display = item.tag ? "" : "none";
  $("barFill").style.width = ((cur)/total*100) + "%";
  $("qText").textContent = item.q;

  const box = $("opts"); box.innerHTML = "";
  const labels = ["A","B","C","D","E"];
  item.options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.className = "opt" + (picks[cur]===i ? " sel" : "");
    b.innerHTML = '<span class="mk">'+labels[i]+'</span><span>'+opt+'</span>';
    b.addEventListener("click", () => {
      picks[cur] = i;
      [...box.children].forEach(c=>c.classList.remove("sel"));
      b.classList.add("sel");
      $("nextBtn").disabled = false;
    });
    box.appendChild(b);
  });
  $("nextBtn").disabled = picks[cur]===null;
  $("nextBtn").textContent = (cur === total-1) ? "採点する" : "次へ";
}

function goNext(){
  if(picks[cur]===null) return;
  if(cur < total-1){ cur++; render(); }
  else finish();
}

function finish(){
  const correct = picks.reduce((n,p,i)=> n + (p===QUESTIONS[i].answer?1:0), 0);
  const pct = Math.round(correct/total*100);
  const pass = correct >= passNeed;
  const wrongList = QUESTIONS
    .map((q,i)=> picks[i]===q.answer ? null : ("Q"+(i+1)))
    .filter(Boolean).join(", ") || "（なし）";

  $("quiz").classList.add("hide");
  $("result").classList.remove("hide");

  // スコアリング
  $("ring").style.setProperty("--rc", pass ? "var(--sage)" : "var(--clay)");
  $("ring").style.setProperty("--p", pct);
  $("scoreNum").innerHTML = correct + "/" + total + "<small>正答率 " + pct + "％</small>";

  const v = $("verdict"); const b = $("banner");
  if(pass){
    v.textContent = "合格"; v.className = "verdict pass";
    $("vsub").textContent = "お疲れさまでした。基準を満たしました。";
    b.className = "banner pass";
    b.innerHTML = "<b>"+userName+" さん、合格です。</b><br>この内容の理解が確認できました。ハンズオン（対面実技）の準備が整っています。下記の解説で総復習しておきましょう。";
    $("retryBtn").classList.add("hide");
  }else{
    v.textContent = "もう少し"; v.className = "verdict fail";
    $("vsub").textContent = "合格まで あと " + (passNeed - correct) + " 問です。";
    b.className = "banner fail";
    b.innerHTML = "<b>"+userName+" さん、惜しい！</b><br>下の解説でつまずいた箇所を確認し、もう一度挑戦してください。<b>回数制限はありません</b>。理解の定着が目的です。";
    $("retryBtn").classList.remove("hide");
  }

  buildReview();
  recordResult(correct, total, pct, pass, wrongList); // スプレッドシートへ記録
}

function buildReview(){
  const list = $("reviewList"); list.innerHTML = "";
  QUESTIONS.forEach((item, i) => {
    const ok = picks[i] === item.answer;
    const card = document.createElement("div");
    card.className = "rev " + (ok ? "ok" : "ng");
    const yours = picks[i]===null ? "（無回答）" : item.options[picks[i]];
    card.innerHTML =
      '<div class="rq"><span class="badge">'+(ok?"✓":"×")+'</span><span>'+(i+1)+'. '+item.q+'</span></div>'+
      (ok ? '' :
        '<div class="ans yours"><span class="lab">あなたの回答：</span><span class="val">'+yours+'</span></div>') +
      '<div class="ans correct"><span class="lab">正答：</span><span class="val">'+item.options[item.answer]+'</span></div>'+
      '<div class="expl"><b>解説 ─</b> '+item.expl+'</div>';
    list.appendChild(card);
  });
}

/* スプレッドシートへ記録（Apps Script ウェブアプリへ POST） */
function recordResult(correct, total, pct, pass, wrongList){
  const note = $("recordNote");
  const payload = {
    timestamp: new Date().toISOString(),
    name: userName,
    day: CONFIG.day,
    score: correct,
    total: total,
    percent: pct,
    pass: pass ? "合格" : "不合格",
    attempt: attempt,
    wrongList: wrongList
  };
  if(!CONFIG.endpoint || CONFIG.endpoint.indexOf("http") !== 0){
    note.textContent = "（記録先 未設定：本番ではApps ScriptのURLを設定すると自動記録されます）";
    console.log("記録データ（送信されません）:", payload);
    return;
  }
  fetch(CONFIG.endpoint, {
    method:"POST",
    mode:"no-cors",
    headers:{ "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).then(()=>{
    note.textContent = "結果を記録しました。";
  }).catch(()=>{
    note.textContent = "※ 記録の送信に失敗しました。通信環境をご確認のうえ、もう一度送信してください。";
  });
}
