"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Message from "../components/message/Message";
import { getUserData } from "../lib/billingFunctions";
import type {
    quarterType,
    usersInfoDictType,
    waterUsageType,
    yearType
} from "../lib/commonTypes";
import Bills from "../components/billing/Bills";
import Selections from "../components/billing/Selections";

export default function Billing() {
    const router = useRouter();
    const pathname = usePathname();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [usage, setUsage] = useState<waterUsageType[]>([]);
    const [users, setUsers] = useState<usersInfoDictType>({});

    useEffect(() => {
        // prevent data re-fetching during dev env hot reloads 
        if (usage.length) { return };

        setLoading(true);
        getUserData(pathname).then(ret => {
                if (ret == undefined) {
                setMessage(
                    'Internal server error encountered while retrieving user info.'
                    + ' Please contact system administrator or try again later.'
                );
                // a user with any token (valid or tampered-with) that experiences
                // a server error will arrive at this point. should those users 
                // (both valid and malicious) be routed somewhere else?

            } else if (!ret.validity) {
                router.push('/login' + '?loginRequired=true')

            } else {
                if (
                    !ret.data || !ret.data.length 
                    || !ret.users || !ret.users.length
                ) {
                    setMessage('No water usage data available.');
                    return;
                };
                setUsage(ret.data!);

                const tempUsers: usersInfoDictType = {};
                ret.users.map(user => {
                    tempUsers[user._id] = user.info
                });
                setUsers(tempUsers);
            };
        });
        setLoading(false);
    }, []);
    
    const [quarter, setQuarter] = useState<quarterType>('Q1');
    const [year, setYear] = useState<yearType>('cur');

    const q = Math.floor(new Date().getMonth() / 3);
    if (q == 0) {
        setQuarter('Q4');
        setYear('prev');
    } else {
        if (q == 1) { setQuarter('Q1') }
        else if (q == 2) { setQuarter('Q2') }
        else if (q == 3) { setQuarter('Q3') };
        setYear('cur');
    };
    
    return (<>
        <Message text={ message } />
        { loading ? <></> : <>
            <Selections
                setYear={setYear}
                quarterState={{ value: quarter, setValue: setQuarter }}
            />
            <Bills users={users} usage={usage} year={year} quarter={quarter} />
        </>}
    </>);
};
