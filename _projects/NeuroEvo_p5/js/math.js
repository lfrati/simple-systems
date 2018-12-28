/*
 * Returns a random integer between min (inclusive) and max (exclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/*
 * Fixes JS's native % not working for negative numbers
 */
function mod(n, m) {
    return ((n % m) + m) % m;
}

/* 
 * Variant of Luc Devroye's "Second Waiting Time Method" on page 522 of his 
 * text "Non-Uniform Random Variate Generation."  The expected number of 
 * iterations is O(np) so it's pretty fast for small p values.
 */
function getBinomial(n, p) {
    if (p <= 0) {
        return 0;
    }
    if (p >= 1) {
        return n;
    }
    if (p < 0.5) {
        return n - getBinomial(n, 1 - p);
    }
    const log_q = Math.log(1.0 - p);
    var x = 0;
    var sum = 0;
    while (true) {
        sum += Math.log(Math.random()) / (n - x);
        if (sum < log_q) {
            return x;
        }
        x += 1;
    }
}
