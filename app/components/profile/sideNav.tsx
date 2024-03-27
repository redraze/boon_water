"use client";

import { voidFunc } from "../../lib/commonTypes";

export default function SideNav({ setSelection }: { setSelection: voidFunc<string> }) {
    return (<>
        <ul className="m-auto pt-10 pl-32">
            <li 
                onClick={ () => setSelection('pw') }
                className="flex py-2 px-8 rounded-lg hover:cursor-pointer hover:bg-sky-500 hover:text-white border-2 border-sky-500"
            >
                <span className="m-auto mx-4">Update password</span>
            </li>
            <li 
                onClick={ () => setSelection('email') }
                className="flex py-2 px-8 rounded-lg hover:cursor-pointer hover:bg-sky-500 hover:text-white border-2 border-sky-500"
            >
                <span className="m-auto">Update email address</span>
            </li>
        </ul>
    </>);
};
