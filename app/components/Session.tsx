'use client';

import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "./spinner/Spinner";
import Message from "./message/Message";

export default function Session({
    children,
}: {
    children: React.ReactNode
}) {
    const token = Cookies.get('token');
    const pathname = usePathname();
    
    const checkValidity = async (token: string | undefined) => {
        if (token == undefined || token == '') { return false };

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
            });
            
            if (!response.ok) throw new Error("Token verification failed");

            const { isValid } = await response.json();
            return isValid;

        } catch (error) {
            console.error(error);
        };
    };
    
    // TODO: set this message as a server side prop instead of a 
    // client side prop so it persists when page is rerouted
    const [msg, setMsg] = useState('');

    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Note to self:
        // An async function is defined and called here because using
        // useEffect( async () => {
        //     const isValid = await checkValidity(token);
        //     ...
        // });
        // return a promise to the useEffect hook, which is illegal?
        const fetchValidity = async (token: string | undefined) => {
            const res = await checkValidity(token); 
            setIsValid(res);
        };
        fetchValidity(token);

        if (!isValid && pathname !== '/login') {
            // setMsg('Please log in to view that page.')
            router.push('/login');

        } else if (isValid && pathname == '/login') {
            // setMsg('already logged in')
            router.push('/')

        } else {
            // setMsg('')
            setLoading(false);
        };
    });

    return(<>
        <Message text={msg} />
        { loading ?  <Spinner /> : children }
    </>);
};
