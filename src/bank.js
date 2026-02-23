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

    // ─── Helpers ──────────────────────────────────────────────────────────────

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

    validateAmount(amount) {
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
            throw new Error("Amount must be a finite number greater than 0");
        }
    }

    // ─── Create Account ───────────────────────────────────────────────────────

    createAccount(holderName, initialDeposit) {
        if (!holderName || holderName.trim() === '') {
            throw new Error("Account holder name is required");
        }

        if (
            typeof initialDeposit !== 'number' ||
            !Number.isFinite(initialDeposit) ||
            initialDeposit < 0
        ) {
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
            balanceAfter: initialDeposit,
            description: 'Initial deposit'
        });

        this.data.accounts.push(account);
        return account;
    }

    // ─── Deposit ──────────────────────────────────────────────────────────────

    deposit(id, amount) {
        const account = this.findAccount(id);
        if (!account) throw new Error("Account not found");

        this.validateAmount(amount);

        account.balance += amount;

        account.transactions.push({
            type: 'DEPOSIT',
            amount,
            timestamp: new Date().toISOString(),
            balanceAfter: account.balance,
            description: 'Deposit'
        });

        return account.balance;
    }

    // ─── Withdraw ─────────────────────────────────────────────────────────────

    withdraw(id, amount) {
        const account = this.findAccount(id);
        if (!account) throw new Error("Account not found");

        this.validateAmount(amount);

        if (amount > account.balance) {
            throw new Error("Insufficient funds");
        }

        account.balance -= amount;

        account.transactions.push({
            type: 'WITHDRAWAL',
            amount,
            timestamp: new Date().toISOString(),
            balanceAfter: account.balance,
            description: 'Withdrawal'
        });

        return account.balance;
    }

    // ─── Transfer ─────────────────────────────────────────────────────────────

    transfer(fromId, toId, amount) {
        if (fromId === toId) {
            throw new Error("Cannot transfer to the same account");
        }

        const fromAccount = this.findAccount(fromId);
        if (!fromAccount) throw new Error("Source account not found");

        const toAccount = this.findAccount(toId);
        if (!toAccount) throw new Error("Destination account not found");

        this.validateAmount(amount);

        if (amount > fromAccount.balance) {
            throw new Error("Insufficient funds");
        }

        const timestamp = new Date().toISOString();

        fromAccount.balance -= amount;
        fromAccount.transactions.push({
            type: 'TRANSFER_OUT',
            amount,
            timestamp,
            balanceAfter: fromAccount.balance,
            description: `Transfer to ${toId}`
        });

        toAccount.balance += amount;
        toAccount.transactions.push({
            type: 'TRANSFER_IN',
            amount,
            timestamp,
            balanceAfter: toAccount.balance,
            description: `Transfer from ${fromId}`
        });

        return { fromBalance: fromAccount.balance, toBalance: toAccount.balance };
    }

    // ─── Get Balance ──────────────────────────────────────────────────────────

    getBalance(id) {
        const account = this.findAccount(id);
        if (!account) throw new Error("Account not found");
        return account.balance;
    }

    // ─── Get Transaction History ──────────────────────────────────────────────

    getTransactionHistory(id) {
        const account = this.findAccount(id);
        if (!account) throw new Error("Account not found");
        return account.transactions;
    }

    // ─── Delete Account ───────────────────────────────────────────────────────

    deleteAccount(id) {
        const index = this.data.accounts.findIndex(acc => acc.id === id);
        if (index === -1) throw new Error("Account not found");

        const account = this.data.accounts[index];
        if (account.balance > 0) {
            throw new Error(
                `Account has a non-zero balance of $${account.balance.toFixed(2)}. ` +
                `Withdraw all funds before deleting.`
            );
        }

        this.data.accounts.splice(index, 1);
        return true;
    }

    // ─── List All Accounts ────────────────────────────────────────────────────

    listAccounts() {
        return this.data.accounts;
    }
}

module.exports = Bank;