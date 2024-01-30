"use client";

import { voidFunc } from "../../lib/commonTypes";

export default function SideNav({ setSelection }: { setSelection: voidFunc<string> }) {
    return (<>
        <ul>
            <li onClick={ () => setSelection('pw') }>
                Update password
            </li>
            <li onClick={ () => setSelection('email') }>
                Update email address
            </li>
        </ul>
    </>);
};
