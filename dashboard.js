// ===== Firebase CDN ESM =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, where, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ========= إعدادي Firebase =========
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
initializeApp(firebaseConfig);
const db = getFirestore();

// ======== EmailJS (لإشعار المندوب بالقرار) =========
// (اختياري) فعّليه لو حابة ترسلي ايميل تلقائي للمقبول/المرفوض
window.emailjsInit = () => {
  // ضعي الـ User ID
  emailjs.init("YOUR_EMAILJS_USER_ID");
}
const loadEmailJs = () => new Promise(res=>{
  const s=document.createElement('script'); s.src="https://cdn.emailjs.com/dist/email.min.js";
  s.onload=()=>{ window.emailjsInit(); res(); }; document.body.appendChild(s);
});

// ========= DOM =========
const tbody = document.getElementById('agentsTbody');
const kpiAgents = document.getElementById('kpiAgents');
const kpiLeads  = document.getElementById('kpiLeads');
const kpiConv   = document.getElementById('kpiConv');
const kpiTop    = document.getElementById('kpiTop');

const fCountry = document.getElementById('fCountry');
const fAgeMin  = document.getElementById('fAgeMin');
const fExpMin  = document.getElementById('fExpMin');
const fStatus  = document.getElementById('fStatus');

const btnApply = document.getElementById('applyFilters');
const btnClear = document.getElementById('clearFilters');
const btnRunAI = document.getElementById('runAi');
const btnCSV   = document.getElementById('exportCsv');

// ========= State =========
let AGENTS = []; // من Firestore
let FILTERED = [];
let chart;

// ======== جلب المندوبين (collection: agents) ========
async function fetchAgents() {
  const snap = await getDocs(collection(db, "agents"));
  AGENTS = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  FILTERED = [...AGENTS];
  render();
}

// ======== عرض الجدول + KPIs ========
function render() {
  // جدول
  tbody.innerHTML = FILTERED.map(a => {
    const conv = safePerc(a.conversions, a.leads);
    return `
      <tr>
        <td>${a.name || '—'}</td>
        <td>${a.age ?? '—'}</td>
        <td>${a.country || '—'}</td>
        <td>${a.experience_years ?? 0}</td>
        <td>${a.leads ?? 0}</td>
        <td>${a.sales ?? 0}</td>
        <td>${conv}%</td>
        <td><span class="status ${a.status || 'pending'}">${statusLabel(a.status)}</span></td>
        <td>
          <div class="flex">
            <button class="btn" data-approve="${a.id}">قبول</button>
            <button class="btn danger" data-reject="${a.id}">رفض</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // KPIs
  const active = AGENTS.filter(a=>a.status==='approved').length;
  kpiAgents.textContent = `${active}/${AGENTS.length}`;

  const today = new Date().toISOString().slice(0,10);
  const todayLeads = AGENTS.reduce((s,a)=>s+(a.leads_by_day?.[today]||0),0);
  kpiLeads.textContent = todayLeads;

  const last7 = daysArray(7);
  const leads7 = sumOverDays(AGENTS, 'leads_by_day', last7);
  const conv7  = sumOverDays(AGENTS, 'conversions_by_day', last7);
  kpiConv.textContent = safePerc(conv7, leads7)+'%';

  const top = [...AGENTS].sort((a,b)=>(b.sales||0)-(a.sales||0))[0];
  kpiTop.textContent = top?.name || '—';

  // Chart (مبيعات 30 يوم)
  const last30 = daysArray(30);
  const sales30 = last30.map(d => AGENTS.reduce((s,a)=>s+(a.sales_by_day?.[d]||0),0));
  drawChart(last30, sales30);

  // أزرار الصف
  tbody.querySelectorAll('[data-approve]').forEach(btn=>{
    btn.onclick = ()=> manualDecision(btn.dataset.approve, true);
  });
  tbody.querySelectorAll('[data-reject]').forEach(btn=>{
    btn.onclick = ()=> manualDecision(btn.dataset.reject, false);
  });
}

// ======== أدوات عرض ========
const statusLabel=(s)=> s==='approved'?'مقبول':(s==='rejected'?'مرفوض':'قيد المراجعة');
const safePerc=(a,b)=> (b?Math.round((a||0)*100/b):0);
const daysArray=(n)=> Array.from({length:n},(_,i)=>{
  const d=new Date(); d.setDate(d.getDate()-(n-1-i));
  return d.toISOString().slice(0,10);
});
function sumOverDays(list, key, days){
  return list.reduce((sum,a)=> sum + days.reduce((s,d)=> s + (a[key]?.[d]||0),0),0);
}
function drawChart(labels, data){
  const ctx = document.getElementById('salesChart');
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets:[{ label:'إجمالي المبيعات', data }] },
    options:{ plugins:{legend:{display:false}}, scales:{x:{ticks:{color:'#9aa0a6'}}, y:{ticks:{color:'#9aa0a6'}}} }
  });
}

// ======== فلاتر ========
function applyFilters(){
  const c = fCountry.value.trim().toLowerCase();
  const amin = Number(fAgeMin.value||0);
  const emin = Number(fExpMin.value||0);
  const st = fStatus.value;

  FILTERED = AGENTS.filter(a=>{
    let ok = true;
    if(c) ok = ok && (String(a.country||'').toLowerCase().includes(c));
    if(amin) ok = ok && (Number(a.age||0) >= amin);
    if(emin) ok = ok && (Number(a.experience_years||0) >= emin);
    if(st) ok = ok && ((a.status||'pending')===st);
    return ok;
  });
  render();
}
document.getElementById('applyFilters').onclick = applyFilters;
document.getElementById('clearFilters').onclick = ()=>{ fCountry.value='';fAgeMin.value='';fExpMin.value='';fStatus.value=''; FILTERED=[...AGENTS]; render(); };

// ======== “ذكاء اصطناعي” (Rule Engine خفيف) ========
// عدّلي الشروط براحتك:
const AI_CRITERIA = {
  minAge: 18,
  minExperienceYears: 1,
  allowedCountries: [],     // فارغة = كل الدول
  minConvPercent: 3,        // تحويل آخر 7 أيام
  minSales: 0
};

function scoreAgent(agent){
  let score = 0, reasons = [];

  if(agent.age >= AI_CRITERIA.minAge){ score+=20 } else { reasons.push('العمر أقل من المطلوب'); }
  if((agent.experience_years||0) >= AI_CRITERIA.minExperienceYears){ score+=20 } else { reasons.push('خبرة أقل من المطلوب'); }

  const countryOk = !AI_CRITERIA.allowedCountries.length || AI_CRITERIA.allowedCountries.includes(agent.country);
  if(countryOk){ score+=15 } else { reasons.push('الدولة خارج النطاق'); }

  // تحويل 7 أيام
  const last7 = daysArray(7);
  const leads7 = last7.reduce((s,d)=> s + (agent.leads_by_day?.[d]||0), 0);
  const conv7  = last7.reduce((s,d)=> s + (agent.conversions_by_day?.[d]||0), 0);
  const convPct = safePerc(conv7, leads7);
  if(convPct >= AI_CRITERIA.minConvPercent){ score+=25 } else { reasons.push('نسبة التحويل منخفضة'); }

  if((agent.sales||0) >= AI_CRITERIA.minSales){ score+=20 } else { reasons.push('مبيعات منخفضة'); }

  return { score, reasons };
}

async function runAI(){
  await Promise.all(AGENTS.filter(a=>(a.status||'pending')==='pending').map(async a=>{
    const { score, reasons } = scoreAgent(a);
    const approve = score >= 60; // العتبة
    const decision = approve ? 'approved' : 'rejected';
    await updateDoc(doc(db,'agents',a.id), { status: decision, decision_reason: approve?'قبول تلقائي':'رفض تلقائي', decision_score: score, decided_at: new Date() });
    // إشعار بريد (اختياري)
    try{
      if(window.emailjs){ 
        await emailjs.send('YOUR_EMAILJS_SERVICE', 'YOUR_EMAILJS_TEMPLATE', {
          to_email: a.email || 'hshmhshm72@gmail.com',
          agent_name: a.name || 'مندوب',
          decision: approve?'تم قبولك':'نأسف، تم الرفض',
          reasons: reasons.join(' - ')
        });
      }
    }catch(e){ console.warn('EmailJS error',e); }
  }));
  await fetchAgents();
}
document.getElementById('runAi').onclick = runAI;

// قرار يدوي من الجدول
async function manualDecision(id, approve){
  await updateDoc(doc(db,'agents',id), { status: approve?'approved':'rejected', decided_at:new Date(), decision_reason:'قرار يدوي' });
  await fetchAgents();
}

// ======== تصدير CSV ========
document.getElementById('exportCsv').onclick = ()=>{
  const rows = [['name','age','country','experience_years','leads','sales','status']];
  FILTERED.forEach(a=> rows.push([a.name||'',a.age||'',a.country||'',a.experience_years||'',a.leads||0,a.sales||0,a.status||'pending']));
  const csv = rows.map(r=> r.map(v=> `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='agents.csv'; a.click(); URL.revokeObjectURL(url);
};

// ======== تشغيل أولي ========
fetchAgents();
loadEmailJs().catch(()=>{ /* عادي لو ما تحتاجي ايميلات */ });
