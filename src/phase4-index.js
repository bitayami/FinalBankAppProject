const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const Table = require('cli-table3');
const Bank = require('./bank');

const dataPath = path.resolve(process.cwd(), 'bank-data.json');
let bank;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

// ─── Data Persistence ─────────────────────────────────────────────────────────

function loadData() {
    let initialData = { accounts: [] };

    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
    } else {
        try {
            const raw = fs.readFileSync(dataPath, 'utf8');
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.accounts)) {
                initialData = parsed;
            } else {
                console.log(chalk.yellow('Warning: Data file corrupted. Starting fresh.'));
            }
        } catch {
            console.log(chalk.yellow('Warning: Could not read data file. Starting fresh.'));
        }
    }

    bank = new Bank(initialData);
}

function saveData() {
    try {
        fs.writeFileSync(dataPath, JSON.stringify({ accounts: bank.accounts }, null, 2));
    } catch {
        console.log(chalk.red('Failed to save data.'));
    }
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function renderHeader() {
    console.log(chalk.cyan('======================================'));
    console.log(chalk.cyan('=        BANKCLI PRO  v2.0           ='));
    console.log(chalk.cyan('======================================'));
}

function renderMenu() {
    console.log('1. Create New Account');
    console.log('2. View Account Details');
    console.log('3. List All Accounts');
    console.log('4. Deposit Funds');
    console.log('5. Withdraw Funds');
    console.log('6. Transfer Between Accounts');
    console.log('7. View Transaction History');
    console.log('8. Delete Account');
    console.log('9. Exit Application');
}

function formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value || 0);
}

function parseAmount(input) {
    const amount = parseFloat(input);
    if (!Number.isFinite(amount)) {
        throw new Error("Invalid amount — please enter a numeric value.");
    }
    return amount;
}

async function pause() {
    await ask(chalk.gray('\nPress Enter to continue...'));
}

// ─── Menu Actions ─────────────────────────────────────────────────────────────

async function createAccount() {
    console.clear();
    renderHeader();
    console.log(chalk.bold('Create New Account'));

    const holderName = (await ask('Account holder name: ')).trim();
    const initialDepositInput = await ask('Initial deposit amount: ');

    try {
        const initialDeposit = parseAmount(initialDepositInput);
        const account = bank.createAccount(holderName, initialDeposit);
        saveData();
        console.log(chalk.green(`\nAccount created successfully!`));
        console.log(`  ID:      ${account.id}`);
        console.log(`  Holder:  ${account.holderName}`);
        console.log(`  Balance: ${formatMoney(account.balance)}`);
    } catch (err) {
        console.log(chalk.red(`\nError: ${err.message}`));
    }

    await pause();
}

async function viewAccountDetails() {
    console.clear();
    renderHeader();
    console.log(chalk.bold('View Account Details'));

    const id = (await ask('Account ID: ')).trim();

    try {
        const balance = bank.getBalance(id);
        const account = bank.findAccount(id);

        const lines = [
            `Account: ${account.id}`,
            `Holder:  ${account.holderName}`,
            `Balance: ${formatMoney(balance)}`,
            `Opened:  ${account.createdAt.split('T')[0]}`,
        ];

        const width = Math.max(...lines.map((l) => l.length)) + 4;
        const border = `+${'-'.repeat(width - 2)}+`;

        console.log('\n' + border);
        lines.forEach((line) => console.log(`| ${line.padEnd(width - 4)} |`));
        console.log(border);
    } catch (err) {
        console.log(chalk.red(`\nError: ${err.message}`));
    }

    await pause();
}

async function listAllAccounts() {
    console.clear();
    renderHeader();
    console.log(chalk.bold('All Accounts'));

    const accounts = bank.listAccounts();

    if (accounts.length === 0) {
        console.log(chalk.yellow('\nNo accounts found.'));
        await pause();
        return;
    }

    const table = new Table({
        head: ['ID', 'Holder Name', 'Balance', 'Status'],
    });

    accounts.forEach((account) => {
        table.push([
            account.id,
            account.holderName,
            formatMoney(account.balance),
            'ACTIVE',
        ]);
    });

    console.log(table.toString());

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    console.log(`Total accounts: ${accounts.length}`);
    console.log(`Total balance:  ${formatMoney(totalBalance)}`);

    await pause();
}

async function depositFunds() {
    console.clear();
    renderHeader();
    console.log(chalk.bold('Deposit Funds'));

    const id = (await ask('Account ID: ')).trim();
    const amountInput = await ask('Deposit amount: ');

    try {
        const amount = parseAmount(amountInput);
        const newBalance = bank.deposit(id, amount);
        saveData();
        console.log(chalk.green(`\nDeposit successful!`));
        console.log(`  Deposited: ${formatMoney(amount)}`);
        console.log(`  New Balance: ${formatMoney(newBalance)}`);
    } catch (err) {
        console.log(chalk.red(`\nError: ${err.message}`));
    }

    await pause();
}

async function withdrawFunds() {
    console.clear();
    renderHeader();
    console.log(chalk.bold('Withdraw Funds'));

    const id = (await ask('Account ID: ')).trim();
    const amountInput = await ask('Withdrawal amount: ');

    try {
        const amount = parseAmount(amountInput);
        const newBalance = bank.withdraw(id, amount);
        saveData();
        console.log(chalk.green(`\nWithdrawal successful!`));
        console.log(`  Withdrawn:   ${formatMoney(amount)}`);
        console.log(`  New Balance: ${formatMoney(newBalance)}`);
    } catch (err) {
        console.log(chalk.red(`\nError: ${err.message}`));
    }

    await pause();
}

async function transferFunds() {
    console.clear();
    renderHeader();
    console.log(chalk.bold('Transfer Between Accounts'));

    const fromId = (await ask('From Account ID: ')).trim();
    const toId = (await ask('To Account ID: ')).trim();
    const amountInput = await ask('Transfer amount: ');

    try {
        const amount = parseAmount(amountInput);
        const result = bank.transfer(fromId, toId, amount);
        saveData();
        console.log(chalk.green(`\nTransfer successful!`));
        console.log(`  Transferred:       ${formatMoney(amount)}`);
        console.log(`  From new balance:  ${formatMoney(result.fromBalance)}`);
        console.log(`  To new balance:    ${formatMoney(result.toBalance)}`);
    } catch (err) {
        console.log(chalk.red(`\nError: ${err.message}`));
    }

    await pause();
}

async function viewTransactionHistory() {
    console.clear();
    renderHeader();
    console.log(chalk.bold('Transaction History'));

    const id = (await ask('Account ID: ')).trim();

    try {
        const transactions = bank.getTransactionHistory(id);

        if (transactions.length === 0) {
            console.log(chalk.yellow('\nNo transactions found for this account.'));
            await pause();
            return;
        }

        const table = new Table({
            head: ['Date', 'Type', 'Amount', 'Balance After', 'Description'],
        });

        transactions.forEach((tx) => {
            table.push([
                tx.timestamp.split('T')[0],
                tx.type,
                formatMoney(tx.amount),
                formatMoney(tx.balanceAfter),
                tx.description || '-',
            ]);
        });

        console.log(table.toString());
    } catch (err) {
        console.log(chalk.red(`\nError: ${err.message}`));
    }

    await pause();
}

async function deleteAccount() {
    console.clear();
    renderHeader();
    console.log(chalk.bold('Delete Account'));

    const id = (await ask('Account ID: ')).trim();

    try {
        const balance = bank.getBalance(id);

        if (balance > 0) {
            console.log(chalk.yellow(
                `\nWarning: This account has a balance of ${formatMoney(balance)}.`
            ));
            const confirm = (await ask('Withdraw all funds first, then delete. Are you sure? (yes/no): ')).trim().toLowerCase();
            if (confirm !== 'yes') {
                console.log(chalk.gray('Deletion cancelled.'));
                await pause();
                return;
            }
        }

        bank.deleteAccount(id);
        saveData();
        console.log(chalk.green('\nAccount deleted successfully.'));
    } catch (err) {
        console.log(chalk.red(`\nError: ${err.message}`));
    }

    await pause();
}

async function exitApp() {
    console.log(chalk.cyan('\nSaving and exiting...'));
    saveData();
    rl.close();
    process.exit(0);
}

// ─── Main Loop ────────────────────────────────────────────────────────────────

async function main() {
    loadData();

    while (true) {
        console.clear();
        renderHeader();
        renderMenu();

        const choice = (await ask('\nSelect option (1-9): ')).trim();

        switch (choice) {
            case '1': await createAccount(); break;
            case '2': await viewAccountDetails(); break;
            case '3': await listAllAccounts(); break;
            case '4': await depositFunds(); break;
            case '5': await withdrawFunds(); break;
            case '6': await transferFunds(); break;
            case '7': await viewTransactionHistory(); break;
            case '8': await deleteAccount(); break;
            case '9': await exitApp(); break;
            default:
                console.log(chalk.red('Invalid option. Please select 1-9.'));
                await pause();
        }
    }
}

process.on('SIGINT', () => {
    console.log('\n' + chalk.yellow('Exiting...'));
    saveData();
    process.exit(0);
});

main();