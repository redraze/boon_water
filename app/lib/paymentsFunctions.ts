import Cookies from "js-cookie";
import { clientSideLoggingEnabled } from "./settings";
import type { userInfo } from "./commonTypes";

/**
 * Attempts to fetch all water users' data.
 * @param pathname - string containing the origin of the request
 * @returns undefined if a server error is encountered, or an object containing: users, an array contianing various info about users; validity, a boolean indicating token validity
 */
export const getAllUsers = async (pathname: string) => {
    try {
        if (!pathname) { return { users: undefined, validity: false } };
        
        const response = await fetch("/api/payments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        // returning an object containing both usersInfo and a boolean indicating validity
        // is neccessary here because an empty usersInfo array is falsey and therefor 
        // indistinguishable from a simplified response only containing { false }
        const res: { users: userInfo[] | undefined , validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/payments getAllUsers function]: ' + error);
        };
    };
};


/**
 * Attempts to update specified users' balances and balance histories with submitted payment information.
 * @param pathname - string
 * @param payments - an array of objects containing user information and the payments those users are making
 * @param note - a string describing the payment(s) being made
 * @returns undefined if a server error is encountered, or an object containing: success, a boolean indicating whether the water users' data was successfully updated; validity, a boolean indicating token validity
 */
export const submitPayments = async (
    pathname: string,
    payments: ({ 
        id: string,
        name: string,
        balance: number,
        payment: number
    } | undefined)[],
    note: string
) => {
    try {
        if (!pathname) { return { success: false, validity: false } };

        const response = await fetch("/api/payments", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                payments,
                note
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: { success: boolean, validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/payments editUser function]: ' + error);
        };
    };
};
