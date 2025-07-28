// utils/decode.js
function decodeBase(value, base) {
    if (typeof value !== 'string') value = String(value);
    if (typeof base === 'string') base = parseInt(base, 10);
    let result = 0n;
    for (let i = 0; i < value.length; i++) {
        let digit = value[i].toLowerCase();
        let num = (digit >= '0' && digit <= '9') ? BigInt(digit) : BigInt(digit.charCodeAt(0) - 87);
        result = result * BigInt(base) + num;
    }
    return result;
}
module.exports = { decodeBase };
