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
        const res: { users: userInfo[] | undefined , validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/users getAllUsers function]: ' + error);
        };
    };
};


/**
 * Attempts to edit a single water user's data.
 * @param pathname - string
 * @param userId - string containing ID of water user to be edited
 * @param userInfo - object containing the water users' data
 * @param nameChanged - a boolean indicating whether a change to the user's name has been made
 * @returns undefined if a server error is encountered, or an object containing: success, a boolean indicating whether the water user's data was successfully edited; validity, a boolean indicating token validity
 */
export const editUser = async (
    pathname: string,
    updateInfo: userInfo,
    nameChanged: boolean
) => {
    try {
        if (!pathname) { return { success: false, validity: false } };

        const response = await fetch("/api/users", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                updateInfo,
                nameChanged
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: { success: boolean, validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/users editUser function]: ' + error);
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
export const addNewUser = async (pathname: string, newUserInfo: userInfo['info'] ) => {
    try {
        if (!pathname) { return { success: false, validity: false, newUser: undefined } };
    
        const response = await fetch("/api/users", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                newUserInfo,
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: {
            success: boolean,
            validity: boolean,
            newUser: userInfo | undefined
        } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/users addNewUser function]: ' + error);
        };
    };
};


/**
 * Attempts to delete a user from the database.
 * @param pathname - string
 * @param id - string
 * @returns undefined if a server error is encountered, or an object containing: success, a boolean indicating whether the water user's data was successfully edited; validity, a boolean indicating token validity
 */
export const deleteUser = async (pathname: string, userId: string ) => {
    try {
        if (!pathname) { return { success: false, validity: false } };
    
        const response = await fetch("/api/users", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname,
                userId,
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: { success: boolean, validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/users addNewUser function]: ' + error);
        };
    };
};
