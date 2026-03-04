// =========================
// Element References
// =========================
const descriptionInput = document.getElementById("description-input");
const amountInput = document.getElementById("amount-input");
const typeInput = document.getElementById("type-input");
const addBtn = document.getElementById("add-expense-btn");

const expenseList = document.getElementById("expense-list");
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const balanceEl = document.getElementById("balance");

// Allow Enter key to submit the form
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addBtn.click();
  }
});

// =========================
// Data Store (LocalStorage)
// =========================
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// =========================
// Add Transaction
// =========================
addBtn.addEventListener("click", () => {
  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;

  if (!description || isNaN(amount) || amount === 0) {
    alert("Please enter a valid description and amount.");
    return;
  }

  const transaction = {
    id: Date.now(),
    description,
    amount,
    type
  };

  transactions.push(transaction);
  saveTransactions();
  renderList();
  updateTotals();

  descriptionInput.value = "";
  amountInput.value = "";
  typeInput.value = "income";
  typeInput.focus();
});

// =========================
// Render Transaction List
// =========================
function renderList() {
  expenseList.innerHTML = "";

  const colors = {
    income: "#4caf50",
    borrowed: "#ffaa00",
    expense: "#ff4d4d"
  };

  transactions.forEach((item) => {
    const li = document.createElement("li");
    li.style.borderLeft = `5px solid ${colors[item.type]}`;

    li.innerHTML = `
      <span>
        <strong>[${item.type}]</strong>
        ${item.description} — $${item.amount}
      </span>
      <button class="delete-btn" onclick="deleteTransaction(${item.id})">X</button>
    `;

    expenseList.appendChild(li);
  });
}

// =========================
// Delete Transaction
// =========================
function deleteTransaction(id) {
  transactions = transactions.filter((item) => item.id !== id);
  saveTransactions();
  renderList();
  updateTotals();
}

// =========================
// Update Totals
// =========================
function updateTotals() {
  let income = 0;
  let expenses = 0;

  transactions.forEach((item) => {
    if (item.type === "income" || item.type === "borrowed") {
      income += item.amount;
    } else if (item.type === "expense") {
      expenses += item.amount;
    }
  });

  totalIncomeEl.textContent = `$${income.toFixed(2)}`;
  totalExpensesEl.textContent = `$${expenses.toFixed(2)}`;
  balanceEl.textContent = `$${(income - expenses).toFixed(2)}`;
}


// =========================
// Initial Load
// =========================
renderList();
updateTotals();
