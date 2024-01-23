'use client';

import css from "./Nav.module.scss";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav(props: {validity: boolean}) {
    const router = useRouter();
    const handleLogout = (e: any) => {
        e.preventDefault();
        document.cookie = "token=; SameSite=lax; secure";
        router.push('/login' + '?loggedOut=true');
    };

    return (<>
        <div className={ css.nav }>
            {
                props.validity ? 
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
                </ul> :
                <></>
            }
        </div>
    </>);
};
