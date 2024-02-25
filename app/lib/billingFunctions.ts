import Cookies from "js-cookie";
import { clientSideLoggingEnabled } from "./settings";
import { waterUsageType } from "./commonTypes";

/**
 * Attempts to fetch water usage data for all users for the specified year and quarter.
 * @param pathname - string
 * @param year - string
 * @param quarter - string
 * @throws if server side error is encountered
 */
export const getUsage = async (
    pathname: string,
    year: string,
    quarter: string
) => {
    try {
        if (!pathname) { return { data: undefined, validity: false } };

        const response = await fetch("/api/billing", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                year,
                quarter
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
