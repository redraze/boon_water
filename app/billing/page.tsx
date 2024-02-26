"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Message from "../components/message/Message";
import { getUsage } from "../lib/billingFunctions";
import type { quarterType, waterUsageType, yearType } from "../lib/commonTypes";
import Bills from "../components/billing/Bills";
import Selections from "../components/billing/Selections";

export default function Billing() {
    const router = useRouter();
    const pathname = usePathname();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [usage, setUsage] = useState<waterUsageType[]>([]);
    useEffect(() => {
        // prevent data re-fetching during dev env hot reloads 
        if (usage.length) { return };

        setLoading(true);
        getUsage(pathname).then(ret => {
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
                if (!ret.data!.length) {
                    setMessage('No water usage data available.');
                    return;
                };
                setUsage(ret.data!);
            };
        });
        setLoading(false);
    }, []);
    
    const m = new Date().getMonth();
    const q = 'Q' + Math.floor(m / 3) + 1;
    const [quarter, setQuarter] = useState<quarterType>(
        q == 'Q1' || q == 'Q2' || q == 'Q3' || q == 'Q4' ?
        q : 'Q1'
    );
    const [year, setYear] = useState<yearType>('cur');
    
    return (<>
        <Message text={ message } />
        { loading ? <></> : <>
            <Selections
                setYear={setYear}
                quarterState={{ value: quarter, setValue: setQuarter }}
            />
            <Bills data={usage} year={year} quarter={quarter} />
        </>}
    </>);
};
