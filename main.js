const fs = require('fs');
const path = require('path');

// Lagrange interpolation at x = 0 (constant term)
function lagrangeInterpolation(points) {
  let secret = 0n;
  for (let i = 0; i < points.length; i++) {
    let xi = BigInt(points[i].x);
    let yi = BigInt(points[i].y);
    let num = 1n, den = 1n;
    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        let xj = BigInt(points[j].x);
        num *= -xj;
        den *= (xi - xj);
      }
    }
    let li = num / den;
    secret += yi * li;
  }
  return secret;
}

// Decode value from any base (string or number base)
function decodeBase(value, base) {
  if (typeof value !== 'string') value = String(value);
  if (typeof base !== 'string') base = String(base);
  return BigInt(parseInt(value, parseInt(base, 10)));
}

// Parse input JSON and decode all points
function parseInput(filename) {
  const json = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  const k = json.keys.k;
  const points = [];
  for (let key in json) {
    if (key === 'keys') continue;
    const x = parseInt(key);
    const base = json[key].base;
    const value = json[key].value;
    const y = decodeBase(value, base);
    points.push({ x, y });
  }
  return { k, points };
}

// Generate all combinations of k out of n
function getCombinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = getCombinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

// Find most frequent secret across combinations
function findActualSecret(k, points) {
  const combinations = getCombinations(points, k);
  const map = new Map();
  combinations.forEach((combo) => {
    const secret = lagrangeInterpolation(combo).toString();
    map.set(secret, (map.get(secret) || 0) + 1);
  });
  // Pick the most common secret
  let max = 0;
  let actual = null;
  for (let [key, count] of map.entries()) {
    if (count > max) {
      max = count;
      actual = key;
    }
  }
  return actual;
}

// Find all .json testcases in testcases/ folder
function getTestcaseFiles() {
  const dir = path.join(__dirname, 'testcases');
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => path.join(dir, f));
}

// Main runner
function main() {
  const files = getTestcaseFiles();
  let output = '';
  files.forEach((file, idx) => {
    const { k, points } = parseInput(file);
    const secret = findActualSecret(k, points);
    const fname = path.basename(file);
    output += `✅ Secret for ${fname}: ${secret}\n`;
    console.log(`✅ Secret for ${fname}: ${secret}`);
  });
  // Write to output/secrets.txt
  const outPath = path.join(__dirname, 'output', 'secrets.txt');
  fs.writeFileSync(outPath, output);
}

main();
