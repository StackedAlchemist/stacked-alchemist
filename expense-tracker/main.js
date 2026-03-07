/* ============================================================
   ARCANE LEDGER — Expense Tracker JS
   Categories · Filtering · Sorting · Edit modal · Spend bar
============================================================ */

/* ── State ── */
let transactions = JSON.parse(localStorage.getItem("arcane_transactions") || "[]");
let activeType   = "income";
let editId       = null;

/* ── DOM ── */
const descInput   = document.getElementById("descriptionInput");
const amountInput = document.getElementById("amountInput");
const catInput    = document.getElementById("categoryInput");
const dateInput   = document.getElementById("dateInput");
const addBtn      = document.getElementById("addBtn");
const addBtnLabel = document.getElementById("addBtnLabel");
const txList      = document.getElementById("transactionList");
const txCount     = document.getElementById("txCount");
const filterType  = document.getElementById("filterType");
const filterCat   = document.getElementById("filterCat");
const sortBy      = document.getElementById("sortBy");
const modalOverlay= document.getElementById("modalOverlay");
const modalClose  = document.getElementById("modalClose");

/* ── Cursor ── */
const dot = document.getElementById("cursorDot");
const ring= document.getElementById("cursorRing");
let mx=0,my=0,rx=0,ry=0;
document.addEventListener("mousemove", e=>{ mx=e.clientX; my=e.clientY; });
(function ac(){
  rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
  if(dot){ dot.style.left=mx+"px"; dot.style.top=my+"px"; }
  if(ring){ ring.style.left=rx+"px"; ring.style.top=ry+"px"; }
  requestAnimationFrame(ac);
})();

/* ── Init ── */
document.addEventListener("DOMContentLoaded", ()=>{
  // Set today's date as default
  dateInput.value = new Date().toISOString().slice(0,10);
  // Migrate old data from previous key if exists
  const old = localStorage.getItem("transactions");
  if (old && !transactions.length) {
    try {
      const parsed = JSON.parse(old);
      if (parsed.length) {
        transactions = parsed.map(t=>({...t, category:"general", date: new Date().toISOString().slice(0,10)}));
        persist();
      }
    } catch {}
  }
  render(); updateTotals(); bindEvents();
});

/* ── Events ── */
function bindEvents(){
  // Type tabs
  document.querySelectorAll(".type-tab").forEach(tab=>{
    tab.addEventListener("click",()=>{
      document.querySelectorAll(".type-tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
      activeType = tab.dataset.type;
      updateAddBtn();
    });
  });

  // Add button
  addBtn.addEventListener("click", addTransaction);
  document.addEventListener("keydown", e=>{ if(e.key==="Enter" && !modalOverlay.classList.contains("hidden")) return; if(e.key==="Enter") addTransaction(); });

  // Filters / sort
  filterType.addEventListener("change", render);
  filterCat.addEventListener("change",  render);
  sortBy.addEventListener("change",     render);

  // Clear all
  document.getElementById("clearAllBtn").addEventListener("click",()=>{
    if (!transactions.length) return;
    if (confirm("Clear all transactions? This cannot be undone.")) {
      transactions = []; persist(); render(); updateTotals();
    }
  });

  // Modal close
  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", e=>{ if(e.target===modalOverlay) closeModal(); });

  // Save edit
  document.getElementById("saveEdit").addEventListener("click", saveEdit);
}

/* ── Add Transaction ── */
function addTransaction(){
  const desc   = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const cat    = catInput.value;
  const date   = dateInput.value || new Date().toISOString().slice(0,10);

  if (!desc)              { shake(descInput);   return; }
  if (!amount || amount<=0){ shake(amountInput); return; }

  transactions.unshift({ id: Date.now(), description: desc, amount, type: activeType, category: cat, date });
  persist(); render(); updateTotals();

  descInput.value  = "";
  amountInput.value= "";
  dateInput.value  = new Date().toISOString().slice(0,10);
  descInput.focus();
}

/* ── Render List ── */
function render(){
  let list = [...transactions];

  // Filter
  const ft = filterType.value;
  const fc = filterCat.value;
  if (ft !== "all") list = list.filter(t=>t.type === ft);
  if (fc !== "all") list = list.filter(t=>(t.category||"general") === fc);

  // Sort
  switch(sortBy.value){
    case "oldest":  list.sort((a,b)=>a.id-b.id); break;
    case "highest": list.sort((a,b)=>b.amount-a.amount); break;
    case "lowest":  list.sort((a,b)=>a.amount-b.amount); break;
    default:        list.sort((a,b)=>b.id-a.id);
  }

  txCount.textContent = `${list.length} transaction${list.length!==1?"s":""}`;

  if (!list.length){
    txList.innerHTML=`<li class="empty-state"><span class="empty-icon">⚗</span><p>${ft!=="all"||fc!=="all"?"No transactions match your filters.":"No transactions yet.<br>Add your first entry above."}</p></li>`;
    return;
  }

  txList.innerHTML = list.map(t=>{
    const dateStr = t.date ? new Date(t.date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
    const sign    = t.type==="expense" ? "-" : "+";
    const cat     = (t.category||"general").replace(/-/g," ");
    return `<li class="tx-item ${t.type}" data-id="${t.id}">
      <div class="tx-dot"></div>
      <div class="tx-body">
        <div class="tx-desc">${escHtml(t.description)}</div>
        <div class="tx-meta">
          ${dateStr ? `<span>${dateStr}</span>` : ""}
          <span class="tx-cat-badge">${cat}</span>
          <span>${t.type}</span>
        </div>
      </div>
      <div class="tx-amount">${sign}$${t.amount.toFixed(2)}</div>
      <div class="tx-actions">
        <button class="tx-btn edit-btn" data-id="${t.id}" title="Edit">✎</button>
        <button class="tx-btn del-btn"  data-id="${t.id}" title="Delete">✕</button>
      </div>
    </li>`;
  }).join("");

  txList.querySelectorAll(".del-btn").forEach(btn=>{
    btn.addEventListener("click", e=>{ e.stopPropagation(); deleteTransaction(parseInt(btn.dataset.id)); });
  });
  txList.querySelectorAll(".edit-btn").forEach(btn=>{
    btn.addEventListener("click", e=>{ e.stopPropagation(); openEditModal(parseInt(btn.dataset.id)); });
  });
}

/* ── Delete ── */
function deleteTransaction(id){
  transactions = transactions.filter(t=>t.id!==id);
  persist(); render(); updateTotals();
}

/* ── Edit Modal ── */
function openEditModal(id){
  const t = transactions.find(x=>x.id===id);
  if (!t) return;
  editId = id;
  document.getElementById("editDesc").value     = t.description;
  document.getElementById("editAmount").value   = t.amount;
  document.getElementById("editCategory").value = t.category||"general";
  modalOverlay.classList.remove("hidden");
}

function saveEdit(){
  const t = transactions.find(x=>x.id===editId);
  if (!t) return;
  const desc   = document.getElementById("editDesc").value.trim();
  const amount = parseFloat(document.getElementById("editAmount").value);
  const cat    = document.getElementById("editCategory").value;
  if (!desc || !amount || amount<=0) return;
  t.description = desc; t.amount = amount; t.category = cat;
  persist(); render(); updateTotals(); closeModal();
}

function closeModal(){ modalOverlay.classList.add("hidden"); editId=null; }

/* ── Totals + Spend Bar ── */
function updateTotals(){
  let income=0, expenses=0;
  transactions.forEach(t=>{
    if (t.type==="income"||t.type==="borrowed") income   += t.amount;
    else if (t.type==="expense")                expenses += t.amount;
  });
  const balance = income - expenses;
  const pct     = income > 0 ? Math.min((expenses/income)*100, 100) : 0;

  document.getElementById("totalIncome").textContent   = `$${income.toFixed(2)}`;
  document.getElementById("totalExpenses").textContent = `$${expenses.toFixed(2)}`;
  const balEl = document.getElementById("balance");
  balEl.textContent = `$${Math.abs(balance).toFixed(2)}${balance<0?" (deficit)":""}`;
  balEl.classList.toggle("negative", balance < 0);

  // Spend bar
  const bar  = document.getElementById("spendBar");
  const pctEl= document.getElementById("spendPct");
  bar.style.width = pct + "%";
  pctEl.textContent = pct.toFixed(0) + "%";
  bar.classList.remove("warn","danger");
  if (pct >= 90) bar.classList.add("danger");
  else if (pct >= 70) bar.classList.add("warn");
}

/* ── Update Add Button ── */
function updateAddBtn(){
  const labels = { income:"+ Add Income", borrowed:"+ Add Borrowed", expense:"+ Add Expense" };
  addBtnLabel.textContent = labels[activeType] || "+ Add";
  addBtn.className = `add-btn ${activeType}-mode`;
}

/* ── Helpers ── */
function persist(){ localStorage.setItem("arcane_transactions", JSON.stringify(transactions)); }

function shake(el){
  el.style.animation="none"; el.offsetHeight;
  el.style.animation="shake .3s ease";
  el.addEventListener("animationend",()=>{ el.style.animation=""; },{once:true});
}

function escHtml(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// Shake keyframes injected
const style = document.createElement("style");
style.textContent=`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`;
document.head.appendChild(style);
