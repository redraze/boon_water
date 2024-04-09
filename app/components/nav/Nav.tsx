"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import Image from "next/image";

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
                <div className="z-10 fixed w-full top-0 flex px-4 py-1 border-b-4 border-indigo-500 bg-white flex justify-between">
                    <ul className="flex justify-between overflow-auto">
                        <li className="flex">
                            <Link 
                                href='/' 
                                className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'
                            >
                                <span
                                    className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                                >
                                    Home
                                </span>
                            </Link>
                        </li>
                        <li className="flex">
                            <Link 
                                href='/users' 
                                className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'
                            >
                                <span
                                    className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                                >
                                    Users
                                </span>
                            </Link>
                        </li>
                        <li className="flex">
                            <Link 
                                href='/dataEntry' 
                                className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'
                            >
                                <span
                                    className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                                >
                                    Data Entry
                                </span>
                            </Link>
                        </li>
                        <li className="flex">
                            <Link 
                                href='/payments' 
                                className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'
                            >
                                <span
                                    className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                                >
                                    Payment Entry
                                </span>
                            </Link>
                        </li>
                        <li className="flex">
                            <Link 
                                href='/balances' 
                                className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'
                            >
                                <span
                                    className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                                >
                                    Balance History
                                </span>
                            </Link>
                        </li>
                        <li className="flex">
                            <Link 
                                href='/billing' 
                                className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'
                            >
                                <span
                                    className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                                >
                                    Billing
                                </span>
                            </Link>
                        </li>
                        <li className="flex">
                            <Link 
                                href='/reporting' 
                                className='group rounded-lg hover:bg-sky-500 hover:cursor-pointer px-12 py-2 transition-all m-auto'
                            >
                                <span
                                    className="group-hover:text-white text-lg whitespace-nowrap transition-all"
                                >
                                    Reporting
                                </span>
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
                                    <Image src="/settings.ico" alt="[options]" height={25} width={25} className="max-w-none"/>
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
