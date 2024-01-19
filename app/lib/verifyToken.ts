import jwt from "jsonwebtoken";

export const verifyToken = async (token: string | undefined) => {
    if (!token || token == undefined || token == '') { return false };

    try {
        // check on client side to see if token is expired before querying server
        // (won't help with tampered tokens, but should(?) minimize API calls otherwise)
        const payload = jwt.decode(token);
        // @ts-expect-error investigate proper type
        const exp = payload?.exp;
        if (Date.now() >= exp * 1000) {
            throw new Error('client side error -- token expired');
        };

        // double check token on server side if token passes client side check
        const response = await fetch("/api/verifyToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token,
            }),
            // disable caching so time-based tokens are re-validated
            cache: 'no-cache',
        });
        
        if (!response.ok) { 
            // console.error('error logged from verifyToken.tsx function in lib folder');
            return undefined;
        };

        const { validity }: { validity: boolean } = await response.json();
        return validity;

    } catch (error) {
        console.error(error);
        return false;
    };
};
