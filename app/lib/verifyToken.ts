import jwt from "jsonwebtoken";

/**
 * Decodes token and checks expiration.
 * @param token - JWT string to decode
 * @returns boolean
 */
const clientSideTokenCheck = (token: string | undefined) => {
    try {
        if (!token) { throw new Error('client side token check error: missing token') };
        
        const payload = jwt.decode(
            token,
            { json: true }
        );

        if (process.env.NODE_ENV == 'production'){
            if (!payload || !payload.exp) { 
                throw new Error('client side token check error -- malformed token')
                // TODO: log IP address where token originated
                // ...and do some batman sec ops stuff?
            };
            
            const exp = payload.exp;
            if (Date.now() >= exp * 1000) {
                throw new Error('client side token check error -- token expired');
            };
        };

        return true;

    } catch (error) {
        console.error(error);
        return false;
    };
};

/**
 * Sends token to a server side API route for verification and to ensure token has permission to access desired resource.
 * @param token - JTW string to verify
 * @param resource - pathname string
 * @returns boolean | undefined
 */
const serverSideTokenCheck = async (token: string | undefined, resource: string) => {
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
        
        if (!response.ok) { throw new Error('server side token check error -- response not OK') };

        const { validity }: { validity: boolean } = await response.json();
        return validity;

    } catch (error) {
        console.error(error);
        return undefined;
    };
};

/**
 * Verifies token on client machine, then sends token to server side API route for further verification.
 * @param token - JWT string to verify
 * @param pathname - url endpoint being requested
 * @returns boolean indicates verification, undefined indicates an internal server error 
 */
export const verifyToken = async (token: string | undefined, pathname: string) => {
    if (!clientSideTokenCheck(token)) { return false };
    return await serverSideTokenCheck(token, pathname);
};
