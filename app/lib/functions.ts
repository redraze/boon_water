export const verifyToken = async (token: string | undefined, pathname: string) => {
    if (!token || token == undefined || token == '') { return false };

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
            cache: 'no-cache',
        });
        
        if (!response.ok) throw new Error("Token verification failed");

        const { validity } = await response.json();
        return validity;

    } catch (error) {
        console.error(error);
    };
};

export const hashPassword = async (password: string) => {
    const msgUint8 = new TextEncoder().encode(password); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    
    return hashHex;
};
