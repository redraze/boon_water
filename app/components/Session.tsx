'use client';

import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "./spinner/Spinner";
import { verifyToken } from "../lib/functions";

export default function Session({
    children,
}: {
    children: React.ReactNode
}) {
    const token = Cookies.get('token');
    const pathname = usePathname();
    const determineValidity = async () => {
        const validity = await verifyToken(token, pathname);
        setIsValid(validity);
    };

    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const router = useRouter();

    useEffect(() => {
        determineValidity();

        if (!isValid && pathname !== '/login') {
            router.push('/login');
            // maybe persist messages using url queries?
            // router.push('/login?msg=Please+login+to+view+that+page.');

        } else if (isValid && pathname == '/login') {
            router.push('/');

        } else {
            setLoading(false);
        };
    });

    return(<>
        { loading ?  <Spinner /> : children }
    </>);
};
