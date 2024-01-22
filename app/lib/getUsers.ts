import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { userInfo } from "../users/page";
import Cookies from "js-cookie";

/**
 * Requests user data from API endpoint.
 * @router a nextjs/navigation router instance
 * @returns an array containing users' info, or undefined if a server error is encountered
 */
export const getUsers = async (router: AppRouterInstance) => {
    try {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token')
            }),
        });

        if (!response.ok) {
            console.log('api fetch response not OK')
        };
        
        const { users }: { users: userInfo[] } = await response.json();
        return users;
      
    } catch (error) {
        console.log('error thrown in [users.ts lib function]: ' + error);
    };
};
