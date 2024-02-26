import Cookies from "js-cookie";
import { clientSideLoggingEnabled } from "./settings";
import { quarterType, waterUsageType, yearType } from "./commonTypes";

/**
 * Attempts to fetch water usage data for all users for the specified year and quarter.
 * @param pathname - string
 * @throws if server side error is encountered
 */
export const getUsage = async (pathname: string) => {
    try {
        if (!pathname) { return { data: undefined, validity: false } };

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

        const res: { data: waterUsageType[], validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/billingFunctions getUsage function]: ' + error);
        };
    };
};

/**
 * Calculates the charges for the water used from the given year/quarter.
 * @param entry - water usage data
 * @param year - string
 * @param quarter - string
 * @returns a number representing the payment due
 */
export const calculateCharge = (
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

    // TODO: calculate the charges for the user
    return 0;
};
