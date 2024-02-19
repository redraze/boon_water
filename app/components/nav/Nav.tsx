"use client";

import css from "./Nav.module.scss";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

export default function Nav(props: {validity: boolean}) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        document.cookie = "token=; SameSite=lax; secure";
        router.push('/login' + '?loggedOut=true');
    };

    const [userName, setUserName] = useState('');
    useEffect(() => {
        if (props.validity){
            const token = Cookies.get('token');
            if (token) {
                const payload = jwt.decode(token, { json: true });
                setUserName(payload?.name);
            };
        };
    }, [props.validity]);
    
    const [profileDrop, setProfileDrop] = useState(false);
    useEffect(() => {
        setProfileDrop(false);
    }, [pathname]);

    return (<>
        <div className={ css.nav }>
            {
                props.validity ? 
                <ul>
                    <li>
                        <Link href='/users'>Users</Link>
                    </li>
                    <li>
                        <Link href='/balances'>Balance History</Link>
                    </li>
                    <li>
                        <Link href='/payments'>Enter Payments</Link>
                    </li>
                    <li>
                        <Link href='/billing'>Billing</Link>
                    </li>
                    <li>
                        <Link href='/dataEntry'>Data Entry</Link>
                    </li>
                    <li>
                        Hi { userName }!
                        <button onClick={ () => setProfileDrop(!profileDrop) }>
                            [dropdown_icon]
                        </button>
                        <ul style={ profileDrop ? {display: "flex"} : {display: "none"} }>
                            <li onClick={ () => router.push('/profile') }>
                                Profile
                            </li>
                            <li onClick={ () => handleLogout() }>
                                Log Out
                            </li>
                        </ul>
                    </li>
                </ul> :
                <></>
            }
        </div>
    </>);
};
