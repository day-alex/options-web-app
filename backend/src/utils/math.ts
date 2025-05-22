// Approximation of the standard normal CDF using the error function (erf)
function standardNormalCDF(x: number): number {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

// Approximate the error function (erf)
function erf(x: number): number {
    // constants for approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
}

export default standardNormalCDF;
