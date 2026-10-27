
document.addEventListener("DOMContentLoaded", () => {

    const STORAGE_KEY = "spendwiseTransactions";
    const TOTALS_KEY = "spendwiseTotals";
    const tableBody = document.querySelector(".transactions-panel tbody");
    const addButton = document.querySelector(".primary-button");
    const navLinks = document.querySelectorAll(".nav-link");
    const periodSelect = document.querySelector(
        'select[aria-label="Spending chart period"]'
    );

    const summaryCards = document.querySelectorAll(".summary-card");

    // Read the starting totals from your existing HTML.
    function readInitialTotals() {
        const totals = {};

        summaryCards.forEach((card) => {
            const label = card.innerText.toLowerCase();
            const valueElement = card.querySelector("h2");
            if (!valueElement) return;

            const value = Number(
                valueElement.innerText.replace(/[₹,\s]/g, "")
            ) || 0;

            if (label.includes("balance")) totals.balance = value;
            else if (label.includes("income")) totals.income = value;
            else if (label.includes("expense")) totals.expenses = value;
            else if (label.includes("saving")) totals.savings = value;
        });

        return totals;
    }

    const defaultTotals = {
        balance: 84250,
        income: 45000,
        expenses: 28750,
        savings: 16250
    };

    let totals;

    try {
        totals = JSON.parse(localStorage.getItem(TOTALS_KEY))
            || readInitialTotals();

        totals = { ...defaultTotals, ...totals };
    } catch {
        totals = { ...defaultTotals };
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(amount);
    }

    function saveTotals() {
        localStorage.setItem(TOTALS_KEY, JSON.stringify(totals));
    }

    function updateSummaryCards() {
        summaryCards.forEach((card) => {
            const label = card.innerText.toLowerCase();
            const heading = card.querySelector("h2");
            if (!heading) return;

            if (label.includes("balance")) {
                heading.textContent = formatCurrency(totals.balance);
            } else if (label.includes("income")) {
                heading.textContent = formatCurrency(totals.income);
            } else if (label.includes("expense")) {
                heading.textContent = formatCurrency(totals.expenses);
            } else if (label.includes("saving")) {
                heading.textContent = formatCurrency(totals.savings);
            }
        });

        saveTotals();
    }

    function getExistingRows() {
        if (!tableBody) return [];

        return Array.from(tableBody.querySelectorAll("tr"))
            .filter((row) => row.cells.length > 0)
            .map((row) => ({
                html: row.innerHTML,
                searchText: row.innerText.toLowerCase()
            }));
    }

    let transactions;

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        transactions = saved ? JSON.parse(saved) : null;
    } catch {
        transactions = null;
    }

    if (!Array.isArray(transactions)) {
        transactions = getExistingRows();
        saveTransactions();
    }

    function saveTransactions() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }

    function renderTransactions() {
        if (!tableBody) return;

        tableBody.innerHTML = "";

        transactions.forEach((transaction) => {
            const row = document.createElement("tr");
            row.innerHTML = transaction.html;
            row.dataset.search = transaction.searchText || "";
            tableBody.appendChild(row);
        });

        applyFilters();
    }

    let currentFilter = "all";
    let currentSearch = "";

    if (tableBody) {
        const panel = document.querySelector(".transactions-panel");
        const header = panel?.querySelector(".panel-header");

        if (panel && header) {
            const toolbar = document.createElement("div");
            toolbar.className = "transaction-toolbar";

            toolbar.innerHTML = `
                <input
                    type="search"
                    id="transactionSearch"
                    placeholder="Search transactions..."
                    aria-label="Search transactions"
                >

                <select id="transactionFilter" aria-label="Filter transactions">
                    <option value="all">All transactions</option>
                    <option value="income">Income</option>
                    <option value="expense">Expenses</option>
                </select>
            `;

            header.insertAdjacentElement("afterend", toolbar);

            const searchInput = toolbar.querySelector("#transactionSearch");
            const filterSelect = toolbar.querySelector("#transactionFilter");

            searchInput.addEventListener("input", (event) => {
                currentSearch = event.target.value.toLowerCase().trim();
                applyFilters();
            });

            filterSelect.addEventListener("change", (event) => {
                currentFilter = event.target.value;
                applyFilters();
            });
        }
    }

    function applyFilters() {
        if (!tableBody) return;

        tableBody.querySelectorAll("tr").forEach((row) => {
            const text = (
                row.dataset.search || row.innerText
            ).toLowerCase();

            const matchesSearch = text.includes(currentSearch);

            // Works with the existing amount classes where available.
            const isIncome = Boolean(
                row.querySelector(".income-amount")
            ) || /\+\s*₹/.test(text);

            const isExpense = Boolean(
                row.querySelector(".expense-amount")
            ) || /-\s*₹/.test(text);

            const matchesType =
                currentFilter === "all" ||
                (currentFilter === "income" && isIncome) ||
                (currentFilter === "expense" && isExpense);

            row.hidden = !(matchesSearch && matchesType);
        });
    }
    function addTransaction() {
        if (!tableBody) {
            alert("Transaction table was not found in your HTML.");
            return;
        }

        const description = prompt("Enter transaction name:");
        if (!description || !description.trim()) return;

        const amountInput = prompt("Enter amount in ₹:");
        if (amountInput === null) return;

        const amount = Number(amountInput.replace(/,/g, ""));

        if (!Number.isFinite(amount) || amount <= 0) {
            alert("Please enter a valid amount greater than zero.");
            return;
        }

        const typeInput = prompt(
            "Enter type: income or expense",
            "expense"
        );

        if (typeInput === null) return;

        const type = typeInput.trim().toLowerCase();

        if (!["income", "expense"].includes(type)) {
            alert("Type must be income or expense.");
            return;
        }

        const category = prompt("Enter category:", "Other") || "Other";
        const date = new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        const sign = type === "income" ? "+" : "-";
        const amountClass = type === "income"
            ? "income-amount"
            : "expense-amount";

        const icon = type === "income" ? "↙" : "↗";

        // Build cells safely without injecting user-provided HTML.
        const row = document.createElement("tr");

        const values = [
            `${icon} ${description.trim()}`,
            category,
            date,
            `${sign} ${formatCurrency(amount)}`
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");
            cell.textContent = value;

            if (index === 3) {
                cell.classList.add(amountClass);
            }

            row.appendChild(cell);
        });

        const transaction = {
            html: row.innerHTML,
            searchText: `${description} ${category} ${date} ${type} ${amount}`
                .toLowerCase()
        };

        transactions.unshift(transaction);
        saveTransactions();

        // Update totals using the newly added transaction.
        if (type === "income") {
            totals.income += amount;
            totals.balance += amount;
        } else {
            totals.expenses += amount;
            totals.balance -= amount;
        }

        totals.savings = totals.income - totals.expenses;

        updateSummaryCards();
        renderTransactions();

        alert("Transaction added successfully!");
    }

    addButton?.addEventListener("click", addTransaction);

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.forEach((item) => item.classList.remove("active"));
            link.classList.add("active");
        });
    });

    if (periodSelect) {
        periodSelect.addEventListener("change", () => {
            const bars = document.querySelectorAll(".bar");

            bars.forEach((bar, index) => {
                bar.style.transition = "height 0.4s ease";
                bar.style.animation = "none";

                // Visual feedback when the selected period changes.
                bar.style.opacity = "0.55";

                requestAnimationFrame(() => {
                    bar.style.opacity = "1";
                });
            });
        });
    }

    renderTransactions();
    updateSummaryCards();

    console.log("SpendWise is ready!");
});
