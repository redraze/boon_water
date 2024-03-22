import Cookies from "js-cookie";
import { clientSideLoggingEnabled } from "./settings";
import { quarterType, userInfo, waterUsageType, yearType } from "./commonTypes";
import { rates } from "./billingRates";
import { chargeType, statementType } from "../components/billing/UserActions";

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
 * 
 */
export const sendBillsToUsers = async (
    pathname: string, 
    statements: statementType[], 
    emailNote: string,
    quarter: string
) => {
    try {
        if (!pathname) { return { success: false, validity: false } };

        const response = await fetch("/api/billing", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                statements,
                emailNote,
                quarter
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: { success: boolean, validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/billingFunctions getUsage function]: ' + error);
        };
    };
};


/**
 * Attempts to update each water user's billing history and current balance using the current bills' payments.
 * @param pathname - string
 * 
 * @returns an object containing the success of the requested operation as a boolean, and the validity of the provided token
 * @throws if server side error is encountered
 */
export const postPaymentsToBalances = async (pathname: string, charges: chargeType[], note: string) => {
    try {
        if (!pathname) { return { success: false, validity: false } };

        const response = await fetch("/api/billing", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                charges,
                note
            })
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: {
            success: boolean,
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


/**
 * Formats an HTML message body for an SMTP message
 * @param statement - object containing information used to format the statement
 * @returns a string with HTML formatting
 */
export const messageBody = (statement: statementType, emailNote?: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const date = new Date();
    const formattedDate = [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/');

    const totalUsage = statement.readings[3] - statement.readings[0];
    const baseCharge = totalUsage > rates.baseRateThresh ? rates.gtThresh : rates.ltThresh;
    const overageCharge = calculateOverageCharge(totalUsage);
    const newBalance = statement.comp ? 
        (statement.balance < 0 ? statement.balance : 0 ) :
        statement.balance + baseCharge + overageCharge;
        
    const header = emailNote ? `Attention:<br/>${emailNote}<br/><br/>` : '';

    return (`
        ${ header }
        <div>
            <div>
                <h1>North Boon Water Co.</h1>
                <h4>1885 N. Boon Road</h4>
                <h4>Oak Harbor, WA 98277</h4>
            </div>

            <div>
                <div className="user info">
                    <p>${ statement.name }</p>
                    <p>${ statement.address }</p>
                    <p>${ statement.email }</p>
                </div>

                <div className="statement date">
                    <b>Statement date:</b>
                    <p>${ formattedDate }</p>
                </div>
            </div>

            <div>
                <div>
                    <h3>Rates Schedule:</h3>
                    <p>base rate if &lt;${rates.baseRateThresh}: <b>${formatter.format(rates.ltThresh)}</b></p>
                    <p>base rate if &gt;${rates.baseRateThresh}: <b>${formatter.format(rates.gtThresh)}</b></p>
                    <p>first ${rates.secondOverage - rates.firstOverage} over ${rates.firstOverage} @ ${formatter.format(rates.firstOverageRate * 100)} per 100 gallons</p>
                    <p>second ${rates.thirdOverage - rates.secondOverage} over ${rates.secondOverage} @ ${formatter.format(rates.secondOverageRate * 100)} per 100 gallons</p>
                    <p>over ${rates.thirdOverage} @ ${formatter.format(rates.thirdOverageRate * 100)} per 100 gallons</p>
                </div>
                
                <div>
                    <p>Meter readings</p>
                    <p>beginning of quarter: ${statement.readings[0]}</p>
                    <p>end of first month: ${statement.readings[1]}</p>
                    <p>end of second month: ${statement.readings[2]}</p>
                    <p>end of third month: ${statement.readings[3]}</p>
                    <p><b>total gallons used:</b> ${totalUsage}</p>
                </div>

                <div>
                    <p>base water charge: ${ formatter.format(baseCharge) }</p>
                    <p>overage charges: ${ formatter.format(overageCharge) }</p>
                    <p>total charges: ${ formatter.format(baseCharge + overageCharge) }</p>
                    <p>prev balance: ${ formatter.format(statement.balance) }</p>
                    <p>new balance: ${ formatter.format(newBalance) }
                    ${ statement.comp ? '<b> (USER IS COMP&apos;D)</b>' : '' }</p>
                </div>
            </div>
        </div>
    `);
};
