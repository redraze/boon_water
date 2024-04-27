export const formatVal = (val: string) => {
    if (isNaN(Number(val))) {
        return NaN;
    };

    let vals = val.toString().split('.');

    // decimal was deleted
    if (vals.length == 1) {
        let n = vals[0]
        let whole = n.slice(0, n.length - 2);
        let decimal = n.slice(n.length - 2, n.length);
        return Number(whole + '.' + decimal);
    };

    let whole = vals[0], decimal = vals[1];

    // decimal place was removed
    if (decimal.length == 1) {
        decimal = whole[whole.length - 1] + decimal[0];
        whole = whole.slice(0, whole.length - 1);
    }

    // decimal place was added
    else if (decimal.length == 3) {
        whole = whole + decimal[0];
        decimal = decimal.slice(1, decimal.length);
    };

    return Number(whole + '.' + decimal);
};