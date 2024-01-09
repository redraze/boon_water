'use client';

import css from "./Nav.module.scss";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Nav() {
    const router = useRouter();
    const handleLogout = (e: any) => {
        e.preventDefault();
        Cookies.set('token', '');

        // TODO: revoke cookie
        // await endSession();

        router.push('/login');
    };

    return (<>
        <div className={ css.nav }>
            <ul>
                <li>
                    <Link href='/billing'>Billing</Link>
                </li>
                <li>
                    <Link href='/dataEntry'>Data Entry</Link>
                </li>
                <li onClick={ (e) => handleLogout(e) }>
                    Log Out
                </li>
            </ul>
        </div>
    </>);
};
