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
        console.error(error);
        return undefined;
    };
};

const hashPassword = async (password: string) => {
    const msgUint8 = new TextEncoder().encode(password); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    
    return hashHex;
};
