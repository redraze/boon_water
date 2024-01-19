'use client';

import Cookies from "js-cookie";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyToken } from "../lib/verifyToken";
import Spinner from "./spinner/Spinner";
import Message from "./message/Message";

export default function Session({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const token = Cookies.get('token');
    const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
    
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // verifies token on window (re)loads or reroutes from users' login/logout
        if (isValid == undefined || searchParams.get('forceVerify') == 'true') {
            verifyToken(token)
                .then((validity: boolean) => {
                    setIsValid(validity);
                    return validity;
                })
                .then((validity: boolean) => {
                    if (validity == false && pathname !== '/login') {
                        setMessage('Please log in to view that page.');
                        router.push('/login');

                    } else if (validity && pathname == '/login') {
                        setMessage('You are already logged in.');
                        router.back();

                    } else {
                        setMessage('')
                        setLoading(false);
                    };
            });

        // token's validity has already been determined
        // (minimized api requests)
        } else {
            if (!isValid && pathname !== '/login') {
                router.push('/login')
            
            } else if (isValid && pathname == '/login') {
                router.back()
            
            } else {
                setLoading(false)
            }
        };
    }, [pathname, token]);

    if (loading) {
        return (<Spinner />);
    } else if (
        (!isValid && pathname !== '/login')
        || (isValid && pathname == '/login')
    ) {
        return (<></>);
    } else {
        return(<>
            <Message text={message} />
            { children }
        </>);
    };
};
