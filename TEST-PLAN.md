# TEST PLAN – Final Bank CLI App

## 1. Account Creation

### TP-001 – Create Valid Account

**Input:** Create account with name "Rohan" and balance 1000  
**Expected:** Account created successfully  
**Actual:** Account created successfully  
**Status:** PASS

### TP-002 – Create Account with Empty Name

**Input:** Create account with empty name "" and balance 1000  
**Expected:** Error message – Name cannot be empty  
**Actual:** Account created  
**Status:** FAIL

### TP-003 – Create Account with Negative Balance

**Input:** Create account with name "Priya" and balance -500  
**Expected:** Error message – Initial balance cannot be negative  
**Actual:** Account created with negative balance  
**Status:** FAIL

### TP-004 – Create Duplicate Account

**Input:** Create account with name "Rohan" again  
**Expected:** Error message – Account already exists  
**Actual:** Duplicate account created  
**Status:** FAIL

---

## 2. Deposit

### TP-005 – Deposit Valid Amount

**Input:** Deposit 500 into "Rohan" account  
**Expected:** Balance updated correctly  
**Actual:** Balance updated correctly  
**Status:** PASS

### TP-006 – Deposit 0

**Input:** Deposit 0 into "Rohan" account  
**Expected:** Error message – Deposit amount must be greater than 0  
**Actual:** Deposit accepted  
**Status:** FAIL

### TP-007 – Deposit Negative Amount

**Input:** Deposit -200 into "Rohan" account  
**Expected:** Error message – Cannot deposit negative amount  
**Actual:** Deposit processed  
**Status:** FAIL

### TP-008 – Deposit Very Large Amount

**Input:** Deposit 999999999 into "Rohan" account  
**Expected:** Balance updated correctly without overflow  
**Actual:** Balance updated correctly  
**Status:** PASS

### TP-009 – Deposit to Non-Existing Account

**Input:** Deposit 500 into "Unknown" account  
**Expected:** Error message – Account not found  
**Actual:** Application crashed  
**Status:** FAIL

---

## 3. Withdraw

### TP-010 – Withdraw Valid Amount

**Input:** Withdraw 200 from "Rohan" account  
**Expected:** Balance reduced correctly  
**Actual:** Balance reduced correctly  
**Status:** PASS

### TP-011 – Withdraw More Than Balance

**Input:** Withdraw 100000 from "Rohan" account  
**Expected:** Error message – Insufficient balance  
**Actual:** Withdrawal processed  
**Status:** FAIL

### TP-012 – Withdraw 0

**Input:** Withdraw 0 from "Rohan" account  
**Expected:** Error message – Withdrawal amount must be greater than 0  
**Actual:** Withdrawal processed  
**Status:** FAIL

### TP-013 – Withdraw Negative Amount

**Input:** Withdraw -300 from "Rohan" account  
**Expected:** Error message – Cannot withdraw negative amount  
**Actual:** Withdrawal processed  
**Status:** FAIL

### TP-014 – Withdraw from Non-Existing Account

**Input:** Withdraw 100 from "InvalidUser" account  
**Expected:** Error message – Account not found  
**Actual:** Application crashed  
**Status:** FAIL

---

## 4. Balance Check

### TP-015 – Check Valid Account Balance

**Input:** Check balance for "Rohan"  
**Expected:** Correct balance displayed  
**Actual:** Correct balance displayed  
**Status:** PASS

### TP-016 – Check Invalid Account Balance

**Input:** Check balance for "Ghost"  
**Expected:** Error message – Account not found  
**Actual:** Application crashed  
**Status:** FAIL

---

## Test Cases

| Test ID | Feature        | Environment   | Steps                                                                                | Expected Result                           | Actual Result                     | Status | Notes / Defect                     |
| ------- | -------------- | ------------- | ------------------------------------------------------------------------------------ | ----------------------------------------- | --------------------------------- | ------ | ---------------------------------- |
| TP-001  | Create Account | Node.js + CLI | 1. Start app 2. Select "Create Account" 3. Enter name "Rohan" 4. Enter balance 1000  | Account created successfully              | Account created successfully      | PASS   | Valid account works                |
| TP-002  | Create Account | Node.js + CLI | 1. Start app 2. Select "Create Account" 3. Enter empty name "" 4. Enter balance 1000 | Error: Name cannot be empty               | Account created                   | FAIL   | No validation for empty name       |
| TP-003  | Create Account | Node.js + CLI | 1. Start app 2. Select "Create Account" 3. Enter name "Priya" 4. Enter balance -500  | Error: Initial balance cannot be negative | Account created with -500 balance | FAIL   | Negative balance allowed           |
| TP-004  | Create Account | Node.js + CLI | 1. Create account "Rohan" 2. Attempt to create "Rohan" again                         | Error: Account already exists             | Duplicate account created         | FAIL   | Duplicate accounts allowed         |
| TP-005  | Deposit        | Node.js + CLI | 1. Create account "Rohan" with 1000 2. Select Deposit 3. Enter 500                   | Balance updated to 1500                   | Balance updated to 1500           | PASS   | Works correctly                    |
| TP-006  | Deposit        | Node.js + CLI | 1. Select Deposit 2. Enter account "Rohan" 3. Enter amount 0                         | Error: Deposit must be > 0                | Deposit accepted                  | FAIL   | Zero deposit allowed               |
| TP-007  | Deposit        | Node.js + CLI | 1. Select Deposit 2. Enter account "Rohan" 3. Enter -200                             | Error: Cannot deposit negative amount     | Deposit processed                 | FAIL   | Negative deposit allowed           |
| TP-008  | Deposit        | Node.js + CLI | 1. Select Deposit 2. Enter account "Rohan" 3. Enter 999999999                        | Balance updated correctly                 | Balance updated correctly         | PASS   | Large value handled                |
| TP-009  | Deposit        | Node.js + CLI | 1. Select Deposit 2. Enter account "Unknown" 3. Enter 500                            | Error: Account not found                  | Application crashed               | FAIL   | No account existence validation    |
| TP-010  | Withdraw       | Node.js + CLI | 1. Select Withdraw 2. Enter "Rohan" 3. Enter 200                                     | Balance reduced correctly                 | Balance reduced correctly         | PASS   | Works correctly                    |
| TP-011  | Withdraw       | Node.js + CLI | 1. Select Withdraw 2. Enter "Rohan" 3. Enter 100000                                  | Error: Insufficient balance               | Withdrawal processed              | FAIL   | No insufficient balance validation |
| TP-012  | Withdraw       | Node.js + CLI | 1. Select Withdraw 2. Enter "Rohan" 3. Enter 0                                       | Error: Withdrawal must be > 0             | Withdrawal processed              | FAIL   | Zero withdrawal allowed            |
| TP-013  | Withdraw       | Node.js + CLI | 1. Select Withdraw 2. Enter "Rohan" 3. Enter -300                                    | Error: Cannot withdraw negative amount    | Withdrawal processed              | FAIL   | Negative withdrawal allowed        |
| TP-014  | Withdraw       | Node.js + CLI | 1. Select Withdraw 2. Enter "InvalidUser" 3. Enter 100                               | Error: Account not found                  | Application crashed               | FAIL   | No account existence check         |
| TP-015  | Balance        | Node.js + CLI | 1. Select Check Balance 2. Enter "Rohan"                                             | Correct balance displayed                 | Correct balance displayed         | PASS   | Works correctly                    |
| TP-016  | Balance        | Node.js + CLI | 1. Select Check Balance 2. Enter "Ghost"                                             | Error: Account not found                  | Application crashed               | FAIL   | No validation for invalid account  |

---

## Summary

Total Test Cases: 16  
Passed: 5  
Failed: 11

### Major Defects Identified:

- Missing validation for empty account names
- Missing validation for negative or zero deposit/withdrawal
- No duplicate account protection
- No insufficient balance validation
- Application crashes when account does not exist
