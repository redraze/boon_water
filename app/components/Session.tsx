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
        // skip verification on failed login attempts
        if (searchParams.get('loginFailed') == 'true' && pathname == '/login') {
            setMessage('Login attempt failed.');
            setLoading(false);

        // verifies token on window (re)loads or reroutes from users' login/logout
        } else if (isValid == undefined || searchParams.get('forceVerify') == 'true') {
            verifyToken(token, pathname)
                .then((validity: boolean | undefined) => {
                    setIsValid(validity);
                    return validity;
                })
                .then((validity: boolean | undefined) => {
                    if (validity == undefined) {
                        setMessage(
                            "Internal server error enountered while attempting to authenticate."
                            + " Please contact your system administrator, or try again later."
                        );
                        router.push('/login');
                        setIsValid(false);
                        setLoading(false);
                    }

                    else if (validity == false && pathname !== '/login') {
                        setMessage('Please log in to view that page.');
                        router.push('/login');

                    } else if (validity && pathname == '/login') {
                        setMessage('You are already logged in.');
                        router.push('/');

                    } else {
                        setMessage('')
                        setLoading(false);
                    };
            });

        // token's validity has already been determined
        // (minimized api requests)
        } else {
            if (!isValid && pathname !== '/login') {
                router.push('/login');
            
            } else if (isValid && pathname == '/login') {
                router.push('/');
            
            } else {
                setLoading(false);
            };
        };
    }, [pathname, token, searchParams]);

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
