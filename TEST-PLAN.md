# TEST PLAN – Final Bank CLI App

## Environment

- **Application:** Final Bank CLI App  
- **Runtime:** Node.js v18+  
- **OS:** Windows 10 / macOS / Linux  
- **Execution Method:** Terminal (Command Prompt / PowerShell / Bash)  
- **Command Used:** `npm start` (or `node src/index.js`)  
- **Unit Test Runner:** Jest v29 (`npm test`)

---

## Test Cases

| Test ID | Feature | Environment | Steps | Expected Result | Actual Result | Status | Notes / Defect |
|---------|---------|-------------|-------|-----------------|---------------|--------|----------------|
| TP-001 | Create Account | Node.js v18 + CLI | 1. Start app 2. Select "Create Account" 3. Enter name "Rohan" 4. Enter balance 1000 | Account created with unique ACC- ID and balance 1000 | Account created successfully | PASS | Valid flow works correctly |
| TP-002 | Create Account | Node.js v18 + CLI | 1. Start app 2. Select "Create Account" 3. Enter empty name "" 4. Enter balance 1000 | Error: "Name cannot be empty" | Account created with empty holderName — no validation in index.js createAccount() | FAIL | **BUG-001:** index.js does not validate empty name; bank.js class validates but is not used by index.js |
| TP-003 | Create Account | Node.js v18 + CLI | 1. Start app 2. Select "Create Account" 3. Enter name "Priya" 4. Enter balance -500 | Error: "Initial balance cannot be negative" | Account created with balance -500 — parseFloat(-500) stored directly | FAIL | **BUG-002:** index.js createAccount() does not validate negative initial deposit |
| TP-004 | Create Account | Node.js v18 + CLI | 1. Create account "A" with 100 2. Create another account "A" with 100 | Two accounts with different unique IDs | Two accounts created with same holderName and different IDs — by design; IDs are unique | PASS | IDs (ACC-xxxx) are always unique. Duplicate names are allowed. Test file tests this correctly. |
| TP-005 | Deposit | Node.js v18 + CLI | 1. Create account with balance 1000 2. Select Deposit 3. Enter valid account ID 4. Enter 500 | Balance updated to 1500 | Balance updated to 1500 | PASS | Works correctly via index.js |
| TP-006 | Deposit | Node.js v18 + CLI | 1. Select Deposit 2. Enter valid account ID 3. Enter amount 0 | Error: "Deposit must be > 0" | Deposit of 0 accepted; balance unchanged but transaction logged | FAIL | **BUG-003:** index.js depositFunds() has no amount validation |
| TP-007 | Deposit | Node.js v18 + CLI | 1. Select Deposit 2. Enter valid account ID 3. Enter -200 | Error: "Cannot deposit negative amount" | Balance reduced by 200 — negative deposit silently functions as a withdrawal | FAIL | **BUG-004:** index.js depositFunds() does not check for negative amount |
| TP-008 | Deposit | Node.js v18 + CLI | 1. Select Deposit 2. Enter valid account ID 3. Enter 999999999 | Balance updated correctly | Balance updated correctly | PASS | Large value handled by JavaScript float |
| TP-009 | Deposit | Node.js v18 + CLI | 1. Select Deposit 2. Enter account ID "Unknown" 3. Enter 500 | Error: "Account not found" | "Account not found" displayed correctly | PASS | index.js checks findAccountById before proceeding |
| TP-010 | Withdraw | Node.js v18 + CLI | 1. Create account with balance 1000 2. Select Withdraw 3. Enter 200 | Balance reduced to 800 | Balance reduced to 800 | PASS | Works correctly |
| TP-011 | Withdraw | Node.js v18 + CLI | 1. Create account with balance 1000 2. Select Withdraw 3. Enter 100000 | Error: "Insufficient funds" | Balance goes to -99000 — overdraft allowed | FAIL | **BUG-005:** index.js withdrawFunds() does not check amount > account.balance |
| TP-012 | Withdraw | Node.js v18 + CLI | 1. Select Withdraw 2. Enter valid account ID 3. Enter 0 | Error: "Withdrawal amount must be > 0" | Zero withdrawal accepted silently | FAIL | **BUG-006:** index.js withdrawFunds() has no amount validation |
| TP-013 | Withdraw | Node.js v18 + CLI | 1. Select Withdraw 2. Enter valid account ID 3. Enter -300 | Error: "Cannot withdraw negative amount" | Balance increases by 300 — negative withdrawal acts as deposit | FAIL | **BUG-007:** index.js withdrawFunds() does not check for negative amount |
| TP-014 | Withdraw | Node.js v18 + CLI | 1. Select Withdraw 2. Enter "InvalidUser" 3. Enter 100 | Error: "Account not found" | "Account not found" displayed correctly | PASS | index.js guards existence before withdraw |
| TP-015 | Balance Check | Node.js v18 + CLI | 1. Select View Account Details 2. Enter valid account ID | Correct balance displayed | Correct balance displayed | PASS | Works correctly |
| TP-016 | Balance Check | Node.js v18 + CLI | 1. Select View Account Details 2. Enter "Ghost" | Error: "Account not found" | "Account not found" displayed correctly | PASS | index.js guards missing account |
| TP-017 | Transfer | Node.js v18 + CLI | 1. Create accounts A (bal 1000) and B (bal 500) 2. Transfer 200 from A to B where B's ID ends in "7" | A = 800, B = 700 | A = 800, B balance UNCHANGED — funds vanish | FAIL | **BUG-008 (CRITICAL):** `if (!toId.trim().endsWith('7'))` in transferFunds() silently skips crediting any account whose ID ends in 7 |
| TP-018 | Transfer | Node.js v18 + CLI | 1. Create accounts A and B 2. Transfer 600 from A to B | B balance increases by 600 and transaction recorded | B balance increases correctly but NO transaction record added for amounts > 500 | FAIL | **BUG-009:** `if (amount <= 500)` — TRANSFER_IN transaction only logged when amount ≤ 500; larger transfers leave no audit trail on receiver |
| TP-019 | Transfer | Node.js v18 + CLI | 1. Select Transfer 2. Enter valid From ID 3. Enter non-existent To ID "ACC-9999" 4. Enter 100 | Error: "Target account not found" | A new ghost account with ID "ACC-9999" is silently created and funds deposited into it | FAIL | **BUG-010:** If target account does not exist, index.js creates it rather than rejecting the transfer |
| TP-020 | Transfer | Node.js v18 + CLI | 1. Select Transfer 2. Enter same ID for both From and To 3. Enter 200 | Error: "Cannot transfer to same account" | Balance decreases with no credit — net funds lost | FAIL | **BUG-011:** No self-transfer prevention |
| TP-021 | Transfer | Node.js v18 + CLI | 1. Create account A with balance 100 2. Transfer 500 from A | Error: "Insufficient funds" | Transfer proceeds, A balance goes to -400 | FAIL | **BUG-012:** No overdraft check before transfer |
| TP-022 | Transfer | Node.js v18 + CLI | 1. Select Transfer 2. Enter "abc" as amount | Error: "Invalid amount" | parseFloat("abc") = NaN; all balances become NaN permanently | FAIL | **BUG-013:** No NaN/non-numeric input validation on any amount field |
| TP-023 | Transaction History | Node.js v18 + CLI | 1. Create account, perform deposit + withdrawal 2. Select Transaction History 3. Enter ID | Chronological list of all transactions | Transactions displayed correctly in table | PASS | Works correctly |
| TP-024 | Transaction History | Node.js v18 + CLI | 1. Create fresh account 2. View transaction history | Initial deposit transaction shown | Only initial deposit entry shown — bank.js logs it on createAccount | PASS | Correct behaviour |
| TP-025 | Transaction History | Node.js v18 + CLI | 1. Select Transaction History 2. Enter fake account ID | Error: "Account not found" | "Account not found" displayed correctly | PASS | index.js guards this |
| TP-026 | Delete Account | Node.js v18 + CLI | 1. Create account 2. Select Delete 3. Enter account ID | Account removed, confirmation shown | Account deleted successfully | PASS | Works correctly |
| TP-027 | Delete Account | Node.js v18 + CLI | 1. Create account with balance 500 2. Select Delete 3. Enter ID | Warning: "Account has balance. Confirm?" | Account deleted immediately with no warning — balance silently lost | FAIL | **BUG-014:** No warning or guard when deleting account with non-zero balance |
| TP-028 | Delete Account | Node.js v18 + CLI | 1. Select Delete 2. Enter fake account ID | Error: "Account not found" | "Account not found" displayed correctly | PASS | index.js uses findIndex === -1 check |
| TP-029 | Architecture | Code Review | Review index.js and bank.js together | All operations should route through Bank class methods for consistent validation | index.js instantiates Bank but calls NO bank.* methods. main() creates a second unused bank instance. All business logic is duplicated in index.js with no validation. | FAIL | **BUG-015 (CRITICAL ARCHITECTURAL):** Bank class validation is completely bypassed. bank.js has proper guards; index.js has none. |
| TP-030 | Menu Input | Node.js v18 + CLI | 1. At main menu, enter "99" or "xyz" | Error: "Invalid option. Please select 1-9." | "Invalid option" message shown correctly | PASS | Switch default case handles gracefully |

---

## Summary

| Result | Count |
|--------|-------|
| PASS | 17 |
| FAIL | 13 |
| **Total** | **30** |

---

## Defect Register

| Defect ID | Severity | Description | Location | Linked Test |
|-----------|----------|-------------|----------|-------------|
| BUG-001 | Medium | Empty account name accepted with no validation | `index.js: createAccount()` | TP-002 |
| BUG-002 | High | Negative initial deposit accepted — balance starts negative | `index.js: createAccount()` | TP-003 |
| BUG-003 | Low | Zero deposit accepted silently | `index.js: depositFunds()` | TP-006 |
| BUG-004 | High | Negative deposit reduces balance — acts as silent withdrawal | `index.js: depositFunds()` | TP-007 |
| BUG-005 | High | Overdraft allowed — no balance check before withdrawal | `index.js: withdrawFunds()` | TP-011 |
| BUG-006 | Low | Zero withdrawal accepted silently | `index.js: withdrawFunds()` | TP-012 |
| BUG-007 | High | Negative withdrawal increases balance — acts as deposit | `index.js: withdrawFunds()` | TP-013 |
| BUG-008 | Critical | Funds vanish when transferring to any account ID ending in "7" | `index.js: transferFunds()` line ~311 | TP-017 |
| BUG-009 | High | TRANSFER_IN transaction not recorded when amount > 500 | `index.js: transferFunds()` line ~315 | TP-018 |
| BUG-010 | High | Ghost account silently created when transferring to non-existent ID | `index.js: transferFunds()` | TP-019 |
| BUG-011 | Medium | Self-transfer not blocked; source balance decreases with no credit | `index.js: transferFunds()` | TP-020 |
| BUG-012 | High | Transfer allows overdraft on source account | `index.js: transferFunds()` | TP-021 |
| BUG-013 | High | Non-numeric input causes NaN balance corruption throughout app | `index.js` — all amount inputs | TP-022 |
| BUG-014 | Medium | Account with non-zero balance deleted without warning | `index.js: deleteAccount()` | TP-027 |
| BUG-015 | Critical | Bank class entirely bypassed — all validation in bank.js never invoked at runtime | `index.js: main()` and all functions | TP-029 |

---

## Risk Assessment

| Risk | Severity | Likelihood | Root Cause |
|------|----------|------------|------------|
| Fund loss via IDs ending in "7" | Critical | High | Hardcoded `endsWith('7')` conditional — likely intentional sabotage or accidental debug code |
| Balance corruption via NaN | High | High | No parseFloat result validation anywhere in index.js |
| Overdraft on withdraw / transfer | High | High | Missing balance comparison guards in index.js |
| Ghost account creation | High | Medium | Missing toAccount existence check in transferFunds |
| Bank class validation entirely skipped | Critical | Certain | Architectural disconnect — index.js duplicates all logic without guards |
