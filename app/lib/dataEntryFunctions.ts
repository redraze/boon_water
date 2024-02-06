import Cookies from "js-cookie";
import { clientSideLoggingEnabled } from "./settings";
import { waterUsageType, patchDataType } from "./commonTypes";

/**
 * Attmptes to fetch all water users' water usage data.
 * @param pathname - string containing the origin of the request
 * @returns undefined if a server error is encountered, or an object containing: data, an array of objects containing id, name, and water usage data; validity, a boolean indicating token validity
 */
export const getData = async (pathname: string) => {
    try {
        if (!pathname) { return { data: undefined, validity: false } };

        const response = await fetch("/api/data", {
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
            console.log('error thrown in [/lib/dataFunctions getData function]: ' + error);
        };
    };
};


/**
 * Attempts to update water usage data for the specified users within a specific year/quarter.
 * @param pathname - string containing the origin of the request
 * @param updates - a list of updates to be made
 * @returns undefined if a server error is encountered, or an object containing: success, a boolean indicating whether the update was successfly applied; validity, a boolean indicating token validity
 * @throws if a server error is encountered
 */
export const patchData = async (pathname: string, updates: patchDataType[]) => {
    try {
        if (!pathname) { return { success: false, validity: false } };

        const response = await fetch("/api/data", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                updates
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: { success: boolean, validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/dataFunctions patchData function]: ' + error);
        };
    };
};
