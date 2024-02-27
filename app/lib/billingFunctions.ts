import Cookies from "js-cookie";
import { clientSideLoggingEnabled } from "./settings";
import { quarterType, userInfo, waterUsageType, yearType } from "./commonTypes";
import { rates } from "./billingRates";

/**
 * Attempts to fetch all water users' info and usage data.
 * @param pathname - string
 * @returns an object containing water users' info, water users' usage, and the validity of the provided token
 * @throws if server side error is encountered
 */
export const getUserData = async (pathname: string) => {
    try {
        if (!pathname) { return { users: undefined, data: undefined, validity: false } };

        const response = await fetch("/api/billing", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: {
            users: userInfo[],
            data: waterUsageType[],
            validity: boolean
        } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/billingFunctions getUsage function]: ' + error);
        };
    };
};


/**
 * Calculates the meter readings for the water user from the given year/quarter.
 * @param entry - water usage data
 * @param year - string
 * @param quarter - string
 * @returns an array of numbers containing the meter readings
 */
export const getReadings = (
    entry: waterUsageType,
    year: yearType,
    quarter: quarterType
) => {
    const readings = [];

    // get the reading from end of previous quarter
    if (quarter == 'Q1') {
        readings.push(entry.data.prev.Q4[3]);
    } else if (quarter == 'Q2') {
        readings.push(entry.data[year]['Q1'][3]);
    } else if (quarter == 'Q3') {
        readings.push(entry.data[year]['Q2'][3]);
    } else if (quarter == 'Q4') {
        readings.push(entry.data[year]['Q3'][3]);
    };

    // get the remaining readings from the current quarter
    Object.entries(entry.data[year][quarter]).map(item => {
        readings.push(item[1]);
    });

    return readings;
};


/**
 * Calculates the overage charge (if any) for a given water usage. 
 * @param usage - number
 * @returns number
 */
export const calculateOverageCharge = (usage: number) => {
    let overageCharge = 0;

    if (usage > rates.thirdOverage) {
        // first overage
        overageCharge += (rates.secondOverage - rates.firstOverage) * rates.firstOverageRate

        // second overage
        overageCharge += (rates.thirdOverage - rates.secondOverage) * rates.secondOverageRate

        // third overage
        overageCharge += (usage - rates.thirdOverage) * rates.thirdOverageRate
    } else if (usage > rates.secondOverage) {
        // first overage
        overageCharge += (rates.secondOverage - rates.firstOverage) * rates.firstOverageRate

        // second overage
        overageCharge += (usage - rates.secondOverage) * rates.secondOverageRate
    } else if (usage > rates.firstOverage) {
        // first overage
        overageCharge += (usage - rates.firstOverage) * rates.firstOverageRate
    };

    return overageCharge;
};
