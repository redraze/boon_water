// TODO: move these rates into a database collection,
// and add an endpoint and API route to edit them
export const rates = {
    // thresh hold at which base rate changes
    baseRateThresh: 10000,
    
    // base charge if less than thresh hold
    ltThresh: 81,
    
    // base charge if greater than thresh hold
    gtThresh: 105,
    
    // overage thresh holds
    firstOverage: 15000,
    secondOverage: 20000,
    thirdOverage: 25000,
    
    // price per gallon overages
    firstOverageRate: 0.003,    // 30 cents per 100 gallons
    secondOverageRate: 0.004,   // 40 cents per 100 gallons
    thirdOverageRate: 0.02      // 2 dollars per 100 gallons
};
