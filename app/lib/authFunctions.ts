import jwt from "jsonwebtoken";
import Cookies from "js-cookie";
import { clientSideLoggingEnabled } from "./settings";

/**
 * Decodes the user's token, and retrieves the id from the decoded payload.
 * @returns a string containing the user's id
 */
const getId = () => {
    const oldToken = Cookies.get('token');
    if ( !oldToken ) { throw new Error('token not found') };
    const payload = jwt.decode(oldToken, { json: true });
    const id: string | undefined = payload?.id;
    return id;
};


/**
 * Asynchronously hashes the provided string with the SHA-256 algorithm.
 * @param password - string
 * @returns hashed password string
 */
const hashPassword = async (password: string) => {
    const msgUint8 = new TextEncoder().encode(password); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    
    return hashHex;
};

/**
 * Sends credentials to server API route which then checks those credentials against a users database.
 * @param email - string
 * @param password - string
 * @returns A signed JSON web token if provided credentials were authentic, undefined otherwise 
 */
export const checkLogin = async (email: string, password: string) => {
    try {
        const hash = await hashPassword(password);

        const response = await fetch("/api/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                hash,
            }),
        });

        if (!response.ok) { throw new Error('response not OK') };
        
        const { token }: { token: string | undefined } = await response.json();
        return token;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/authFunctions -> checkLogin]: ' + error);
        };
    };
};


/**
 * Sends password to server API route which then attempts to update the user's pw in the shadow db.
 * @param newPw - string
 * @param oldPw - string
 * @returns A signed JSON web token if provided credentials were authentic, undefined otherwise 
 */
export const changePassword = async (oldPw: string, newPw: string) => {
    try {
        const oldHash = await hashPassword(oldPw);
        const newHash = await hashPassword(newPw);

        const response = await fetch("/api/auth", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                updateType: "password",
                id: getId(),
                oldHash,
                newHash,
            }),
        });

        if (!response.ok) { throw new Error('response not OK') };
        
        const { token }: { token: string | undefined } = await response.json();
        return token;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/authFunctions -> changePassword]: ' + error);
        };
    };
};


/**
 * Sends new email and password to server API route which then attempts to update the user's email in the shadow db.
 * @param email - string
 * @param password - string
 * @returns A signed JSON web token if provided credentials were authentic, undefined otherwise 
 */
export const changeEmail = async (email: string, password: string) => {
    try {
        const hash = await hashPassword(password);

        const response = await fetch("/api/auth", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                updateType: "email",
                id: getId(),
                email,
                hash,
            }),
        });

        if (!response.ok) { throw new Error('response not OK') };
        
        const { token }: { token: string | undefined } = await response.json();
        return token;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/authFunctions -> changeEmail]: ' + error);
        };
    };
};


/**
 * Decodes jwt token and checks if it is expired.
 * @param token - JWT string to decode
 * @returns boolean indicating token validity
 */
export const clientSideTokenCheck = (token: string | undefined) => {
    try {
        if (!token) { 
            if (clientSideLoggingEnabled) {
                console.log('auth failed! (missing token)');
            };
            return false;
         };
        
        const payload = jwt.decode(
            token,
            { json: true }
        );

        if (process.env.NODE_ENV == 'production'){
            if (!payload || !payload.exp) { 
                throw new Error('malformed token')
                // TODO: log IP address where token originated
                // ...and do some batman sec ops stuff?
            };
            
            const exp = payload.exp;
            if (Date.now() >= exp * 1000) {
                throw new Error('token expired');
            };
        };

        return true;

    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/authFunctions -> clientSideTokenCheck]: ' + error);
        };
        return false;
    };
};


/**
 * Sends token to a server side API route for verification and to ensure token has permission to access desired resource.
 * @param token - JTW string to verify
 * @param pathname - pathname string
 * @returns boolean indicating access permission
 */
const fetchValidity = async (token: string | undefined, pathname: string) => {
    if (!token) { throw new Error('missing token') };

    try {
        const response = await fetch("/api/verifyToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token,
                pathname
            }),
            // ensure time-based tokens are re-verified
            cache: 'no-cache',
        });
        
        if (!response.ok) { throw new Error('API fetch response not OK') };

        const { validity } : { validity: boolean } = await response.json();
        return validity;

    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/authFunctions -> fetchValidity]' + error);
        };
        return false;
    };
};


/**
 * Attempts to validate request.
 * @param token - JWT token in string form
 * @param pathname - pathname where request originated
 * @param origin - API call origin
 * @param method - string, method being requested
 * @returns boolean indicating token validity
 * @throws undefined if a server error is encountered
 */
export const validateRequest = async (token: string, pathname: string, origin: string, method: string) => {
    // prevent users with valid tokens but invalid permissions from 
    // gaining access to protected endpoints through request origin spoofing
    if (pathname !== origin) {
        console.log(`message logged from [authFunctions -> /api${origin}] ${method}: invalid pathname origin`);
        // TODO: log request and flag for review
        return false;
    };

    const validity = verifyToken(token, pathname);
    if (validity == undefined) {
        throw new Error('[validateRequest function]: internal server error encountered');
    };
    return validity;
};


/**
 * Verifies provided JWT token and checks if token is permitted to access requested resource. This function should be called server side.
 * @param token - JWT string to verify
 * @param pathname - url endpoint being requested
 * @returns a boolean indicating token validity, or undefined if an internal server error is encountered
 */
export const verifyToken = (token: string | undefined, pathname: string) => {
    try {
        if (!token) { throw new Error('missing token') };

        if (!process.env.JWT_SECRET) {
            console.log('missing env variable: JWT_SECRET');
            return undefined;
        };
        
        jwt.verify(
            token,
            process.env.JWT_SECRET,
            { complete: true }
        );
        
        return true;

    } catch (error) {
        console.log('error thrown in [/lib/authFunctions -> verifyToken]: ' + error);
        return false;
    };

    // >>>             FOR FUTURE VERSION             <<<
    // determine if the token provided has permission to access the requested resource
    // 
    // (maybe cross-reference a global dictionary of [token, permissions] pairs?
    // store in a local db or just memory?
    // when a user logs in their token and its permissions are stored in the dict,
    // and when the user logs out that token is deleted)
    //
    // this way more than one kind of user can access the site. instead of just
    // an admin user that unters data/generates bills for users, each user can
    // access the site and view analyits about their water usage
    // 
    // const decoded = jwt.verify(
    //     token,
    //     process.env.JWT_SECRET,
    //     { complete: true }
    // );
    // const payload = decoded.payload;
    // const validity = hasPermission(payload, pathname);
    // return validity;
};


/**
 * Verifies token on client machine, then sends token to server side API route for further verification.
 * @param token - JWT string to verify
 * @param pathname - url endpoint being requested
 * @returns boolean indicating token validity
 */
export const fullTokenVerification = async (token: string | undefined, pathname: string) => {
    if (!clientSideTokenCheck(token)) { return false };
    return await fetchValidity(token, pathname);
};
