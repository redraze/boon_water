import Cookies from "js-cookie";
import { loggingEnabled } from "./tokens";
import type { userInfo } from "./commonTypes";

/**
 * Attmptes to fetch all water users' data.
 * @param pathname - string containing the origin of the request
 * @returns undefined if a server error is encountered, or an object containing: users, an array contianing various info about users; validity, a boolean indicating token validity
 */
export const getAllUsers = async (pathname: string) => {
    try {
        const response = await fetch("/api/users", {
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
        const res: { users: userInfo[], validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (loggingEnabled) {
            console.log('error thrown in [/lib/users getAllUsers function]: ' + error);
        };
    };
};


/**
 * Attempts to insert a new user into the database.
 * @param pathname - string
 * @param userInfo - 
 * @param userInfo - object containing the water users' data
 * @returns undefined if a server error is encountered, or an object containing: success, a boolean indicating whether the water user's data was successfully edited; validity, a boolean indicating token validity
 */
export const addNewUser = async (pathname: string, userInfo: userInfo ) => {
    try {
        const response = await fetch("/api/users", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                userInfo,
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: { success: boolean, validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (loggingEnabled) {
            console.log('error thrown in [/lib/users addNewUser function]: ' + error);
        };
    };
};


/**
 * Attempts to edit a single water user's data.
 * @param pathname - string
 * @param userId - string containing ID of water user to be edited
 * @param userInfo - object containing the water users' data
 * @returns undefined if a server error is encountered, or an object containing: success, a boolean indicating whether the water user's data was successfully edited; validity, a boolean indicating token validity
 */
export const editUser = async (pathname: string, userId: string, userInfo: userInfo ) => {
    try {
        const response = await fetch("/api/users", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                userId,
                userInfo,
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: { success: boolean, validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (loggingEnabled) {
            console.log('error thrown in [/lib/users editUser function]: ' + error);
        };
    };
};