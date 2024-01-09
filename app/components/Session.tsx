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
    const pathname = usePathname();
    const router = useRouter();
    const token = Cookies.get('token');
    
    const isValidToken = (token: string | undefined) => {
        if (!token || token == '') {
            return false;
        };

        // TODO
        // decode the token using JWT_SECRET, 
        // then verify its validity and 
        // check if the cookie has expired
        
        return true;
    };
    
    // TODO: set this message as a server side prop instead of a client side prop
    // const [msg, setMsg] = useState('');

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const valid = isValidToken(token); 
        if (!valid && pathname !== '/login') {
            // setMsg('Please log in to view that page.')
            router.push('/login');
        } else if (valid && pathname == '/login') {
            // setMsg('already logged in')
            router.push('/')
        } else {
            // setMsg('')
            setLoading(false);
        };
    });

    return(<>
        <Message text={''} />
        { loading ?  <Spinner /> : children }
    </>);
};
