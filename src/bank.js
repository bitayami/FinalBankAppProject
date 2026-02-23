class Bank {
    constructor(initialData = {}) {
        this.data = {
            accounts: Array.isArray(initialData.accounts)
                ? [...initialData.accounts]
                : []
        };
    }

    get accounts() {
        return this.data.accounts;
    }

    generateAccountId() {
        let id;
        do {
            id = `ACC-${Math.floor(1000 + Math.random() * 9000)}`;
        } while (this.data.accounts.some(acc => acc.id === id));
        return id;
    }

    findAccount(id) {
        return this.data.accounts.find(acc => acc.id === id);
    }

    createAccount(holderName, initialDeposit) {
        if (!holderName || holderName.trim() === '') {
            throw new Error("Account holder name is required");
        }

        if (typeof initialDeposit !== 'number' || !Number.isFinite(initialDeposit) || initialDeposit < 0) {
            throw new Error("Initial deposit must be a positive number");
        }

        const id = this.generateAccountId();
        const now = new Date().toISOString();

        const account = {
            id,
            holderName: holderName.trim(),
            balance: initialDeposit,
            createdAt: now,
            transactions: []
        };

        account.transactions.push({
            type: 'DEPOSIT',
            amount: initialDeposit,
            timestamp: now,
            balanceAfter: initialDeposit
        });

        this.data.accounts.push(account);
        return account;
    }

    deposit(id, amount) {
        const account = this.findAccount(id);
        if (!account) throw new Error("Account not found");

        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0)
            throw new Error("Deposit amount must be greater than 0");

        account.balance += amount;

        account.transactions.push({
            type: 'DEPOSIT',
            amount,
            timestamp: new Date().toISOString(),
            balanceAfter: account.balance
        });

        return account.balance;
    }

    withdraw(id, amount) {
        const account = this.findAccount(id);
        if (!account) throw new Error("Account not found");

        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0)
            throw new Error("Withdrawal amount must be greater than 0");

        if (amount > account.balance)
            throw new Error("Insufficient funds");

        account.balance -= amount;

        account.transactions.push({
            type: 'WITHDRAWAL',
            amount,
            timestamp: new Date().toISOString(),
            balanceAfter: account.balance
        });

        return account.balance;
    }

    getBalance(id) {
        const account = this.findAccount(id);
        if (!account) throw new Error("Account not found");
        return account.balance;
    }
}

module.exports = Bank;