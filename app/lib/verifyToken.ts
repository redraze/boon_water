export const verifyToken = async (token: string | undefined) => {
    if (!token || token == undefined || token == '') { return false };

    try {
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
        
        if (!response.ok) throw new Error("Token verification failed (0)");

        const { validity }: { validity: boolean } = await response.json();

        if (validity == undefined) throw new Error("Token verification failed (1)");

        return validity;

    } catch (error) {
        console.error(error);
        return false;
    };
};
