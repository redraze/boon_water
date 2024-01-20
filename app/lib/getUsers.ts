import { userInfo } from "../users/page";
import Cookies from "js-cookie";

export const getUsers = async () => {
    try {
        const token = Cookies.get('token');

        // TODO
        // check for token malformation/expiration
        // if (badToken(token)) { throw new Error(...) };

        // this ^ logic (client side token verification) is also present in the 
        // verifyToken.ts lib function and could be generalized, abstracted into,
        // and exported from a different(?) lib function
        
        const response = await fetch("/api/getUsers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token
            }),
        });

        if (!response.ok) {
            console.log('error logged from getUsers.tsx lib function')
            return undefined;
        };
        
        const { users }: { users: userInfo[] } = await response.json();
        return users;
      
    } catch (error) {
        console.error(error);
        return undefined;
    };
};
