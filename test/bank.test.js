const Bank = require('../src/bank');

describe("Final Bank App Test Cases", () => {

    let bank;

    beforeEach(() => {
        bank = new Bank({ accounts: [] });
    });

    // ----------------------------
    // Account Creation
    // ----------------------------

    describe("Account Creation", () => {

        test("TP-001 - Create Valid Account", () => {
            const acc = bank.createAccount("Rohan", 1000);
            expect(acc.holderName).toBe("Rohan");
            expect(acc.balance).toBe(1000);
            expect(acc.id).toMatch(/^ACC-/);
        });

        test("TP-002 - Create Account with Empty Name", () => {
            expect(() => bank.createAccount("", 1000)).toThrow();
        });

        test("TP-003 - Create Account with Negative Balance", () => {
            expect(() => bank.createAccount("Priya", -500)).toThrow();
        });

        test("TP-004 - Unique Account IDs", () => {
            const acc1 = bank.createAccount("A", 100);
            const acc2 = bank.createAccount("A", 100);
            expect(acc1.id).not.toBe(acc2.id);
        });
    });

    // ----------------------------
    // Deposit
    // ----------------------------

    describe("Deposit", () => {

        test("TP-005 - Deposit Valid Amount", () => {
            const acc = bank.createAccount("Rohan", 1000);
            const newBalance = bank.deposit(acc.id, 500);
            expect(newBalance).toBe(1500);
        });

        test("TP-006 - Deposit 0", () => {
            const acc = bank.createAccount("Rohan", 1000);
            expect(() => bank.deposit(acc.id, 0)).toThrow();
        });

        test("TP-007 - Deposit Negative Amount", () => {
            const acc = bank.createAccount("Rohan", 1000);
            expect(() => bank.deposit(acc.id, -200)).toThrow();
        });

        test("TP-008 - Deposit Very Large Amount", () => {
            const acc = bank.createAccount("Rohan", 1000);
            const newBalance = bank.deposit(acc.id, 999999999);
            expect(newBalance).toBe(1000 + 999999999);
        });

        test("TP-009 - Deposit to Non-Existing Account", () => {
            expect(() => bank.deposit("Unknown", 500)).toThrow();
        });
    });

    // ----------------------------
    // Withdrawal
    // ----------------------------

    describe("Withdrawal", () => {

        test("TP-010 - Withdraw Valid Amount", () => {
            const acc = bank.createAccount("Rohan", 1000);
            const newBalance = bank.withdraw(acc.id, 200);
            expect(newBalance).toBe(800);
        });

        test("TP-011 - Withdraw More Than Balance", () => {
            const acc = bank.createAccount("Rohan", 1000);
            expect(() => bank.withdraw(acc.id, 100000)).toThrow();
        });

        test("TP-012 - Withdraw 0", () => {
            const acc = bank.createAccount("Rohan", 1000);
            expect(() => bank.withdraw(acc.id, 0)).toThrow();
        });

        test("TP-013 - Withdraw Negative Amount", () => {
            const acc = bank.createAccount("Rohan", 1000);
            expect(() => bank.withdraw(acc.id, -300)).toThrow();
        });

        test("TP-014 - Withdraw from Non-Existing Account", () => {
            expect(() => bank.withdraw("InvalidUser", 100)).toThrow();
        });
    });

    // ----------------------------
    // Balance Check
    // ----------------------------

    describe("Balance Check", () => {

        test("TP-015 - Check Valid Account Balance", () => {
            const acc = bank.createAccount("Rohan", 1000);
            expect(bank.getBalance(acc.id)).toBe(1000);
        });

        test("TP-016 - Check Invalid Account Balance", () => {
            expect(() => bank.getBalance("Ghost")).toThrow();
        });
    });

});