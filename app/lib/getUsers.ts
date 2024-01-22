import { userInfo } from "../users/page";
import Cookies from "js-cookie";

/**
 * Fetches user data from /api/users endpoint.
 * @returns undefined if a server error is encountered, or an object containing: users, an array contianing various info about users; validity, a boolean indicating token validity
 */
export const getUsers = async () => {
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
        console.log('error thrown in [users.ts lib function]: ' + error);
    };
};
