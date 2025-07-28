// utils/interpolate.js
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
        let term = yi * num / den;
        secret += term;
    }
    return secret;
}
module.exports = { lagrangeInterpolation };
