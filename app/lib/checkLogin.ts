/**
 * Sends credentials to server API route which then checks those credentials against a users database.
 * @param email - string
 * @param password - string
 * @returns A signed JSON web token if provided credentials were authentic, undefined otherwise 
 */
export const checkLogin = async (email: string, password: string) => {
    try {
        const hash = await hashPassword(password);

        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                hash,
            }),
        });

        if (!response.ok) {
            console.log('error logged from checkLogin.tsx lib function')
            return undefined;
        };
        
        const { token }: { token: string | undefined } = await response.json();
        return token;
      
    } catch (error) {
        console.log(error);
        return undefined;
    };
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
