/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
let transactions = [];

// Variabel untuk menyimpan ID transaksi yang sedang diedit (null jika mode tambah)
let editingid = null;
// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()
function generateid() {
    return +new Date();
}

/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM
const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');

// elemen form 
const transactionForm = document.getElementById('transactionForm');
const titleInput = document.getElementById('transactionFormTitleInput');
const amountInput = document.getElementById('transactionFormAmountInput');
const typeSelect = document.getElementById('transactionFormTypeSelect');
// Tombol submit tidak punya id di HTML, ambil dari dalam form (fallback ke data-testid)
const submitButton = (transactionForm && transactionForm.querySelector('button[type="submit"]')) || document.querySelector('[data-testid="transactionFormSubmitButton"]');

// elemen dashboard (HTML memakai class, bukan id)
const balanceAmount = document.querySelector('.tracker-summary__balance-amount');
const incomeAmount = document.querySelector('.tracker-summary__stat-amount--income');
const expenseAmount = document.querySelector('.tracker-summary__stat-amount--expense');

// elemen pencarian
const searchInput = document.getElementById('searchTransactionFormTitleInput');
// mencegah form pencarian submit (agar tidak reload halaman saat tekan Enter)
const searchForm = document.getElementById('searchTransactionForm');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => e.preventDefault());
}


/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */

function renderTransactions(filteredList = null) {
    // Kosongkan kontainer terlebih dahulu
    incomeList.innerHTML = '';
    expenseList.innerHTML = '';

    // Tentukan list yang akan dirender (bisa dipanggil dengan hasil filter)
    const listToRender = filteredList !== null ? filteredList : transactions;

    // Perulangan untuk menampilkan setiap transaksi
    listToRender.forEach(tx => {
        const card = document.createElement('div');
        card.className = 'tracker-transaction-item';
        card.setAttribute('data-testid', 'transaction-card');

        const title = document.createElement('div');
        title.className = 'tracker-transaction-item__detail';
        title.innerHTML = `<div class="tracker-transaction-item__title">${tx.title}</div>`;
        title.setAttribute('data-testid', 'transaction-title');

        const amount = document.createElement('div');
        amount.className = 'tracker-transaction-item__right';
        amount.innerHTML = `<div class="tracker-transaction-item__amount ${tx.type === 'income' ? 'tracker-transaction-item__amount--income' : 'tracker-transaction-item__amount--expense'}">Rp ${formatRupiah(tx.amount)}</div>`;
        amount.setAttribute('data-testid', 'transaction-amount');

        const type = document.createElement('p');
        type.textContent = tx.type;
        type.setAttribute('data-testid', 'transaction-type');

        // Container untuk tombol aksi — gunakan class yang sesuai dengan style.css
        const actions = document.createElement('div');
        actions.className = 'tracker-transaction-item__actions';

        // Tombol untuk mengubah tipe (income <-> expense)
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'tracker-transaction-item__btn';
        toggleButton.textContent = tx.type === 'income' ? 'To Expense' : 'To Income';
        toggleButton.setAttribute('data-testid', 'transaction-toggle-button');
        toggleButton.setAttribute('aria-label', 'Ganti tipe transaksi');
        toggleButton.addEventListener('click', () => {
            tx.type = tx.type === 'income' ? 'expense' : 'income';
            saveTransactionsToStorage();
            // Beri sinyal bahwa data berubah
            document.dispatchEvent(new Event('transaction:updated'));
        });

        // Tombol edit
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--edit';
        editButton.textContent = 'Edit';
        editButton.setAttribute('data-testid', 'transaction-edit-button');
        editButton.setAttribute('aria-label', 'Edit transaksi');
        editButton.addEventListener('click', () => {
            // Masuk ke mode edit: isi form dengan data transaksi
            editingid = tx.id;
            titleInput.value = tx.title;
            amountInput.value = tx.amount;
            typeSelect.value = tx.type;
            submitButton.textContent = 'Update';
        });

        // Tombol hapus
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--delete';
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('data-testid', 'transaction-delete-button');
        deleteButton.setAttribute('aria-label', 'Hapus transaksi');
        deleteButton.addEventListener('click', () => {
            // Hapus dari array
            transactions = transactions.filter(t => t.id !== tx.id);
            saveTransactionsToStorage();
            document.dispatchEvent(new Event('transaction:updated'));
        });

        actions.appendChild(toggleButton);
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        card.appendChild(title);
        card.appendChild(amount);
        card.appendChild(type);
        card.appendChild(actions);

        // Masukkan kartu ke kontainer yang sesuai
        if (tx.type === 'income') {
            incomeList.appendChild(card);
        } else {
            expenseList.appendChild(card);
        }
    });
}

// Simpan ke localStorage
function saveTransactionsToStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Muat dari localStorage
function loadTransactionsFromStorage() {
    const raw = localStorage.getItem('transactions');
    transactions = raw ? JSON.parse(raw) : [];
    // Setelah load, beri sinyal agar UI ter-update
    document.dispatchEvent(new Event('transaction:updated'));
}

// Format angka jadi string dengan pemisah ribuan (ID locale)
function formatRupiah(number) {
    return Number(number).toLocaleString('id-ID');
}

// Update panel dashboard (income, expense, balance)
function updateDashboard() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    incomeAmount.textContent = `Rp ${formatRupiah(totalIncome)}`;
    expenseAmount.textContent = `Rp ${formatRupiah(totalExpense)}`;
    balanceAmount.textContent = `Rp ${formatRupiah(balance)}`;
}

// Handler submit form (tambah atau update)
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeSelect.value;

    // Validasi input (Skilled)
    if (!title) {
        alert('Judul tidak boleh kosong');
        return;
    }
    if (!amount || amount < 1) {
        alert('Nominal harus lebih besar atau sama dengan 1');
        return;
    }

    if (editingid) {
        // Update transaksi yang sedang diedit
        const idx = transactions.findIndex(t => t.id === editingid);
        if (idx !== -1) {
            transactions[idx].title = title;
            transactions[idx].amount = amount;
            transactions[idx].type = type;
        }
        editingid = null;
        submitButton.textContent = 'Add Transaction';
    } else {
        // Tambah transaksi baru
        const newTx = {
            id: generateid(),
            title,
            amount,
            type
        };
        transactions.push(newTx);
    }

    saveTransactionsToStorage();
    // Beri sinyal agar semua bagian ter-update
    document.dispatchEvent(new Event('transaction:updated'));
    transactionForm.reset();
});

// Listener untuk event custom: panggil render + update dashboard
document.addEventListener('transaction:updated', () => {
    renderTransactions();
    updateDashboard();
});

// Pencarian (filter) berdasarkan judul
searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
        renderTransactions();
        return;
    }
    const filtered = transactions.filter(t => t.title.toLowerCase().includes(q));
    renderTransactions(filtered);
});

// Muat data saat file JS pertama kali dijalankan
loadTransactionsFromStorage();
