'use client';

import css from "./Nav.module.scss";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav() {
    const router = useRouter();
    const handleLogout = (e: any) => {
        e.preventDefault();
        document.cookie = "token=; SameSite=lax; secure";
        router.push('/login' + '?forceVerify=true');
    };

    return (<>
        <div className={ css.nav }>
            <ul>
                <li>
                    <Link href='/users'>Water Users</Link>
                </li>
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
