import Cookies from "js-cookie";
import { clientSideLoggingEnabled } from "./settings";

/**
 * Sends request to backend API that rolls current year data into prev year data.
 */
export const rollData = async (pathname: string) => {
    try {
        if (!pathname) { return { success: false, validity: false } };

        const response = await fetch("/api/rollData", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const ret: { success: boolean, validity: boolean } = await response.json();
        return ret;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/rollDataFunctions rollData function]: ' + error);
        };
    };};