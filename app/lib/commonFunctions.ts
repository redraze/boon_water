/**
 * Formats numbers based on the following: 1) may contain any number of leading digits before the decimal 2) may only contain two decimal places (will default to .00)
 * @param val string
 * @returns a number in the form of a float
 */
export const formatVal = (val: string) => {
    if (val == '') { return 0 };
    if (isNaN(Number(val))) { return NaN };

    let vals = val.toString().split('.');

    // decimal was deleted
    if (vals.length == 1) {
        let n = vals[0]
        let whole = n.slice(0, n.length - 2);
        let decimal = n.slice(n.length - 2, n.length);
        return Number(whole + '.' + decimal);
    };

    let whole = vals[0], decimal = vals[1];

    // not enough decimal places
    if (decimal.length == 1) {
        decimal = whole[whole.length - 1] + decimal[0];
        whole = whole.slice(0, whole.length - 1);
    }

    // too many decimal places
    else if (decimal.length == 3) {
        whole = whole + decimal[0];
        decimal = decimal.slice(1, decimal.length);
    };

    return Number(whole + '.' + decimal);
};


/**
 * assistive function for sorting words alphatecially
 * @param left string
 * @param right string
 * @returns 0, 1, or -1 based on string comparison
 */
export const nameSort = (left: string, right: string) => {
    if (left < right) { return -1 }
    else if (left > right) { return 1}
    else { return 0 };
};