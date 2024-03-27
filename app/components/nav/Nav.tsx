"use client";

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
        {
            props.validity ? <>
                <div className="sticky top-0 flex px-10 py-1 border-b-4 border-indigo-500 bg-white flex justify-between">
                    <ul className="flex justify-between">
                        <li className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'>
                            <Link 
                                href='/users' 
                                className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                            >
                                Users
                            </Link>
                        </li>
                        <li className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'>
                            <Link 
                                href='/dataEntry' 
                                className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                            >
                                Data Entry
                            </Link>
                        </li>
                        <li className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'>
                            <Link 
                                href='/payments' 
                                className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                            >
                                Payment Entry
                            </Link>
                        </li>
                        <li className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'>
                            <Link 
                                href='/balances' 
                                className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                            >
                                Balance History
                            </Link>
                        </li>
                        <li className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'>
                            <Link 
                                href='/billing' 
                                className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                            >
                                Billing
                            </Link>
                        </li>
                    </ul>
                    <div className="flex justify-end flex">
                        <div
                            onMouseEnter={() => setProfileDrop(true)} 
                            onMouseLeave={() => setProfileDrop(false)}
                            className="relative"
                        >
                            <div className="py-2 flex hover:cursor-pointer">
                                <span className="text-lg pr-2 m-auto">Hi { userName }!</span>
                                <button className="p-2">
                                    <img src="settings.ico" alt="[options]" className="h-6 w-6"/>
                                </button>
                            </div>
                            <ul 
                                className="absolute top-12 right-2 bg-white border-4 border-sky-500 rounded-lg w-full"
                                style={ profileDrop ? {display: "block"} : {display: "none"} }
                            >
                                <li 
                                    onClick={ () => router.push('/profile') }
                                    className="group hover:bg-sky-500 flex transition-all py-2 px-4 hover:cursor-pointer"
                                >
                                    <span className="group-hover:text-white whitespace-nowrap transition-all">Profile</span>
                                </li>
                                <li
                                    onClick={ () => handleLogout() }
                                    className="group hover:bg-sky-500 flex transition-all py-2 px-4 hover:cursor-pointer"
                                >
                                    <span className="group-hover:text-white whitespace-nowrap transition-all">Log Out</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </> :
            <></>
        }
    </>);
};
