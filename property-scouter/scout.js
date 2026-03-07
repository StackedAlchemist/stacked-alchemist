/* ScoutDrive — scout.js */

/* ══ MOCK DATA ══
   In production, replace generatePropertyData() with calls to:
   - ATTOM Data API (property details, tax records, permit history)
   - Rentcast API (estimated values, comps)
   - Google Maps Geocoding API (address validation + coordinates)
   All marked with: // TODO: API_CALL
*/

var currentRole = "scout";
var leads = loadData("sd_leads", generateDefaultLeads());
var scoutTeam = loadData("sd_scouts", generateDefaultScouts());

function loadData(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch(e) { return fallback; }
}
function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function fmtMoney(n) { return "$" + Math.round(n).toLocaleString(); }
function fmtDate(s) { var d = new Date(s); return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }

/* ── Default data ── */
function generateDefaultLeads() {
  return [
    { id:"l1", address:"742 Evergreen Terrace", city:"Springfield", state:"AZ", type:"single-family", condition:"needs-work", urgency:"hot", notes:"Vacant for 6+ months. Broken windows on side. Yard overgrown. Owner moved out.", status:"accepted", scoutId:"me", submittedAt:"2026-02-15", earning:250, photo:null },
    { id:"l2", address:"1313 Mockingbird Lane", city:"Mesa", state:"AZ", type:"single-family", condition:"fair", urgency:"normal", notes:"For sale by owner sign. Looks dated inside from the street.", status:"pending", scoutId:"me", submittedAt:"2026-02-28", earning:0, photo:null },
    { id:"l3", address:"221 Baker Street", city:"Phoenix", state:"AZ", type:"multi-family", condition:"good", urgency:"watch", notes:"Duplex. One unit appears vacant. Could be a good rental flip.", status:"offer", scoutId:"me", submittedAt:"2026-01-20", earning:1000, photo:null },
    { id:"l4", address:"88 Sunset Blvd", city:"Tempe", state:"AZ", type:"single-family", condition:"distressed", urgency:"hot", notes:"Fire damage to garage. Abandoned. Could be cheap pickup.", status:"pending", scoutId:"s2", submittedAt:"2026-03-01", earning:0, photo:null },
    { id:"l5", address:"400 Pine Ridge Rd", city:"Chandler", state:"AZ", type:"apartment", condition:"good", urgency:"normal", notes:"12-unit apartment complex. Owner retiring, motivated to sell.", status:"due-diligence", scoutId:"s3", submittedAt:"2026-02-10", earning:500, photo:null },
    { id:"l6", address:"55 Oak Hill Ave", city:"Gilbert", state:"AZ", type:"single-family", condition:"excellent", urgency:"normal", notes:"Beautifully renovated. Neighbor says owner relocating for work.", status:"closed", scoutId:"s2", submittedAt:"2026-01-05", earning:1500, photo:null },
  ];
}
function generateDefaultScouts() {
  return [
    { id:"me",  name:"You (Demo Scout)", avatar:"🧑", color:"#00e5c8", leads:3, accepted:2, closed:1, earned:1250 },
    { id:"s2",  name:"Marcus Johnson",   avatar:"M",  color:"#f5c842", leads:8, accepted:5, closed:2, earned:3200 },
    { id:"s3",  name:"Priya Sharma",     avatar:"P",  color:"#e74c3c", leads:5, accepted:3, closed:1, earned:2100 },
    { id:"s4",  name:"Tyler Brooks",     avatar:"T",  color:"#2ecc71", leads:2, accepted:1, closed:0, earned:50   },
    { id:"s5",  name:"Diana Cruz",       avatar:"D",  color:"#3498db", leads:6, accepted:4, closed:1, earned:1800 },
  ];
}

/* ══ PROPERTY DATA ENGINE ══
   TODO: API_CALL — Replace with real API calls
   Real implementation: GET https://api.attomdata.com/propertyapi/v1.0.0/property/detail?address=...
   or https://api.rentcast.io/v1/properties?address=...
*/
function generatePropertyData(address) {
  // Deterministic seed from address so same address gives same result
  var seed = address.split("").reduce(function(s,c){ return s + c.charCodeAt(0); }, 0);
  var rng = function(min, max) { seed = (seed * 9301 + 49297) % 233280; return min + (seed / 233280) * (max - min); };
  var rand = function(min, max) { return Math.round(rng(min, max)); };

  var types   = ["Single Family","Multi-Family","Townhome","Condo","Duplex"];
  var styles  = ["Ranch","Colonial","Craftsman","Contemporary","Cape Cod","Split-Level"];
  var yr      = rand(1945, 2022);
  var beds    = rand(2, 6);
  var baths   = rand(1, 4);
  var sqft    = rand(900, 4200);
  var estVal  = rand(180000, 850000);
  var lastSalePrice = Math.round(estVal * (0.65 + rng(0,0.3)));
  var lastSaleYr    = rand(2010, 2024);

  var permitTypes = ["electrical","plumbing","structural","renovation","hvac"];
  var permitDescs = {
    electrical: ["Panel upgrade 200A","Rewire kitchen","Add outdoor outlets","Install ceiling fans"],
    plumbing:   ["Water heater replacement","Pipe repair main line","Add bathroom","Kitchen remodel plumbing"],
    structural: ["Roof replacement","Foundation repair","Room addition","Garage conversion"],
    renovation: ["Kitchen remodel","Full bath remodel","Flooring replacement","Window replacement"],
    hvac:       ["New HVAC system","Ductwork replacement","Add mini-split","Furnace replacement"]
  };
  var permits = [];
  var numPermits = rand(1, 6);
  for(var i = 0; i < numPermits; i++) {
    var pType = permitTypes[rand(0, permitTypes.length - 1)];
    var pDescs = permitDescs[pType];
    var pYr = rand(yr, 2025);
    permits.push({
      date: pYr + "-" + String(rand(1,12)).padStart(2,"0") + "-" + String(rand(1,28)).padStart(2,"0"),
      type: pType,
      description: pDescs[rand(0, pDescs.length - 1)],
      status: rng(0,1) > 0.15 ? "Finalized" : "Open"
    });
  }
  permits.sort(function(a,b){ return b.date.localeCompare(a.date); });

  var streetNames = ["Oak","Maple","Pine","Elm","Cedar","Birch","Walnut","Cherry","Willow","Aspen"];
  var comps = [];
  for(var j = 0; j < 4; j++) {
    var compBeds = Math.max(1, beds + rand(-1,1));
    var compVal  = Math.round(estVal * (0.8 + rng(0,0.4)));
    var compYr   = rand(2023, 2025);
    comps.push({
      address: rand(100,999) + " " + streetNames[rand(0,9)] + " " + ["St","Ave","Dr","Ln","Blvd"][rand(0,4)],
      beds: compBeds,
      baths: Math.max(1, baths + rand(-1,1)),
      sqft: Math.round(sqft * (0.85 + rng(0,0.3))),
      price: compVal,
      date: compYr + "-" + String(rand(1,12)).padStart(2,"0")
    });
  }

  return {
    address: address,
    type:    types[rand(0, types.length - 1)],
    style:   styles[rand(0, styles.length - 1)],
    yearBuilt: yr,
    beds: beds, baths: baths, sqft: sqft,
    lot: (rng(0.1, 0.6)).toFixed(2) + " acres",
    garage: rand(0,2) > 0 ? rand(1,3) + "-car garage" : "No garage",
    pool: rng(0,1) > 0.65 ? "Yes" : "No",
    estimatedValue: estVal,
    lastSalePrice: lastSalePrice,
    lastSaleDate: lastSaleYr + "-" + String(rand(1,12)).padStart(2,"0"),
    taxYear: 2025,
    annualTax: Math.round(estVal * 0.012),
    owner: ["Smith, J.","Johnson, M.","Williams, K.","Brown, D.","Davis, R.","Martinez, L."][rand(0,5)],
    ownerOccupied: rng(0,1) > 0.4 ? "Yes" : "No",
    daysOnMarket: rng(0,1) > 0.5 ? rand(0,180) + " days" : "Not listed",
    zoning: ["R1","R2","R3","C1","MF"][rand(0,4)],
    permits: permits,
    comps: comps
  };
}

/* ══ ROLE SELECT ══ */
document.getElementById("roleScout").addEventListener("click", function() { startApp("scout"); });
document.getElementById("roleInvestor").addEventListener("click", function() { startApp("investor"); });
document.getElementById("switchRole").addEventListener("click", function() {
  document.getElementById("roleScreen").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
});

function startApp(role) {
  currentRole = role;
  document.getElementById("roleScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("roleBadge").textContent = role === "scout" ? "Scout" : "Investor";
  document.getElementById("roleBadge").style.background = role === "scout" ? "rgba(0,229,200,0.1)" : "rgba(245,200,66,0.1)";
  document.getElementById("roleBadge").style.borderColor = role === "scout" ? "rgba(0,229,200,0.3)" : "rgba(245,200,66,0.3)";
  document.getElementById("roleBadge").style.color = role === "scout" ? "var(--teal)" : "var(--gold)";
  if(role === "scout") {
    document.getElementById("scoutApp").classList.remove("hidden");
    document.getElementById("investorApp").classList.add("hidden");
    buildScoutNav();
    showScoutScreen("scout-home");
    updateScoutStats();
  } else {
    document.getElementById("investorApp").classList.remove("hidden");
    document.getElementById("scoutApp").classList.add("hidden");
    buildInvestorNav();
    showInvestorScreen("investor-home");
    updateInvestorStats();
  }
}

/* ══ NAVIGATION ══ */
var scoutScreenHistory = [], investorScreenHistory = [];

function showScoutScreen(name, pushHistory) {
  if(pushHistory !== false && scoutScreenHistory[scoutScreenHistory.length-1] !== name) {
    scoutScreenHistory.push(name);
  }
  document.querySelectorAll("#scoutApp .screen").forEach(function(s){ s.classList.remove("active"); });
  var el = document.getElementById("screen-" + name);
  if(el) el.classList.add("active");
  document.getElementById("backBtn").classList.toggle("hidden", scoutScreenHistory.length <= 1);
  updateNavActive(name);
  window.scrollTo(0,0);
  renderScoutScreen(name);
}
function showInvestorScreen(name, pushHistory) {
  if(pushHistory !== false && investorScreenHistory[investorScreenHistory.length-1] !== name) {
    investorScreenHistory.push(name);
  }
  document.querySelectorAll("#investorApp .screen").forEach(function(s){ s.classList.remove("active"); });
  var el = document.getElementById("screen-" + name);
  if(el) el.classList.add("active");
  document.getElementById("backBtn").classList.toggle("hidden", investorScreenHistory.length <= 1);
  updateNavActive(name);
  window.scrollTo(0,0);
  renderInvestorScreen(name);
}

document.getElementById("backBtn").addEventListener("click", function() {
  if(currentRole === "scout") {
    scoutScreenHistory.pop();
    var prev = scoutScreenHistory[scoutScreenHistory.length-1] || "scout-home";
    showScoutScreen(prev, false);
  } else {
    investorScreenHistory.pop();
    var prev = investorScreenHistory[investorScreenHistory.length-1] || "investor-home";
    showInvestorScreen(prev, false);
  }
});

function updateNavActive(screenName) {
  document.querySelectorAll(".nav-btn").forEach(function(b){ b.classList.remove("active"); });
  var navMap = {"scout-home":"nav-home","submit":"nav-submit","lookup":"nav-lookup","nearby":"nav-nearby","my-leads":"nav-leads","investor-home":"nav-home","review-leads":"nav-leads","pipeline":"nav-pipeline","inv-lookup":"nav-lookup","scouts":"nav-scouts"};
  var id = navMap[screenName];
  if(id) { var btn = document.getElementById(id); if(btn) btn.classList.add("active"); }
}

function buildScoutNav() {
  var existing = document.querySelector(".bottom-nav");
  if(existing) existing.remove();
  var nav = document.createElement("div");
  nav.className = "bottom-nav";
  nav.setAttribute("role","navigation");
  nav.setAttribute("aria-label","Scout navigation");
  nav.innerHTML = [
    {id:"nav-home",   icon:"🏠", label:"Home",    screen:"scout-home"},
    {id:"nav-submit", icon:"📍", label:"Submit",  screen:"submit"},
    {id:"nav-lookup", icon:"🔍", label:"Lookup",  screen:"lookup"},
    {id:"nav-nearby", icon:"🗺️", label:"Nearby",  screen:"nearby"},
    {id:"nav-leads",  icon:"📋", label:"My Leads",screen:"my-leads"}
  ].map(function(n){
    return '<button class="nav-btn" id="'+n.id+'" data-screen="'+n.screen+'" aria-label="'+n.label+'"><span class="nav-btn-icon">'+n.icon+'</span><span class="nav-btn-label">'+n.label+'</span></button>';
  }).join("");
  document.getElementById("app").appendChild(nav);
  nav.querySelectorAll(".nav-btn").forEach(function(b){
    b.addEventListener("click", function(){ scoutScreenHistory = []; showScoutScreen(this.dataset.screen); });
  });
}

function buildInvestorNav() {
  var existing = document.querySelector(".bottom-nav");
  if(existing) existing.remove();
  var nav = document.createElement("div");
  nav.className = "bottom-nav";
  nav.setAttribute("role","navigation");
  nav.setAttribute("aria-label","Investor navigation");
  nav.innerHTML = [
    {id:"nav-home",     icon:"🏛️", label:"Home",    screen:"investor-home"},
    {id:"nav-leads",    icon:"📥", label:"Leads",   screen:"review-leads"},
    {id:"nav-pipeline", icon:"📊", label:"Pipeline",screen:"pipeline"},
    {id:"nav-lookup",   icon:"🔍", label:"Search",  screen:"inv-lookup"},
    {id:"nav-scouts",   icon:"👥", label:"Scouts",  screen:"scouts"}
  ].map(function(n){
    return '<button class="nav-btn" id="'+n.id+'" data-screen="'+n.screen+'" aria-label="'+n.label+'"><span class="nav-btn-icon">'+n.icon+'</span><span class="nav-btn-label">'+n.label+'</span></button>';
  }).join("");
  document.getElementById("app").appendChild(nav);
  nav.querySelectorAll(".nav-btn").forEach(function(b){
    b.addEventListener("click", function(){ investorScreenHistory = []; showInvestorScreen(this.dataset.screen); });
  });
}

/* ══ SCOUT SCREENS ══ */
function renderScoutScreen(name) {
  if(name === "scout-home")  renderScoutHome();
  if(name === "nearby")      renderNearby();
  if(name === "my-leads")    renderMyLeads();
  if(name === "lookup")      { /* static */ }
}

function updateScoutStats() {
  var myLeads   = leads.filter(function(l){ return l.scoutId === "me"; });
  var submitted = myLeads.length;
  var accepted  = myLeads.filter(function(l){ return ["accepted","offer","due-diligence","closed"].includes(l.status); }).length;
  var closed    = myLeads.filter(function(l){ return l.status === "closed"; }).length;
  var earned    = myLeads.reduce(function(s,l){ return s + (l.earning||0); }, 0);
  document.getElementById("scoutSubmitted").textContent = submitted;
  document.getElementById("scoutAccepted").textContent  = accepted;
  document.getElementById("scoutClosed").textContent    = closed;
  document.getElementById("scoutTotal").textContent     = "$" + earned.toLocaleString();
  document.getElementById("scoutEarnings").textContent  = "$" + earned.toLocaleString();
  // Streak (demo: just show 3)
  document.getElementById("streakCount").textContent = 3;
}

function renderScoutHome() {
  updateScoutStats();
  // Time of day
  var h = new Date().getHours();
  document.getElementById("timeOfDay").textContent = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

function renderMyLeads() {
  var myLeads = leads.filter(function(l){ return l.scoutId === "me"; });
  var container = document.getElementById("myLeadsList");
  var filter = document.querySelector("#screen-my-leads .lf-btn.active");
  var activeFilter = filter ? filter.dataset.filter : "all";
  var filtered = activeFilter === "all" ? myLeads : myLeads.filter(function(l){ return l.status === activeFilter; });

  // Filter buttons
  document.querySelectorAll("#screen-my-leads .lf-btn").forEach(function(b){
    b.addEventListener("click", function(){
      document.querySelectorAll("#screen-my-leads .lf-btn").forEach(function(x){ x.classList.remove("active"); });
      this.classList.add("active");
      renderMyLeads();
    });
  });

  if(filtered.length === 0) { container.innerHTML = '<div style="text-align:center;color:var(--muted);padding:3rem;font-style:italic">No leads found</div>'; return; }
  container.innerHTML = filtered.map(function(l){ return leadCardHTML(l, false); }).join("");
  container.querySelectorAll(".lead-card").forEach(function(c){
    c.addEventListener("click", function(){ openLeadModal(this.dataset.id, false); });
  });
}

function renderNearby() {
  var nearbyData = [
    { id:"n1", address:"312 Elm Street",     type:"single-family", est:245000, dist:"0.4 mi",  icon:"🏠", condition:"fair",     lat:38, lng:32  },
    { id:"n2", address:"88 Oak Avenue",      type:"multi-family",  est:480000, dist:"0.7 mi",  icon:"🏘️", condition:"needs-work",lat:62, lng:48  },
    { id:"n3", address:"501 Maple Drive",    type:"single-family", est:320000, dist:"1.1 mi",  icon:"🏠", condition:"good",     lat:28, lng:68  },
    { id:"n4", address:"774 Cedar Lane",     type:"apartment",     est:750000, dist:"1.4 mi",  icon:"🏢", condition:"good",     lat:75, lng:22  },
    { id:"n5", address:"19 Birch Boulevard", type:"single-family", est:195000, dist:"1.8 mi",  icon:"🏚️", condition:"distressed",lat:48, lng:78 },
    { id:"n6", address:"230 Pine Court",     type:"townhome",      est:285000, dist:"2.1 mi",  icon:"🏠", condition:"excellent",lat:18, lng:50  },
  ];

  // Map pins
  var pinsEl = document.getElementById("mapPins");
  var pinColors = { "single-family":"#f5c842","multi-family":"#3498db","apartment":"#9b59b6","townhome":"#2ecc71","distressed":"#e74c3c" };
  pinsEl.innerHTML = nearbyData.map(function(p){
    var color = p.condition === "distressed" ? pinColors.distressed : (pinColors[p.type] || "#f5c842");
    return '<div class="map-pin" style="left:'+p.lng+'%;top:'+p.lat+'%" data-id="'+p.id+'" title="'+p.address+'">'+
      '<div class="pin-dot" style="background:'+color+'"><span>'+p.icon+'</span></div>'+
      '<div class="pin-price">'+fmtMoney(p.est)+'</div>'+
    '</div>';
  }).join("");
  pinsEl.querySelectorAll(".map-pin").forEach(function(pin){
    pin.addEventListener("click", function(){
      var item = nearbyData.find(function(x){ return x.id === pin.dataset.id; });
      if(item) showPropertyCardPopup(item.address + ", Mesa AZ");
    });
  });

  // Nearby list
  document.getElementById("nearbyList").innerHTML = nearbyData.map(function(p){
    return '<div class="nearby-card" data-addr="'+p.address+', Mesa AZ">'+
      '<div class="nearby-icon">'+p.icon+'</div>'+
      '<div class="nearby-body">'+
        '<div class="nearby-addr">'+p.address+'</div>'+
        '<div class="nearby-meta">'+capitalize(p.type)+' · '+p.condition+'</div>'+
      '</div>'+
      '<div>'+
        '<div class="nearby-price">'+fmtMoney(p.est)+'</div>'+
        '<div class="nearby-dist">'+p.dist+'</div>'+
      '</div>'+
    '</div>';
  }).join("");
  document.querySelectorAll(".nearby-card").forEach(function(c){
    c.addEventListener("click", function(){
      showPropertyCardPopup(this.dataset.addr, true);
    });
  });
}

/* ══ PROPERTY LOOKUP ══ */
document.getElementById("lookupGo").addEventListener("click", function(){ doLookup("lookup"); });
document.getElementById("lookupInput").addEventListener("keydown", function(e){ if(e.key==="Enter") doLookup("lookup"); });
document.querySelectorAll(".qs-pill:not([data-target])").forEach(function(p){
  p.addEventListener("click", function(){
    document.getElementById("lookupInput").value = this.dataset.addr;
    doLookup("lookup");
  });
});
document.getElementById("invLookupGo").addEventListener("click", function(){ doLookup("inv"); });
document.getElementById("invLookupInput").addEventListener("keydown", function(e){ if(e.key==="Enter") doLookup("inv"); });
document.querySelectorAll(".qs-pill[data-target='inv']").forEach(function(p){
  p.addEventListener("click", function(){
    document.getElementById("invLookupInput").value = this.dataset.addr;
    doLookup("inv");
  });
});

function doLookup(target) {
  var addr = target === "inv" ? document.getElementById("invLookupInput").value.trim() : document.getElementById("lookupInput").value.trim();
  if(!addr) return;
  var cardEl = target === "inv" ? document.getElementById("invPropertyCard") : document.getElementById("propertyCard");
  renderPropertyCard(addr, cardEl, target === "inv");
}

function showPropertyCardPopup(addr, isInvestor) {
  var cardEl = isInvestor ? document.getElementById("invPropertyCard") : document.getElementById("propertyCard");
  if(isInvestor) { showInvestorScreen("inv-lookup"); document.getElementById("invLookupInput").value = addr; }
  else           { showScoutScreen("lookup"); document.getElementById("lookupInput").value = addr; }
  renderPropertyCard(addr, cardEl, isInvestor);
}

function renderPropertyCard(address, container, isInvestor) {
  // TODO: API_CALL — Replace with: fetch("https://api.attomdata.com/propertyapi/v1.0.0/property/detail?address="+encodeURIComponent(address), { headers: { "apikey": YOUR_API_KEY } })
  var p = generatePropertyData(address);
  var html =
    '<div class="prop-header">'+
      '<div class="prop-address">'+esc(address)+'</div>'+
      '<div class="prop-badges">'+
        '<span class="prop-badge type">'+esc(p.type)+'</span>'+
        '<span class="prop-badge year">Built '+p.yearBuilt+'</span>'+
        '<span class="prop-badge">'+esc(p.style)+'</span>'+
        '<span class="prop-badge">Zoning: '+p.zoning+'</span>'+
      '</div>'+
      '<div class="prop-price-row">'+
        '<div><div class="prop-est-label">Est. Value</div><div class="prop-est-val">'+fmtMoney(p.estimatedValue)+'</div></div>'+
        '<div class="prop-last-sale"><div class="prop-last-label">Last Sale</div><div class="prop-last-val">'+fmtMoney(p.lastSalePrice)+' · '+p.lastSaleDate+'</div></div>'+
      '</div>'+
    '</div>'+
    '<div class="prop-stats">'+
      '<div class="prop-stat"><div class="prop-stat-val">'+p.beds+'</div><div class="prop-stat-label">Beds</div></div>'+
      '<div class="prop-stat"><div class="prop-stat-val">'+p.baths+'</div><div class="prop-stat-label">Baths</div></div>'+
      '<div class="prop-stat"><div class="prop-stat-val">'+p.sqft.toLocaleString()+'</div><div class="prop-stat-label">Sq Ft</div></div>'+
      '<div class="prop-stat"><div class="prop-stat-val">'+Math.round(p.estimatedValue/p.sqft)+'</div><div class="prop-stat-label">$/SqFt</div></div>'+
    '</div>'+
    '<div class="prop-section">'+
      '<div class="prop-section-title">Owner & Tax Info</div>'+
      '<div class="prop-detail-grid">'+
        '<div class="prop-detail"><div class="prop-detail-label">Owner</div><div class="prop-detail-val">'+esc(p.owner)+'</div></div>'+
        '<div class="prop-detail"><div class="prop-detail-label">Owner Occupied</div><div class="prop-detail-val">'+p.ownerOccupied+'</div></div>'+
        '<div class="prop-detail"><div class="prop-detail-label">Annual Tax</div><div class="prop-detail-val">'+fmtMoney(p.annualTax)+'</div></div>'+
        '<div class="prop-detail"><div class="prop-detail-label">Lot Size</div><div class="prop-detail-val">'+p.lot+'</div></div>'+
        '<div class="prop-detail"><div class="prop-detail-label">Garage</div><div class="prop-detail-val">'+p.garage+'</div></div>'+
        '<div class="prop-detail"><div class="prop-detail-label">Pool</div><div class="prop-detail-val">'+p.pool+'</div></div>'+
        '<div class="prop-detail"><div class="prop-detail-label">Days on Market</div><div class="prop-detail-val">'+p.daysOnMarket+'</div></div>'+
        '<div class="prop-detail"><div class="prop-detail-label">Tax Year</div><div class="prop-detail-val">'+p.taxYear+'</div></div>'+
      '</div>'+
    '</div>'+
    '<div class="prop-section">'+
      '<div class="prop-section-title">Permit History ('+p.permits.length+')</div>'+
      p.permits.map(function(pm){
        return '<div class="prop-permit-row">'+
          '<span class="prop-permit-date">'+pm.date+'</span>'+
          '<span class="prop-permit-desc">'+esc(pm.description)+'</span>'+
          '<span class="prop-permit-type '+pm.type+'">'+pm.type+'</span>'+
        '</div>';
      }).join("")+
    '</div>'+
    '<div class="prop-section">'+
      '<div class="prop-section-title">Neighborhood Comps</div>'+
      p.comps.map(function(c){
        return '<div class="comp-row">'+
          '<span class="comp-addr">'+esc(c.address)+'</span>'+
          '<span class="comp-beds">'+c.beds+'bd/'+c.baths+'ba</span>'+
          '<span class="comp-price">'+fmtMoney(c.price)+'</span>'+
          '<span class="comp-date">'+c.date+'</span>'+
        '</div>';
      }).join("")+
    '</div>'+
    '<div class="prop-actions">'+
      '<a class="prop-btn zillow" href="https://www.zillow.com/homes/'+encodeURIComponent(address)+'_rb/" target="_blank" rel="noopener">🏠 Zillow</a>'+
      '<a class="prop-btn redfin" href="https://www.redfin.com/query/'+encodeURIComponent(address) +'" target="_blank" rel="noopener">🏡 Redfin</a>'+
      (!isInvestor ? '<button class="prop-btn scout" id="propScoutBtn">📍 Submit Lead</button>' : '')+
    '</div>';

  container.innerHTML = html;
  container.classList.remove("hidden");

  if(!isInvestor) {
    var scoutBtn = document.getElementById("propScoutBtn");
    if(scoutBtn) scoutBtn.addEventListener("click", function(){
      document.getElementById("leadAddress").value = address;
      showScoutScreen("submit");
    });
  }
  // Scroll card into view
  setTimeout(function(){ container.scrollIntoView({ behavior:"smooth", block:"nearest" }); }, 100);
}

/* ══ SUBMIT LEAD ══ */
var leadPropType = "single-family", leadCondition = "good", leadUrgency = "normal";
var leadPhoto = null;

function initPillGroups() {
  document.querySelectorAll(".pill-group").forEach(function(group){
    group.querySelectorAll(".pill").forEach(function(pill){
      pill.addEventListener("click", function(){
        group.querySelectorAll(".pill").forEach(function(p){ p.classList.remove("active"); });
        this.classList.add("active");
        if(group.id === "propTypePills")  leadPropType  = this.dataset.val;
        if(group.id === "conditionPills") leadCondition = this.dataset.val;
        if(group.id === "urgencyPills")   leadUrgency   = this.dataset.val;
      });
    });
  });
}
initPillGroups();

document.getElementById("photoInput").addEventListener("change", function(e){
  var file = e.target.files[0]; if(!file) return;
  var reader = new FileReader();
  reader.onload = function(ev){
    leadPhoto = ev.target.result;
    document.getElementById("photoImg").src = leadPhoto;
    document.getElementById("photoDrop").classList.add("hidden");
    document.getElementById("photoPreview").classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});
document.getElementById("photoRemove").addEventListener("click", function(){
  leadPhoto = null;
  document.getElementById("photoDrop").classList.remove("hidden");
  document.getElementById("photoPreview").classList.add("hidden");
  document.getElementById("photoInput").value = "";
});

document.getElementById("submitLeadBtn").addEventListener("click", function(){
  var addr  = document.getElementById("leadAddress").value.trim();
  var city  = document.getElementById("leadCity").value.trim();
  var ok = true;
  if(!addr){ document.getElementById("leadAddressErr").textContent = "Address is required."; document.getElementById("leadAddress").classList.add("error"); ok=false; }
  else { document.getElementById("leadAddressErr").textContent = ""; document.getElementById("leadAddress").classList.remove("error"); }
  if(!city){ document.getElementById("leadCityErr").textContent = "City is required."; document.getElementById("leadCity").classList.add("error"); ok=false; }
  else { document.getElementById("leadCityErr").textContent = ""; document.getElementById("leadCity").classList.remove("error"); }
  if(!ok) return;

  var state = document.getElementById("leadState").value.trim() || "AZ";
  var notes = document.getElementById("leadNotes").value.trim();
  var newLead = { id:uid(), address:addr, city:city, state:state, type:leadPropType, condition:leadCondition, urgency:leadUrgency, notes:notes, status:"pending", scoutId:"me", submittedAt:new Date().toISOString().split("T")[0], earning:0, photo:leadPhoto };
  leads.unshift(newLead);
  saveData("sd_leads", leads);

  // Reset form
  document.getElementById("leadAddress").value = "";
  document.getElementById("leadCity").value = "";
  document.getElementById("leadNotes").value = "";
  leadPhoto = null;
  document.getElementById("photoDrop").classList.remove("hidden");
  document.getElementById("photoPreview").classList.add("hidden");

  showSuccessToast("Lead submitted! The investor will review it soon.");
  showScoutScreen("my-leads");
  updateScoutStats();
});

/* ══ INVESTOR SCREENS ══ */
function renderInvestorScreen(name) {
  if(name === "investor-home")  renderInvestorHome();
  if(name === "review-leads")   renderReviewLeads();
  if(name === "pipeline")       renderPipeline();
  if(name === "scouts")         renderScouts();
}

function updateInvestorStats() {
  document.getElementById("invNew").textContent    = leads.filter(function(l){ return l.status === "pending"; }).length;
  document.getElementById("invActive").textContent = leads.filter(function(l){ return ["accepted","due-diligence"].includes(l.status); }).length;
  document.getElementById("invOffers").textContent = leads.filter(function(l){ return l.status === "offer"; }).length;
  document.getElementById("invClosed").textContent = leads.filter(function(l){ return l.status === "closed"; }).length;
}

function renderInvestorHome() {
  updateInvestorStats();
  var hot = leads.filter(function(l){ return l.urgency === "hot" && l.status === "pending"; }).slice(0,3);
  var el  = document.getElementById("hotLeadsList");
  if(hot.length === 0) { el.innerHTML = '<div style="color:var(--muted);font-style:italic;font-size:0.85rem;text-align:center;padding:1rem">No hot leads right now</div>'; }
  else { el.innerHTML = hot.map(function(l){ return leadCardHTML(l, true); }).join(""); el.querySelectorAll(".lead-card").forEach(function(c){ c.addEventListener("click", function(){ openLeadModal(this.dataset.id, true); }); }); }
  document.getElementById("seeAllLeads").addEventListener("click", function(){ showInvestorScreen("review-leads"); });
  document.getElementById("btnReviewLeads").addEventListener("click", function(){ showInvestorScreen("review-leads"); });
  document.getElementById("btnPipeline").addEventListener("click",    function(){ showInvestorScreen("pipeline"); });
  document.getElementById("btnSearchInv").addEventListener("click",   function(){ showInvestorScreen("inv-lookup"); });
  document.getElementById("btnScouts").addEventListener("click",      function(){ showInvestorScreen("scouts"); });
}

function renderReviewLeads() {
  var container = document.getElementById("reviewLeadsList");
  var filter = document.querySelector("#screen-review-leads .lf-btn.active");
  var activeFilter = filter ? filter.dataset.filter : "all";
  var filtered = leads;
  if(activeFilter === "pending") filtered = leads.filter(function(l){ return l.status === "pending"; });
  if(activeFilter === "hot")     filtered = leads.filter(function(l){ return l.urgency === "hot"; });

  document.querySelectorAll("#screen-review-leads .lf-btn").forEach(function(b){
    b.addEventListener("click", function(){
      document.querySelectorAll("#screen-review-leads .lf-btn").forEach(function(x){ x.classList.remove("active"); });
      this.classList.add("active");
      renderReviewLeads();
    });
  });

  if(filtered.length === 0) { container.innerHTML = '<div style="text-align:center;color:var(--muted);padding:3rem;font-style:italic">No leads</div>'; return; }
  container.innerHTML = filtered.map(function(l){ return leadCardHTML(l, true); }).join("");
  container.querySelectorAll(".lead-card").forEach(function(c){ c.addEventListener("click", function(){ openLeadModal(this.dataset.id, true); }); });
}

function renderPipeline() {
  var stages = [
    { key:"pending",       label:"Pending",       className:"pending"       },
    { key:"accepted",      label:"Accepted",      className:"accepted"      },
    { key:"due-diligence", label:"Due Diligence", className:"due-diligence" },
    { key:"offer",         label:"In Contract",   className:"offer"         },
    { key:"closed",        label:"Closed",        className:"closed"        },
  ];
  var el = document.getElementById("pipelineCols");
  el.innerHTML = stages.map(function(s){
    var stageLeads = leads.filter(function(l){ return l.status === s.key; });
    return '<div class="pipeline-col">'+
      '<div class="pipeline-col-header '+s.className+'">'+s.label+' ('+stageLeads.length+')</div>'+
      '<div class="pipeline-cards">'+
        (stageLeads.length === 0 ? '<div style="color:var(--muted);font-size:0.75rem;text-align:center;padding:0.75rem">Empty</div>' :
          stageLeads.map(function(l){
            return '<div class="pipeline-card" data-id="'+l.id+'">'+
              '<div class="pipeline-card-addr">'+esc(l.address)+'</div>'+
              '<div class="pipeline-card-meta">'+esc(l.city)+' · '+esc(l.type)+'</div>'+
              (l.earning>0?'<div style="color:var(--gold);font-family:var(--font-mono);font-size:0.65rem;margin-top:0.3rem">'+fmtMoney(l.earning)+' earned</div>':"")+
            '</div>';
          }).join("")
        )+
      '</div>'+
    '</div>';
  }).join("");
  el.querySelectorAll(".pipeline-card[data-id]").forEach(function(c){ c.addEventListener("click", function(){ openLeadModal(this.dataset.id, true); }); });
}

function renderScouts() {
  document.getElementById("scoutsList").innerHTML = scoutTeam.map(function(s){
    var bgColor = s.color + "22";
    return '<div class="scout-item">'+
      '<div class="scout-avatar" style="background:'+bgColor+';color:'+s.color+'">'+s.avatar+'</div>'+
      '<div class="scout-body">'+
        '<div class="scout-name">'+esc(s.name)+'</div>'+
        '<div class="scout-meta">'+s.leads+' leads · '+s.accepted+' accepted · '+s.closed+' closed</div>'+
      '</div>'+
      '<div class="scout-earned">'+fmtMoney(s.earned)+'</div>'+
    '</div>';
  }).join("");
}

/* ══ LEAD MODAL ══ */
function leadCardHTML(l, isInvestor) {
  var scout = scoutTeam.find(function(s){ return s.id === l.scoutId; });
  return '<div class="lead-card" data-id="'+l.id+'">'+
    '<div class="lead-card-header">'+
      '<div class="lead-address">'+esc(l.address)+'</div>'+
      '<span class="lead-status '+l.status+'">'+statusLabel(l.status)+'</span>'+
    '</div>'+
    '<div class="lead-meta">'+
      '<span class="lead-meta-pill">'+esc(l.city)+', '+esc(l.state)+'</span>'+
      '<span class="lead-meta-pill">'+capitalize(l.type.replace("-"," "))+'</span>'+
      '<span class="lead-meta-pill">'+capitalize(l.condition.replace("-"," "))+'</span>'+
      (l.urgency==="hot"?'<span class="lead-meta-pill hot">🔥 Hot</span>':"")+
      (isInvestor && scout?'<span class="lead-meta-pill">👤 '+esc(scout.name)+'</span>':"")+
    '</div>'+
    (l.earning > 0 ? '<div class="lead-earning">'+fmtMoney(l.earning)+' earned</div>' : "")+
  '</div>';
}

function openLeadModal(id, isInvestor) {
  var lead = leads.find(function(l){ return l.id === id; });
  if(!lead) return;
  var scout  = scoutTeam.find(function(s){ return s.id === lead.scoutId; });
  var modal  = document.getElementById("leadModal");
  var content= document.getElementById("leadModalContent");

  var stageOrder = ["pending","accepted","due-diligence","offer","closed"];
  var stageIdx   = stageOrder.indexOf(lead.status);
  var nextStage  = stageOrder[stageIdx + 1];
  var nextLabel  = { "accepted":"Mark Accepted","due-diligence":"Due Diligence","offer":"In Contract","closed":"Close Deal" }[nextStage];

  content.innerHTML =
    '<div class="modal-handle"></div>'+
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0.75rem;">'+
      '<div>'+
        '<div style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;">'+esc(lead.address)+'</div>'+
        '<div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);">'+esc(lead.city)+', '+esc(lead.state)+'</div>'+
      '</div>'+
      '<span class="lead-status '+lead.status+'">'+statusLabel(lead.status)+'</span>'+
    '</div>'+
    (lead.photo ? '<img src="'+lead.photo+'" style="width:100%;border-radius:10px;margin-bottom:0.75rem;max-height:160px;object-fit:cover;" alt="Property photo"/>' : "")+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.75rem;">'+
      detailPair("Type", capitalize(lead.type.replace("-"," ")))+
      detailPair("Condition", capitalize(lead.condition.replace("-"," ")))+
      detailPair("Submitted", lead.submittedAt)+
      detailPair("Scout", scout ? scout.name : "Unknown")+
      detailPair("Urgency", capitalize(lead.urgency))+
      detailPair("Earnings", fmtMoney(lead.earning))+
    '</div>'+
    (lead.notes ? '<div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:0.75rem;font-size:0.85rem;color:var(--muted);margin-bottom:0.75rem;border:1px solid var(--border);">📝 '+esc(lead.notes)+'</div>' : "")+
    '<div class="modal-actions" id="modalActions"></div>';

  modal.classList.remove("hidden");

  // Action buttons
  var actionsEl = document.getElementById("modalActions");
  if(isInvestor) {
    if(lead.status === "pending") {
      actionsEl.innerHTML =
        '<button class="modal-btn accept" id="ma-accept">✓ Accept</button>'+
        '<button class="modal-btn reject" id="ma-reject">✗ Reject</button>'+
        '<button class="modal-btn close-btn" id="ma-close">Close</button>';
      document.getElementById("ma-accept").addEventListener("click", function(){ updateLeadStatus(id,"accepted",50); modal.classList.add("hidden"); });
      document.getElementById("ma-reject").addEventListener("click", function(){ updateLeadStatus(id,"rejected",0); modal.classList.add("hidden"); });
    } else if(nextStage && lead.status !== "closed" && lead.status !== "rejected") {
      var earningMap = { "due-diligence":150, "offer":250, "closed":1000 };
      actionsEl.innerHTML =
        '<button class="modal-btn advance" id="ma-advance">→ '+nextLabel+'</button>'+
        '<button class="modal-btn close-btn" id="ma-close">Close</button>';
      document.getElementById("ma-advance").addEventListener("click", function(){ updateLeadStatus(id, nextStage, earningMap[nextStage]||0); modal.classList.add("hidden"); });
    } else {
      actionsEl.innerHTML = '<button class="modal-btn close-btn" id="ma-close">Close</button>';
    }
  } else {
    // Scout view — also show property lookup button
    actionsEl.innerHTML =
      '<button class="modal-btn accept" id="ma-lookup" style="background:var(--teal-dim);border-color:rgba(0,229,200,0.4);color:var(--teal);">🔍 Look Up</button>'+
      '<button class="modal-btn close-btn" id="ma-close">Close</button>';
    document.getElementById("ma-lookup").addEventListener("click", function(){ modal.classList.add("hidden"); showPropertyCardPopup(lead.address+", "+lead.city+" "+lead.state, false); });
  }
  document.getElementById("ma-close").addEventListener("click", function(){ modal.classList.add("hidden"); });
  modal.addEventListener("click", function(e){ if(e.target===this) this.classList.add("hidden"); });
}

function updateLeadStatus(id, newStatus, additionalEarning) {
  var lead = leads.find(function(l){ return l.id === id; });
  if(!lead) return;
  lead.status  = newStatus;
  lead.earning = (lead.earning||0) + additionalEarning;
  saveData("sd_leads", leads);

  // Update scout team stats
  var scout = scoutTeam.find(function(s){ return s.id === lead.scoutId; });
  if(scout) { scout.earned = (scout.earned||0) + additionalEarning; saveData("sd_scouts", scoutTeam); }

  updateInvestorStats();
  if(currentRole === "investor") {
    renderInvestorScreen(document.querySelector("#investorApp .screen.active")?.id?.replace("screen-","") || "investor-home");
  }
  showSuccessToast("Lead updated to: " + statusLabel(newStatus));
}

/* ══ HELPERS ══ */
function statusLabel(s) {
  return { pending:"Pending", accepted:"Accepted", rejected:"Rejected", "due-diligence":"Due Diligence", offer:"In Contract", closed:"Closed" }[s] || s;
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function esc(s) { return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function detailPair(label, val) {
  return '<div style="background:rgba(255,255,255,0.03);border-radius:6px;padding:0.4rem 0.6rem;">'+
    '<div style="font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);">'+label+'</div>'+
    '<div style="font-size:0.82rem;font-weight:500;margin-top:0.1rem;">'+esc(val)+'</div>'+
  '</div>';
}

var toastTimeout;
function showSuccessToast(msg) {
  var existing = document.getElementById("toast");
  if(existing) existing.remove();
  var toast = document.createElement("div");
  toast.id = "toast";
  toast.style.cssText = "position:fixed;bottom:calc(var(--nav-h) + 12px);left:50%;transform:translateX(-50%);background:#1a2f1a;border:1px solid rgba(46,204,113,0.4);color:var(--green);font-family:var(--font-mono);font-size:0.72rem;letter-spacing:0.06em;padding:0.6rem 1.1rem;border-radius:20px;z-index:999;white-space:nowrap;animation:slide-up .2s ease-out;box-shadow:0 4px 20px rgba(0,0,0,0.5);max-width:90vw;text-overflow:ellipsis;overflow:hidden;";
  toast.textContent = "✓ " + msg;
  document.body.appendChild(toast);
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function(){ if(toast.parentNode) toast.remove(); }, 3000);
}

/* Scout home buttons */
document.getElementById("btnSubmitLead").addEventListener("click",  function(){ showScoutScreen("submit"); });
document.getElementById("btnLookupProperty").addEventListener("click", function(){ showScoutScreen("lookup"); });
document.getElementById("btnNearby").addEventListener("click",   function(){ showScoutScreen("nearby"); });
document.getElementById("btnMyLeads").addEventListener("click",  function(){ showScoutScreen("my-leads"); });
