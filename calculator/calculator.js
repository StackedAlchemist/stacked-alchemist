/* ============================================================
   ARITHMETICA — Arcane Calculator Engine
   Full PEMDAS/order-of-operations expression evaluator
   No eval() — custom recursive descent parser
============================================================ */

/* ── State ── */
let expression  = "";        // raw expression string
let lastResult  = null;      // last computed value
let history     = [];        // array of {expr, result}
let degMode     = true;      // true = degrees, false = radians
let justEvaled  = false;     // flag: last action was equals

/* ── DOM ── */
const elMain    = document.getElementById("display-main");
const elExpr    = document.getElementById("display-expr");
const elHist    = document.getElementById("display-history");
const elMode    = document.getElementById("display-mode");
const elHint    = document.getElementById("display-hint");
const elHList   = document.getElementById("history-list");
const elHEmpty  = document.getElementById("history-empty");
const elHArrow  = document.getElementById("history-arrow");

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  updateDisplay();
  bindButtons();
  bindTabs();
  bindHistory();
  bindKeyboard();
});

/* ============================================================
   DISPLAY
============================================================ */
function updateDisplay(result) {
  if (result !== undefined) {
    elMain.textContent = formatNumber(result);
    elMain.className   = "display-main result";
    elExpr.textContent = buildDisplayExpr(expression) || "\u00a0";
  } else if (expression === "") {
    elMain.textContent = "0";
    elMain.className   = "display-main";
    elExpr.textContent = "\u00a0";
  } else {
    elMain.textContent = buildDisplayExpr(expression);
    elMain.className   = "display-main";
    elExpr.textContent = "\u00a0";
  }
}

function showError(msg) {
  elMain.textContent = msg || "Error";
  elMain.className   = "display-main error";
  elExpr.textContent = buildDisplayExpr(expression) || "\u00a0";
}

function buildDisplayExpr(expr) {
  return expr
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/pi/g, "π")
    .replace(/sqrt\(/g, "√(")
    .replace(/cbrt\(/g, "∛(");
}

function formatNumber(n) {
  if (!isFinite(n)) return n > 0 ? "∞" : n < 0 ? "-∞" : "NaN";
  // Handle very large/small numbers with scientific notation
  if (Math.abs(n) !== 0 && (Math.abs(n) >= 1e15 || Math.abs(n) < 1e-9)) {
    return n.toExponential(8).replace(/\.?0+e/, "e");
  }
  // Remove floating point noise
  const s = parseFloat(n.toPrecision(14)).toString();
  return s;
}

/* ============================================================
   BUTTON BINDINGS
============================================================ */
function bindButtons() {
  document.querySelectorAll(".key, .const-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      addRipple(btn, e);
      const action = btn.dataset.action;
      const val    = btn.dataset.val;

      if (btn.classList.contains("const-btn")) { handleConst(btn); return; }

      switch (action) {
        case "num":         handleNum(val);     break;
        case "op":          handleOp(val);      break;
        case "insert":      handleInsert(val);  break;
        case "equals":      handleEquals();     break;
        case "clear":       handleClear();      break;
        case "backspace":   handleBack();       break;
        case "percent":     handlePercent();    break;
        case "toggle-deg":  toggleDeg(btn);     break;
      }
    });
  });
}

function addRipple(btn, e) {
  const r    = document.createElement("div");
  r.className = "ripple";
  const rect  = btn.getBoundingClientRect();
  r.style.left = (e.clientX - rect.left - 30) + "px";
  r.style.top  = (e.clientY - rect.top  - 30) + "px";
  btn.appendChild(r);
  r.addEventListener("animationend", () => r.remove());
}

/* ============================================================
   INPUT HANDLERS
============================================================ */
function handleNum(val) {
  if (justEvaled && (val !== "." && !isNaN(val))) {
    // Start fresh after equals if typing a new number
    expression = "";
    justEvaled = false;
  } else {
    justEvaled = false;
  }
  expression += val;
  updateDisplay();
}

function handleOp(val) {
  justEvaled = false;
  // Map display symbols to actual operators
  const opMap = { "÷": "/", "×": "*", "−": "-", "+": "+" };
  const op    = opMap[val] || val;

  // If expression ends with an operator, replace it
  if (expression.length > 0 && "+-*/".includes(expression.slice(-1))) {
    expression = expression.slice(0, -1);
  }
  // If we just got a result, continue from it
  if (lastResult !== null && expression === "") {
    expression = formatNumber(lastResult);
  }
  expression += op;
  updateDisplay();
}

function handleInsert(val) {
  justEvaled = false;
  // After equals, if inserting a function, use last result as implicit start
  if (justEvaled && lastResult !== null && val.endsWith("(")) {
    expression = formatNumber(lastResult);
  }
  expression += val;
  updateDisplay();
}

function handleConst(btn) {
  justEvaled = false;
  expression += btn.dataset.val;
  elHist.textContent = btn.dataset.label;
  updateDisplay();
}

function handleEquals() {
  if (expression === "") return;
  const expr = expression;
  try {
    const result = evaluate(expression);
    if (!isFinite(result) && isNaN(result)) throw new Error("NaN");

    // Save to history
    history.unshift({ expr: buildDisplayExpr(expr), result: formatNumber(result) });
    if (history.length > 20) history.pop();
    renderHistory();

    elHist.textContent = buildDisplayExpr(expr) + " =";
    lastResult = result;
    expression = "";
    justEvaled = true;
    updateDisplay(result);
  } catch (err) {
    showError("Invalid expression");
    justEvaled = false;
  }
}

function handleClear() {
  expression = "";
  lastResult = null;
  justEvaled = false;
  elHist.textContent = "\u00a0";
  updateDisplay();
}

function handleBack() {
  justEvaled = false;
  // Remove last character or last function token
  const funcMatch = expression.match(/(sin\(|cos\(|tan\(|asin\(|acos\(|atan\(|sinh\(|cosh\(|tanh\(|log\(|log2\(|ln\(|exp\(|sqrt\(|cbrt\(|abs\(|fact\(|nthroot\()$/);
  if (funcMatch) {
    expression = expression.slice(0, -funcMatch[0].length);
  } else {
    expression = expression.slice(0, -1);
  }
  updateDisplay();
}

function handlePercent() {
  justEvaled = false;
  if (expression === "") return;
  try {
    const val = evaluate(expression);
    expression = formatNumber(val / 100);
    updateDisplay();
  } catch {
    expression += "/100";
    updateDisplay();
  }
}

function toggleDeg(btn) {
  degMode = !degMode;
  btn.textContent = degMode ? "DEG" : "RAD";
  elMode.textContent = degMode ? "SCIENTIFIC — DEG" : "SCIENTIFIC — RAD";
}

/* ============================================================
   TABS
============================================================ */
function bindTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      document.querySelectorAll(".keypad").forEach(p => p.classList.add("hidden"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const id = "tab-" + tab.dataset.tab;
      document.getElementById(id).classList.remove("hidden");
      if (tab.dataset.tab === "scientific") elMode.textContent = degMode ? "SCIENTIFIC — DEG" : "SCIENTIFIC — RAD";
      else if (tab.dataset.tab === "constants") elMode.textContent = "CONSTANTS";
      else elMode.textContent = "STANDARD";
    });
  });
}

/* ============================================================
   HISTORY
============================================================ */
function bindHistory() {
  document.getElementById("history-toggle").addEventListener("click", () => {
    const list = document.getElementById("history-list");
    list.classList.toggle("hidden");
    elHArrow.classList.toggle("open");
  });
}

function renderHistory() {
  if (history.length === 0) { elHEmpty.style.display = "block"; return; }
  elHEmpty.style.display = "none";
  // Remove old items (keep the empty message)
  elHList.querySelectorAll(".history-item").forEach(el => el.remove());

  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `<span class="hist-expr">${item.expr}</span><span class="hist-result">${item.result}</span>`;
    div.addEventListener("click", () => {
      expression = item.result;
      justEvaled = false;
      elHist.textContent = item.expr + " =";
      updateDisplay();
    });
    elHList.appendChild(div);
  });
}

/* ============================================================
   KEYBOARD
============================================================ */
function bindKeyboard() {
  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k >= "0" && k <= "9")    { handleNum(k); return; }
    if (k === ".")                { handleNum("."); return; }
    if (k === "+" || k === "-")   { handleOp(k); return; }
    if (k === "*")                { handleOp("×"); return; }
    if (k === "/")                { e.preventDefault(); handleOp("÷"); return; }
    if (k === "Enter" || k === "=") { handleEquals(); return; }
    if (k === "Backspace")        { handleBack(); return; }
    if (k === "Escape")           { handleClear(); return; }
    if (k === "(")                { handleNum("("); return; }
    if (k === ")")                { handleNum(")"); return; }
    if (k === "^")                { handleInsert("^"); return; }
    if (k === "%")                { handlePercent(); return; }
  });
}

/* ============================================================
   EXPRESSION PARSER — Recursive Descent
   Handles full PEMDAS order:
   Parentheses → Exponents → Multiply/Divide → Add/Subtract
   Plus: functions (sin, cos, log...), constants (pi, e)
============================================================ */

function evaluate(expr) {
  // Normalise expression
  const tokens = tokenise(preprocess(expr));
  const parser = new Parser(tokens);
  const result = parser.parseExpr();
  if (!parser.done()) throw new Error("Unexpected token: " + parser.peek().val);
  return result;
}

/* Pre-processing: replace named constants, normalise operators */
function preprocess(expr) {
  return expr
    .replace(/\s+/g, "")
    .replace(/π/g, "pi")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\^2\b/g, "^2")   // keep as-is
    .replace(/\^3\b/g, "^3");
}

/* Tokeniser */
function tokenise(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    // Number (including scientific notation like 6.022e23)
    if (/[\d.]/.test(ch)) {
      let num = "";
      while (i < expr.length && /[\d.e+\-]/.test(expr[i])) {
        // Only allow + and - in exponent context
        if ((expr[i] === "+" || expr[i] === "-") && !/e/i.test(num.slice(-1))) break;
        num += expr[i++];
      }
      tokens.push({ type: "NUM", val: parseFloat(num) });
      continue;
    }
    // Identifier (function or constant)
    if (/[a-zA-Z_]/.test(ch)) {
      let id = "";
      while (i < expr.length && /[a-zA-Z_0-9]/.test(expr[i])) id += expr[i++];
      tokens.push({ type: "ID", val: id });
      continue;
    }
    // Operators / punctuation
    if ("+-*/^(),".includes(ch)) {
      tokens.push({ type: ch === "(" ? "LPAREN" : ch === ")" ? "RPAREN" : ch === "," ? "COMMA" : "OP", val: ch });
      i++; continue;
    }
    throw new Error("Unknown character: " + ch);
  }
  tokens.push({ type: "EOF", val: null });
  return tokens;
}

/* Parser class — recursive descent with precedence climbing */
class Parser {
  constructor(tokens) { this.tokens = tokens; this.pos = 0; }
  peek()       { return this.tokens[this.pos]; }
  consume()    { return this.tokens[this.pos++]; }
  done()       { return this.peek().type === "EOF"; }

  /* Expression: handles + and - (lowest precedence after commas) */
  parseExpr() {
    let left = this.parseTerm();
    while (this.peek().type === "OP" && (this.peek().val === "+" || this.peek().val === "-")) {
      const op = this.consume().val;
      const right = this.parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  /* Term: handles * and / */
  parseTerm() {
    let left = this.parseExp();
    while (this.peek().type === "OP" && (this.peek().val === "*" || this.peek().val === "/")) {
      const op = this.consume().val;
      const right = this.parseExp();
      if (op === "/" && right === 0) throw new Error("Division by zero");
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  /* Exponent: right-associative ^ */
  parseExp() {
    let base = this.parseUnary();
    if (this.peek().type === "OP" && this.peek().val === "^") {
      this.consume();
      const exp = this.parseExp(); // right-associative
      return Math.pow(base, exp);
    }
    return base;
  }

  /* Unary: handles leading - */
  parseUnary() {
    if (this.peek().type === "OP" && this.peek().val === "-") {
      this.consume();
      return -this.parseUnary();
    }
    if (this.peek().type === "OP" && this.peek().val === "+") {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  /* Primary: number, constant, function call, or parenthesised expression */
  parsePrimary() {
    const tok = this.peek();

    // Number
    if (tok.type === "NUM") { this.consume(); return tok.val; }

    // Parenthesised expression
    if (tok.type === "LPAREN") {
      this.consume();
      const val = this.parseExpr();
      if (this.peek().type !== "RPAREN") throw new Error("Missing closing )");
      this.consume();
      return val;
    }

    // Identifier: constant or function
    if (tok.type === "ID") {
      this.consume();
      const id = tok.val.toLowerCase();

      // Constants
      if (id === "pi")  return Math.PI;
      if (id === "e")   return Math.E;
      if (id === "phi") return 1.6180339887498948;
      if (id === "inf" || id === "infinity") return Infinity;

      // Functions — expect "(" next
      if (this.peek().type !== "LPAREN") throw new Error("Expected ( after " + id);
      this.consume(); // eat (

      // Parse arguments
      const args = [];
      if (this.peek().type !== "RPAREN") {
        args.push(this.parseExpr());
        while (this.peek().type === "COMMA") {
          this.consume();
          args.push(this.parseExpr());
        }
      }
      if (this.peek().type !== "RPAREN") throw new Error("Missing ) after function args");
      this.consume(); // eat )

      return applyFunction(id, args);
    }

    throw new Error("Unexpected token: " + JSON.stringify(tok));
  }
}

/* Apply a named function to its arguments */
function applyFunction(name, args) {
  const a = args[0];
  const toRad = v => degMode ? v * Math.PI / 180 : v;
  const toDeg = v => degMode ? v * 180 / Math.PI : v;

  switch (name) {
    // Trig
    case "sin":   return Math.sin(toRad(a));
    case "cos":   return Math.cos(toRad(a));
    case "tan":   return Math.tan(toRad(a));
    case "asin":  return toDeg(Math.asin(a));
    case "acos":  return toDeg(Math.acos(a));
    case "atan":  return toDeg(Math.atan(a));
    case "atan2": return toDeg(Math.atan2(a, args[1]));
    // Hyperbolic
    case "sinh":  return Math.sinh(a);
    case "cosh":  return Math.cosh(a);
    case "tanh":  return Math.tanh(a);
    // Logarithms
    case "log":   return Math.log10(a);
    case "log2":  return Math.log2(a);
    case "ln":    return Math.log(a);
    case "exp":   return Math.exp(a);
    // Roots
    case "sqrt":  if (a < 0) throw new Error("sqrt of negative"); return Math.sqrt(a);
    case "cbrt":  return Math.cbrt(a);
    case "nthroot": return Math.pow(args[1] ?? a, 1 / (args[1] ? a : 2));
    // Other
    case "abs":   return Math.abs(a);
    case "ceil":  return Math.ceil(a);
    case "floor": return Math.floor(a);
    case "round": return Math.round(a);
    case "sign":  return Math.sign(a);
    case "min":   return Math.min(...args);
    case "max":   return Math.max(...args);
    case "pow":   return Math.pow(a, args[1]);
    case "mod":   return a % args[1];
    case "gcd":   return gcd(Math.abs(Math.round(a)), Math.abs(Math.round(args[1])));
    case "fact":
    case "factorial": {
      const n = Math.round(a);
      if (n < 0)   throw new Error("Factorial of negative");
      if (n > 170) return Infinity;
      let f = 1; for (let i = 2; i <= n; i++) f *= i; return f;
    }
    case "log10": return Math.log10(a);
    case "logn":  return Math.log(a) / Math.log(args[1]);
    case "deg":   return a * 180 / Math.PI;
    case "rad":   return a * Math.PI / 180;
    default: throw new Error("Unknown function: " + name);
  }
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
