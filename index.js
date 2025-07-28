// index.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const { decodeBase } = require('./utils/decode');
const { lagrangeInterpolation } = require('./utils/interpolate');
const { getAllCombinations } = require('./utils/combinations');

const TESTCASE_DIR = path.join(__dirname, 'testcases');
const OUTPUT_FILE = path.join(__dirname, 'output', 'secrets.txt');

function parseTestCase(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const { n, k } = data.keys;
    const points = [];
    for (const key of Object.keys(data)) {
        if (key === 'keys') continue;
        const x = BigInt(key);
        const base = data[key].base;
        const value = data[key].value;
        const y = decodeBase(value, base);
        points.push({ x, y });
    }
    return { n, k, points };
}

function extractSecretFromCombinations(points, k) {
    const combos = getAllCombinations(points, k);
    const secrets = {};
    for (const combo of combos) {
        try {
            const c = lagrangeInterpolation(combo);
            const cStr = c.toString();
            secrets[cStr] = (secrets[cStr] || 0) + 1;
        } catch (e) {
            // skip invalid combos
        }
    }
    // Find the most common secret
    let max = 0, result = null;
    for (const [secret, count] of Object.entries(secrets)) {
        if (count > max) {
            max = count;
            result = secret;
        }
    }
    return result;
}

async function cliMenu() {
    const files = fs.readdirSync(TESTCASE_DIR).filter(f => f.endsWith('.json'));
    console.log(chalk.cyan('Available testcases:'));
    files.forEach((f, i) => console.log(`${i + 1}. ${f}`));
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise(res => rl.question(q, res));
    let idx = await ask('Choose testcase number (or "all" for both): ');
    rl.close();
    if (idx.trim().toLowerCase() === 'all') return files;
    idx = parseInt(idx, 10) - 1;
    if (idx < 0 || idx >= files.length) throw new Error('Invalid selection');
    return [files[idx]];
}

async function main() {
    if (!fs.existsSync(path.join(__dirname, 'output'))) fs.mkdirSync(path.join(__dirname, 'output'));
    let files;
    try {
        files = await cliMenu();
    } catch {
        console.log(chalk.red('Invalid input. Exiting.'));
        return;
    }
    let output = '';
    for (const file of files) {
        const { n, k, points } = parseTestCase(path.join(TESTCASE_DIR, file));
        const secret = extractSecretFromCombinations(points, k);
        output += `✅ ${file} Secret: ${secret}\n`;
        console.log(`✅ ${chalk.yellow(file)} Secret: ${chalk.green(secret)}`);
    }
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(chalk.blue(`Secrets written to ${OUTPUT_FILE}`));
}

main();
