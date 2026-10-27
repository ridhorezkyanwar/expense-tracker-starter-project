/**
 * Expense Tracker — browser-only transaction management.
 * Transactions are stored locally in this browser; no server receives them.
 */

const STORAGE_KEY = "transactions";
let transactions = [];
let editingid = null;
let searchQuery = "";

const incomeList = document.getElementById("incomeList");
const expenseList = document.getElementById("expenseList");
const transactionForm = document.getElementById("transactionForm");
const titleInput = document.getElementById("transactionFormTitleInput");
const amountInput = document.getElementById("transactionFormAmountInput");
const dateInput = document.getElementById("transactionFormDateInput");
const typeSelect = document.getElementById("transactionFormTypeSelect");
const submitButton =
    transactionForm?.querySelector('button[type="submit"]') ||
    document.querySelector('[data-testid="transactionFormSubmitButton"]');
const balanceAmount = document.querySelector(".tracker-summary__balance-amount");
const incomeAmount = document.querySelector(".tracker-summary__stat-amount--income");
const expenseAmount = document.querySelector(".tracker-summary__stat-amount--expense");
const searchInput = document.getElementById("searchTransactionFormTitleInput");
const searchForm = document.getElementById("searchTransactionForm");
const periodLabel = document.querySelector(".tracker-header__date");
if (periodLabel) {
    periodLabel.textContent = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date());
}

function todayLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function generateid() {
    let id = Date.now();
    while (transactions.some((transaction) => transaction.id === id)) id += 1;
    return id;
}

function formatRupiah(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("id-ID") : "0";
}

function saveTransactionsToStorage() {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        return true;
    } catch (error) {
        console.warn("Transaksi tidak dapat disimpan di browser ini.", error);
        return false;
    }
}

function normalizeTransaction(value) {
    if (!value || typeof value !== "object") return null;

    const title = typeof value.title === "string" ? value.title.trim() : "";
    const amount = Number(value.amount);
    const type = value.type;
    const hasUsableId =
        (typeof value.id === "number" && Number.isFinite(value.id)) ||
        (typeof value.id === "string" && value.id.trim() !== "");

    if (!hasUsableId || !title || !Number.isFinite(amount) || amount < 1) return null;
    if (type !== "income" && type !== "expense") return null;

    const date =
        typeof value.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.date)
            ? value.date
            : "";

    return { id: value.id, title, amount, type, date };
}

function loadTransactionsFromStorage() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        transactions = Array.isArray(parsed)
            ? parsed.map(normalizeTransaction).filter((transaction) => transaction !== null)
            : [];
    } catch (error) {
        // Broken or blocked browser storage must not prevent the page from loading.
        transactions = [];
        console.warn("Data transaksi lokal tidak dapat dibaca; memulai dengan daftar kosong.", error);
    }

    document.dispatchEvent(new Event("transaction:updated"));
}

function renderTransactions() {
    if (!incomeList || !expenseList) return;

    incomeList.replaceChildren();
    expenseList.replaceChildren();

    const visibleTransactions = searchQuery
        ? transactions.filter((transaction) =>
              transaction.title.toLocaleLowerCase("id-ID").includes(searchQuery)
          )
        : transactions;

    visibleTransactions.forEach((transaction) => {
        const card = document.createElement("div");
        card.className = "tracker-transaction-item";
        card.setAttribute("data-testid", "transaction-card");

        const titleContainer = document.createElement("div");
        titleContainer.className = "tracker-transaction-item__detail";
        titleContainer.setAttribute("data-testid", "transaction-title");

        const title = document.createElement("div");
        title.className = "tracker-transaction-item__title";
        // Use textContent instead of HTML interpolation to prevent stored-XSS.
        title.textContent = transaction.title;
        titleContainer.appendChild(title);

        const amountContainer = document.createElement("div");
        amountContainer.className = "tracker-transaction-item__right";
        amountContainer.setAttribute("data-testid", "transaction-amount");

        const amount = document.createElement("div");
        amount.className =
            "tracker-transaction-item__amount " +
            (transaction.type === "income"
                ? "tracker-transaction-item__amount--income"
                : "tracker-transaction-item__amount--expense");
        amount.textContent = `Rp ${formatRupiah(transaction.amount)}`;
        amountContainer.appendChild(amount);

        const type = document.createElement("p");
        type.textContent = transaction.type;
        type.setAttribute("data-testid", "transaction-type");

        card.append(titleContainer, amountContainer, type);

        if (transaction.date) {
            const date = document.createElement("p");
            date.className = "tracker-transaction-item__date";
            date.textContent = transaction.date;
            date.setAttribute("data-testid", "transaction-date");
            card.appendChild(date);
        }

        const actions = document.createElement("div");
        actions.className = "tracker-transaction-item__actions";

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "tracker-transaction-item__btn";
        toggleButton.textContent = transaction.type === "income" ? "To Expense" : "To Income";
        toggleButton.setAttribute("data-testid", "transaction-toggle-button");
        toggleButton.setAttribute("aria-label", "Ganti tipe transaksi");
        toggleButton.addEventListener("click", () => {
            transaction.type = transaction.type === "income" ? "expense" : "income";
            saveTransactionsToStorage();
            document.dispatchEvent(new Event("transaction:updated"));
        });

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "tracker-transaction-item__btn tracker-transaction-item__btn--edit";
        editButton.textContent = "Edit";
        editButton.setAttribute("data-testid", "transaction-edit-button");
        editButton.setAttribute("aria-label", "Edit transaksi");
        editButton.addEventListener("click", () => {
            editingid = transaction.id;
            titleInput.value = transaction.title;
            amountInput.value = String(transaction.amount);
            dateInput.value = transaction.date || todayLocalDate();
            typeSelect.value = transaction.type;
            if (submitButton) submitButton.textContent = "Update";
            titleInput.focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "tracker-transaction-item__btn tracker-transaction-item__btn--delete";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("data-testid", "transaction-delete-button");
        deleteButton.setAttribute("aria-label", "Hapus transaksi");
        deleteButton.addEventListener("click", () => {
            transactions = transactions.filter((item) => item.id !== transaction.id);
            if (editingid === transaction.id) resetTransactionForm();
            saveTransactionsToStorage();
            document.dispatchEvent(new Event("transaction:updated"));
        });

        actions.append(toggleButton, editButton, deleteButton);
        card.appendChild(actions);

        (transaction.type === "income" ? incomeList : expenseList).appendChild(card);
    });
}

function updateDashboard() {
    if (!balanceAmount || !incomeAmount || !expenseAmount) return;

    const totalIncome = transactions
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const totalExpense = transactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    incomeAmount.textContent = `Rp ${formatRupiah(totalIncome)}`;
    expenseAmount.textContent = `Rp ${formatRupiah(totalExpense)}`;
    balanceAmount.textContent = `Rp ${formatRupiah(totalIncome - totalExpense)}`;
}

function resetTransactionForm() {
    editingid = null;
    transactionForm?.reset();
    if (dateInput) dateInput.value = todayLocalDate();
    if (submitButton) submitButton.textContent = "Simpan";
}

if (dateInput && !dateInput.value) dateInput.value = todayLocalDate();

transactionForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const date = dateInput?.value || "";
    const type = typeSelect.value;

    if (!title) {
        alert("Keterangan tidak boleh kosong.");
        titleInput.focus();
        return;
    }
    if (!Number.isFinite(amount) || amount < 1) {
        alert("Nominal harus berupa angka yang lebih besar dari atau sama dengan Rp 1.");
        amountInput.focus();
        return;
    }
    if (type !== "income" && type !== "expense") {
        alert("Pilih klasifikasi transaksi yang valid.");
        typeSelect.focus();
        return;
    }
    if (!date) {
        alert("Tanggal transaksi wajib diisi.");
        dateInput?.focus();
        return;
    }

    if (editingid !== null) {
        const index = transactions.findIndex((transaction) => transaction.id === editingid);
        if (index !== -1) {
            transactions[index] = { ...transactions[index], title, amount, type, date };
        }
    } else {
        transactions.push({ id: generateid(), title, amount, type, date });
    }

    saveTransactionsToStorage();
    resetTransactionForm();
    document.dispatchEvent(new Event("transaction:updated"));
});

document.addEventListener("transaction:updated", () => {
    renderTransactions();
    updateDashboard();
});

searchForm?.addEventListener("submit", (event) => event.preventDefault());
searchInput?.addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLocaleLowerCase("id-ID");
    renderTransactions();
});

loadTransactionsFromStorage();
