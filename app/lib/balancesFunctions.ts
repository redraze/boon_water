import Cookies from "js-cookie";
import { clientSideLoggingEnabled } from "./settings";
import { balanceEntryType, usersBalancesType } from "./commonTypes";

/**
 * Attmptes to fetch all water users' balance history data.
 * @param pathname - string containing the origin of the request
 * @returns undefined if a server error is encountered, or an object containing: data, an array of objects containing id, name, and balance history data; validity, a boolean indicating token validity
 * @throws if a server error is encountered
 */
export const getHistory = async ( pathname: string ) => {
    try {
        if (!pathname) { return { data: undefined, validity: false } };

        const response = await fetch("/api/balances", {
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

        const res: { data: usersBalancesType[], validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/balancesFunctions getHistory function]: ' + error);
        };
    };
};


/**
 * Attempts to push a new transaction to the water user's balance history, and attempts to update the water user's balance.
 * @param pathname - string containing the origin of the request
 * @param id - user id in string form
 * @param balanceChange - a number representing the change the user's balance
 * @param note - a string containing a description of why the balance change is being made
 * @returns undefined if a server error is encountered, or an object containing: success, a boolean indicating whether the transaction was successfly posted and user balance was successfully updated; validity, a boolean indicating token validity
 * @throws if a server error is encountered
 */
export const patchHistory = async (
    pathname: string,
    id: string,
    balanceChange: number,
    newBalance: number,
    note: string
) => {
    try {
        if (!pathname) {
            return { success: false, entry: undefined, validity: false }
        };

        const response = await fetch("/api/balances", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                id,
                balanceChange,
                newBalance,
                note
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: { 
            success: boolean,
            entry: balanceEntryType | undefined,
            validity: boolean 
        } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/balancesFunctions patchHistory function]: ' + error);
        };
    };
};
