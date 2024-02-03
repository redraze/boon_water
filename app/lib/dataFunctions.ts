import Cookies from "js-cookie";
import { clientSideLoggingEnabled } from "./settings";
import { waterUsageType } from "./commonTypes";

/**
 * Attmptes to fetch all water users' water usage data.
 * @param pathname - string containing the origin of the request
 * @returns undefined if a server error is encountered, or an object containing: data, an array of objects containing id, name, and water usage data; validity, a boolean indicating token validity
 */
export const getData = async (pathname: string) => {
    try {
        if (!pathname) { return { data: undefined, validity: false } };

        const response = await fetch("/api/data", {
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

        const res: { data: waterUsageType[], validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/users editUser function]: ' + error);
        };
    };
};