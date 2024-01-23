import { userInfo } from "../users/page";
import Cookies from "js-cookie";
import { loggingEnabled } from "./tokens";

/**
 * Fetches user data from /api/users endpoint.
 * @returns undefined if a server error is encountered, or an object containing: users, an array contianing various info about users; validity, a boolean indicating token validity
 */
export const getAllUsers = async () => {
    try {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token')
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        // returning an object containing both usersInfo and a boolean indicating validity
        // is neccessary here because an empty usersInfo array is falsey and therefor 
        // indistinguishable from a simplified response only containing { false }
        const res: { users: userInfo[], validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (loggingEnabled) {
            console.log('error thrown in [users.ts lib function]: ' + error);
        };
    };
};


/**
 * Attempts to edit a single water user's data.
 * @param userId - string containing ID of water user to be edited
 * @returns undefined if a server error is encountered, or an object containing: success, a boolean indicating whether the water user's data was successfully edited; validity, a boolean indicating token validity
 */
export const editUser = async (userId: string) => {
    try {
        const response = await fetch("/api/editUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                userId
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: { success: boolean, validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (loggingEnabled) {
            console.log('error thrown in [users.ts lib function]: ' + error);
        };
    };
};