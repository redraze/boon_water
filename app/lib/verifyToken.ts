import jwt from "jsonwebtoken";

/**
 * Decodes jwt token and checks if it is expired.
 * @param token - JWT string to decode
 * @returns boolean indicating token validity
 */
export const clientSideTokenCheck = (token: string | undefined) => {
    try {
        if (!token) { throw new Error('missing token') };
        
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
        console.log('error thrown in [verifyToken.ts -> clientSideTokenCheck]: ' + error);
        return false;
    };
};

/**
 * Sends token to a server side API route for verification and to ensure token has permission to access desired resource.
 * @param token - JTW string to verify
 * @param pathname - pathname string
 * @returns boolean indicating access permission
 */
const queryVerifyTokenApi = async (token: string | undefined, pathname: string) => {
    if (!token) { throw new Error('missing token') };

    try {
        const response = await fetch("/api/verifyToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token,
            }),
            // ensure time-based tokens are re-verified
            cache: 'no-cache',
        });
        
        if (!response.ok) { throw new Error('API fetch response not OK') };

        const { validity } : { validity: boolean } = await response.json();
        return validity;

    } catch (error) {
        console.log('error thrown in [verifyToken.ts -> serverSideTokenCheck]' + error);
        return false;
    };
};

/**
 * Verifies provided JWT token and checks if token is permitted to access requested resource. This function should be called server side.
 * @param token - JWT string to verify
 * @param pathname - url endpoint being requested
 * @returns boolean indicating token validity, or undefined if an error is thrown
 */
export const verifyToken = (token: string | undefined, pathname: string) => {
    try {
        if (!token) { throw new Error('missing token [verifyToken.ts -> serverSideTokenCheck]') };

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
        console.log('error thrown in [verifyToken.ts -> serverSideTokenCheck]: ' + error);
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
    return await queryVerifyTokenApi(token, pathname);
};
