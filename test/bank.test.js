const Bank = require('../src/bank');

describe("Final Bank App Test Cases", () => {

    let bank;
    beforeEach(() => { bank = new Bank({ accounts: [] }); });

    // ── Account Creation ───────────────────────────────────────────────────────
    describe("Account Creation", () => {
        test("TP-001 - Create Valid Account", () => {
            const acc = bank.createAccount("Rohan", 1000);
            expect(acc.holderName).toBe("Rohan");
            expect(acc.balance).toBe(1000);
            expect(acc.id).toMatch(/^ACC-\d{4}$/);
            expect(acc.transactions[0].type).toBe("DEPOSIT");
        });
        test("TP-002 - Empty name throws", () => {
            expect(() => bank.createAccount("", 1000)).toThrow(/name is required/i);
        });
        test("TP-002b - Whitespace-only name throws", () => {
            expect(() => bank.createAccount("   ", 500)).toThrow(/name is required/i);
        });
        test("TP-003 - Negative initial deposit throws", () => {
            expect(() => bank.createAccount("Priya", -500)).toThrow(/positive number/i);
        });
        test("TP-003b - NaN initial deposit throws", () => {
            expect(() => bank.createAccount("X", NaN)).toThrow(/positive number/i);
        });
        test("TP-004 - Unique Account IDs", () => {
            const a1 = bank.createAccount("A", 100);
            const a2 = bank.createAccount("A", 100);
            expect(a1.id).not.toBe(a2.id);
        });
        test("TP-004b - Zero initial deposit is valid", () => {
            const acc = bank.createAccount("Zero", 0);
            expect(acc.balance).toBe(0);
        });
        test("TP-004c - Initial transaction logged correctly", () => {
            const acc = bank.createAccount("Rohan", 500);
            expect(acc.transactions[0].amount).toBe(500);
            expect(acc.transactions[0].balanceAfter).toBe(500);
        });
    });

    // ── Deposit ────────────────────────────────────────────────────────────────
    describe("Deposit", () => {
        let id;
        beforeEach(() => { id = bank.createAccount("Rohan", 1000).id; });

        test("TP-005 - Deposit Valid Amount", () => {
            expect(bank.deposit(id, 500)).toBe(1500);
        });
        test("TP-006 - Deposit 0 throws", () => {
            expect(() => bank.deposit(id, 0)).toThrow(/greater than 0/i);
        });
        test("TP-007 - Deposit Negative throws", () => {
            expect(() => bank.deposit(id, -200)).toThrow(/greater than 0/i);
        });
        test("TP-008 - Deposit Very Large Amount", () => {
            expect(bank.deposit(id, 999999999)).toBe(1000 + 999999999);
        });
        test("TP-009 - Deposit to Non-Existing Account throws", () => {
            expect(() => bank.deposit("ACC-0000", 500)).toThrow(/account not found/i);
        });
        test("TP-009b - Deposit NaN throws", () => {
            expect(() => bank.deposit(id, NaN)).toThrow(/greater than 0/i);
        });
        test("TP-009c - Deposit logs transaction", () => {
            bank.deposit(id, 300);
            const acc = bank.findAccount(id);
            const last = acc.transactions.at(-1);
            expect(last.type).toBe("DEPOSIT");
            expect(last.amount).toBe(300);
            expect(last.balanceAfter).toBe(1300);
        });
    });

    // ── Withdrawal ─────────────────────────────────────────────────────────────
    describe("Withdrawal", () => {
        let id;
        beforeEach(() => { id = bank.createAccount("Rohan", 1000).id; });

        test("TP-010 - Withdraw Valid Amount", () => {
            expect(bank.withdraw(id, 200)).toBe(800);
        });
        test("TP-011 - Withdraw More Than Balance throws", () => {
            expect(() => bank.withdraw(id, 100000)).toThrow(/insufficient funds/i);
        });
        test("TP-012 - Withdraw 0 throws", () => {
            expect(() => bank.withdraw(id, 0)).toThrow(/greater than 0/i);
        });
        test("TP-013 - Withdraw Negative throws", () => {
            expect(() => bank.withdraw(id, -300)).toThrow(/greater than 0/i);
        });
        test("TP-014 - Withdraw from Non-Existing Account throws", () => {
            expect(() => bank.withdraw("ACC-0000", 100)).toThrow(/account not found/i);
        });
        test("TP-014b - Withdraw exact balance leaves 0", () => {
            expect(bank.withdraw(id, 1000)).toBe(0);
        });
        test("TP-014c - Withdrawal logs transaction", () => {
            bank.withdraw(id, 400);
            const last = bank.findAccount(id).transactions.at(-1);
            expect(last.type).toBe("WITHDRAWAL");
            expect(last.amount).toBe(400);
            expect(last.balanceAfter).toBe(600);
        });
    });

    // ── Balance Check ──────────────────────────────────────────────────────────
    describe("Balance Check", () => {
        let id;
        beforeEach(() => { id = bank.createAccount("Rohan", 1000).id; });

        test("TP-015 - Check Valid Account Balance", () => {
            expect(bank.getBalance(id)).toBe(1000);
        });
        test("TP-016 - Check Invalid Account Balance throws", () => {
            expect(() => bank.getBalance("ACC-GHOST")).toThrow(/account not found/i);
        });
        test("TP-016b - Balance reflects deposit", () => {
            bank.deposit(id, 500);
            expect(bank.getBalance(id)).toBe(1500);
        });
        test("TP-016c - Balance reflects withdrawal", () => {
            bank.withdraw(id, 200);
            expect(bank.getBalance(id)).toBe(800);
        });
    });

    // ── Transfer ───────────────────────────────────────────────────────────────
    describe("Transfer", () => {
        let fromId, toId;
        beforeEach(() => {
            fromId = bank.createAccount("Alice", 1000).id;
            toId   = bank.createAccount("Bob",   500).id;
        });

        test("TP-017 - Valid transfer debits source and credits target", () => {
            const result = bank.transfer(fromId, toId, 200);
            expect(result.fromBalance).toBe(800);
            expect(result.toBalance).toBe(700);
        });
        test("TP-017b - Transfer records TRANSFER_OUT on source", () => {
            bank.transfer(fromId, toId, 100);
            const last = bank.findAccount(fromId).transactions.at(-1);
            expect(last.type).toBe("TRANSFER_OUT");
            expect(last.amount).toBe(100);
        });
        test("TP-018 - Transfer > 500 still records TRANSFER_IN on target", () => {
            bank.transfer(fromId, toId, 600);
            const inTx = bank.findAccount(toId).transactions.find(t => t.type === 'TRANSFER_IN');
            expect(inTx).toBeDefined();
            expect(inTx.amount).toBe(600);
        });
        test("TP-019 - Transfer to non-existent account throws", () => {
            expect(() => bank.transfer(fromId, "ACC-FAKE", 100)).toThrow(/destination account not found/i);
        });
        test("TP-020 - Self-transfer throws", () => {
            expect(() => bank.transfer(fromId, fromId, 100)).toThrow(/same account/i);
        });
        test("TP-021 - Transfer overdraft throws", () => {
            expect(() => bank.transfer(fromId, toId, 5000)).toThrow(/insufficient funds/i);
        });
        test("TP-022 - Transfer NaN throws", () => {
            expect(() => bank.transfer(fromId, toId, NaN)).toThrow(/greater than 0/i);
        });
        test("TP-022b - Transfer zero throws", () => {
            expect(() => bank.transfer(fromId, toId, 0)).toThrow(/greater than 0/i);
        });
        test("TP-022c - Transfer negative throws", () => {
            expect(() => bank.transfer(fromId, toId, -50)).toThrow(/greater than 0/i);
        });
    });

    // ── Transaction History ────────────────────────────────────────────────────
    describe("Transaction History", () => {
        let id;
        beforeEach(() => { id = bank.createAccount("Alice", 200).id; });

        test("TP-023 - History contains deposit and withdrawal entries", () => {
            bank.deposit(id, 100);
            bank.withdraw(id, 50);
            const types = bank.getTransactionHistory(id).map(t => t.type);
            expect(types).toContain("DEPOSIT");
            expect(types).toContain("WITHDRAWAL");
        });
        test("TP-024 - New account has exactly 1 transaction (initial deposit)", () => {
            const history = bank.getTransactionHistory(id);
            expect(history).toHaveLength(1);
            expect(history[0].type).toBe("DEPOSIT");
        });
        test("TP-025 - History for non-existent account throws", () => {
            expect(() => bank.getTransactionHistory("ACC-GHOST")).toThrow(/account not found/i);
        });
        test("TP-023b - Transactions recorded in correct order", () => {
            bank.deposit(id, 50);
            bank.withdraw(id, 30);
            const history = bank.getTransactionHistory(id);
            expect(history[0].type).toBe("DEPOSIT");   // initial
            expect(history[1].type).toBe("DEPOSIT");
            expect(history[2].type).toBe("WITHDRAWAL");
        });
        test("TP-023c - Each transaction has required fields", () => {
            bank.deposit(id, 75);
            const tx = bank.getTransactionHistory(id).at(-1);
            expect(tx).toHaveProperty("type");
            expect(tx).toHaveProperty("amount");
            expect(tx).toHaveProperty("timestamp");
            expect(tx).toHaveProperty("balanceAfter");
        });
    });

    // ── Delete Account ─────────────────────────────────────────────────────────
    describe("Delete Account", () => {
        let zeroId, richId;
        beforeEach(() => {
            zeroId = bank.createAccount("Zero", 0).id;
            richId = bank.createAccount("Rich", 500).id;
        });

        test("TP-026 - Delete zero-balance account succeeds", () => {
            expect(bank.deleteAccount(zeroId)).toBe(true);
            expect(bank.findAccount(zeroId)).toBeUndefined();
        });
        test("TP-027 - Delete account with non-zero balance throws", () => {
            expect(() => bank.deleteAccount(richId)).toThrow(/non-zero balance/i);
        });
        test("TP-028 - Delete non-existent account throws", () => {
            expect(() => bank.deleteAccount("ACC-FAKE")).toThrow(/account not found/i);
        });
        test("TP-027b - Account with balance still exists after failed delete", () => {
            try { bank.deleteAccount(richId); } catch {}
            expect(bank.findAccount(richId)).toBeDefined();
        });
    });

    // ── Architecture & Data Integrity ──────────────────────────────────────────
    describe("Architecture & Data Integrity", () => {

        // TP-029 — Verify all required methods are present on Bank class
        test("TP-029 - Bank exposes createAccount, deposit, withdraw, getBalance", () => {
            expect(typeof bank.createAccount).toBe("function");
            expect(typeof bank.deposit).toBe("function");
            expect(typeof bank.withdraw).toBe("function");
            expect(typeof bank.getBalance).toBe("function");
        });

        test("TP-029b - Bank exposes transfer, deleteAccount, getTransactionHistory, listAccounts", () => {
            expect(typeof bank.transfer).toBe("function");
            expect(typeof bank.deleteAccount).toBe("function");
            expect(typeof bank.getTransactionHistory).toBe("function");
            expect(typeof bank.listAccounts).toBe("function");
        });

        test("TP-029c - bank.accounts getter returns current accounts array", () => {
            bank.createAccount("Test", 100);
            expect(Array.isArray(bank.accounts)).toBe(true);
            expect(bank.accounts).toHaveLength(1);
        });

        test("TP-029d - Separate Bank instances do not share state", () => {
            const bank2 = new Bank({ accounts: [] });
            bank.createAccount("User A", 100);
            expect(bank2.accounts).toHaveLength(0);
        });

        test("TP-029e - Constructor correctly loads pre-existing account data", () => {
            const pre = new Bank({
                accounts: [{
                    id: "ACC-1234", holderName: "Existing",
                    balance: 9999, createdAt: new Date().toISOString(), transactions: []
                }]
            });
            expect(pre.getBalance("ACC-1234")).toBe(9999);
        });

        test("TP-030 - listAccounts returns all created accounts", () => {
            bank.createAccount("A", 100);
            bank.createAccount("B", 200);
            expect(bank.listAccounts()).toHaveLength(2);
        });
    });

});

// =============================================================================
// PHASE 4 — FIXED BEHAVIOUR REGRESSION TESTS
// Verifies that all bugs from TEST-PLAN.md are correctly fixed in bank.js.
// =============================================================================

describe("Phase 4 — Fixed Behaviour Regression Tests", () => {

    let bank;
    let id;

    beforeEach(() => {
        bank = new Bank({ accounts: [] });
        id = bank.createAccount("Rohan", 1000).id;
    });

    // ── BUG-001 Fix: empty/whitespace name rejected ───────────────────────────
    test("FIX-001 - Empty name rejected (BUG-001 fixed)", () => {
        expect(() => bank.createAccount("", 500)).toThrow();
    });
    test("FIX-001b - Whitespace-only name rejected (BUG-001 fixed)", () => {
        expect(() => bank.createAccount("   ", 500)).toThrow();
    });

    // ── BUG-002 Fix: negative/invalid initial deposit rejected ────────────────
    test("FIX-002 - Negative initial deposit rejected (BUG-002 fixed)", () => {
        expect(() => bank.createAccount("Valid", -1)).toThrow();
    });
    test("FIX-002b - NaN initial deposit rejected (BUG-002 fixed)", () => {
        expect(() => bank.createAccount("Valid", NaN)).toThrow();
    });

    // ── BUG-003 Fix: zero deposit rejected ────────────────────────────────────
    test("FIX-003 - Zero deposit rejected, balance unchanged (BUG-003 fixed)", () => {
        expect(() => bank.deposit(id, 0)).toThrow();
        expect(bank.getBalance(id)).toBe(1000);
    });

    // ── BUG-004 Fix: negative deposit rejected ────────────────────────────────
    test("FIX-004 - Negative deposit rejected, balance does not decrease (BUG-004 fixed)", () => {
        expect(() => bank.deposit(id, -200)).toThrow();
        expect(bank.getBalance(id)).toBe(1000);
    });

    // ── BUG-005 Fix: overdraft on withdrawal rejected ─────────────────────────
    test("FIX-005 - Withdrawal exceeding balance rejected (BUG-005 fixed)", () => {
        expect(() => bank.withdraw(id, 9999)).toThrow(/insufficient funds/i);
        expect(bank.getBalance(id)).toBe(1000);
    });
    test("FIX-005b - Balance never goes below zero after failed withdraw", () => {
        try { bank.withdraw(id, 5000); } catch {}
        expect(bank.getBalance(id)).toBeGreaterThanOrEqual(0);
    });

    // ── BUG-006 Fix: zero withdrawal rejected ─────────────────────────────────
    test("FIX-006 - Zero withdrawal rejected (BUG-006 fixed)", () => {
        expect(() => bank.withdraw(id, 0)).toThrow();
    });

    // ── BUG-007 Fix: negative withdrawal rejected ─────────────────────────────
    test("FIX-007 - Negative withdrawal rejected, balance does not increase (BUG-007 fixed)", () => {
        expect(() => bank.withdraw(id, -300)).toThrow();
        expect(bank.getBalance(id)).toBe(1000);
    });

    // ── BUG-008 Fix: transfer credits ALL recipients regardless of ID ending ──
    test("FIX-008 - Transfer correctly credits account whose ID ends in 7 (BUG-008 fixed)", () => {
        const src = bank.createAccount("Sender", 1000);
        const tgt = bank.createAccount("Receiver", 0);
        // Simulate the BUG-008 condition: target ID ending in 7
        tgt.id = tgt.id.slice(0, -1) + '7';
        const result = bank.transfer(src.id, tgt.id, 300);
        expect(result.toBalance).toBe(300);
        expect(result.fromBalance).toBe(700);
    });

    // ── BUG-009 Fix: TRANSFER_IN always logged regardless of amount ───────────
    test("FIX-009 - TRANSFER_IN recorded for amounts greater than 500 (BUG-009 fixed)", () => {
        const src = bank.createAccount("Alice", 2000);
        const tgt = bank.createAccount("Bob", 0);
        bank.transfer(src.id, tgt.id, 750);
        const inTx = bank.getTransactionHistory(tgt.id).find(t => t.type === 'TRANSFER_IN');
        expect(inTx).toBeDefined();
        expect(inTx.amount).toBe(750);
    });

    // ── BUG-010 Fix: transfer to non-existent account throws, no ghost created ─
    test("FIX-010 - Transfer to non-existent account throws, no ghost account created (BUG-010 fixed)", () => {
        const countBefore = bank.listAccounts().length;
        expect(() => bank.transfer(id, "ACC-FAKE", 100)).toThrow(/not found/i);
        expect(bank.listAccounts().length).toBe(countBefore);
    });

    // ── BUG-011 Fix: self-transfer rejected ───────────────────────────────────
    test("FIX-011 - Self-transfer rejected, balance unchanged (BUG-011 fixed)", () => {
        expect(() => bank.transfer(id, id, 100)).toThrow(/same account/i);
        expect(bank.getBalance(id)).toBe(1000);
    });

    // ── BUG-012 Fix: transfer overdraft rejected ──────────────────────────────
    test("FIX-012 - Transfer overdraft rejected, both balances unchanged (BUG-012 fixed)", () => {
        const tgt = bank.createAccount("Bob", 0);
        expect(() => bank.transfer(id, tgt.id, 5000)).toThrow(/insufficient funds/i);
        expect(bank.getBalance(id)).toBe(1000);
        expect(bank.getBalance(tgt.id)).toBe(0);
    });

    // ── BUG-013 Fix: NaN/non-numeric input rejected everywhere ────────────────
    test("FIX-013a - NaN deposit rejected (BUG-013 fixed)", () => {
        expect(() => bank.deposit(id, NaN)).toThrow();
    });
    test("FIX-013b - NaN withdrawal rejected (BUG-013 fixed)", () => {
        expect(() => bank.withdraw(id, NaN)).toThrow();
    });
    test("FIX-013c - Infinity deposit rejected (BUG-013 fixed)", () => {
        expect(() => bank.deposit(id, Infinity)).toThrow();
    });
    test("FIX-013d - NaN does not corrupt balance (BUG-013 fixed)", () => {
        try { bank.deposit(id, NaN); } catch {}
        expect(Number.isFinite(bank.getBalance(id))).toBe(true);
    });

    // ── BUG-014 Fix: deleting account with balance is blocked ─────────────────
    test("FIX-014 - Deleting account with balance throws error (BUG-014 fixed)", () => {
        const rich = bank.createAccount("Rich", 500);
        expect(() => bank.deleteAccount(rich.id)).toThrow(/non-zero balance/i);
    });
    test("FIX-014b - Account with balance still exists after blocked delete (BUG-014 fixed)", () => {
        const rich = bank.createAccount("Rich", 500);
        try { bank.deleteAccount(rich.id); } catch {}
        expect(bank.findAccount(rich.id)).toBeDefined();
        expect(bank.getBalance(rich.id)).toBe(500);
    });
    test("FIX-014c - Account with zero balance can be deleted successfully (BUG-014 fixed)", () => {
        const empty = bank.createAccount("Empty", 0);
        expect(() => bank.deleteAccount(empty.id)).not.toThrow();
        expect(bank.findAccount(empty.id)).toBeUndefined();
    });

    // ── BUG-015 Fix: Bank class methods work end-to-end ───────────────────────
    test("FIX-015 - Full flow: create → deposit → withdraw → transfer → delete (BUG-015 fixed)", () => {
        const acc1 = bank.createAccount("Alice", 1000);
        const acc2 = bank.createAccount("Bob", 0);

        bank.deposit(acc1.id, 500);           // acc1 = 1500
        bank.withdraw(acc1.id, 200);           // acc1 = 1300
        bank.transfer(acc1.id, acc2.id, 300); // acc1 = 1000, acc2 = 300

        expect(bank.getBalance(acc1.id)).toBe(1000);
        expect(bank.getBalance(acc2.id)).toBe(300);

        bank.withdraw(acc2.id, 300);           // drain acc2
        bank.deleteAccount(acc2.id);
        expect(bank.findAccount(acc2.id)).toBeUndefined();
    });

    test("FIX-015b - Transaction history reflects full operation sequence (BUG-015 fixed)", () => {
        const acc = bank.createAccount("Test", 500);
        bank.deposit(acc.id, 200);
        bank.withdraw(acc.id, 100);
        const history = bank.getTransactionHistory(acc.id);
        const types = history.map(t => t.type);
        expect(types).toContain("DEPOSIT");
        expect(types).toContain("WITHDRAWAL");
        expect(history.length).toBeGreaterThanOrEqual(3);
    });

    test("FIX-015c - validateAmount helper rejects all invalid inputs", () => {
        const invalids = [0, -1, NaN, Infinity, -Infinity, null, undefined, "abc", ""];
        invalids.forEach(val => {
            expect(() => bank.deposit(id, val)).toThrow();
        });
    });
});