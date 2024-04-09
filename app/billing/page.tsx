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
import Spinner from "../components/spinner/Spinner";
import { backFlushId, wellHeadId } from "../lib/settings";

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
                    !ret.data || ret.data.length <= 1
                    || !ret.users || !ret.users.length
                ) {
                    setMessage('No water usage data available.');
                    setLoading(false);
                    return;
                };

                setUsage(ret.data.filter(item => {
                    if (
                        item._id !== wellHeadId 
                        && item._id !== backFlushId
                    ) {
                        return item;
                    };
                }));

                setUsers((draft: usersInfoDictType = {}) => {
                    ret.users.map(user => {
                        if (
                            user._id !== wellHeadId 
                            && user._id !== backFlushId
                        ) {
                            draft[user._id] = user.info;
                        };
                    });
                    return draft;
                });
            };
        });
        setLoading(false);
    }, []);
    
    const [quarter, setQuarter] = useState<quarterType>();
    const [year, setYear] = useState<yearType>();

    return (<>
        <Message text={ message } />
        { loading ? <Spinner /> : <>
            <div className="p-20 w-full h-screen">
                <Selections
                    setYear={setYear}
                    quarterState={{ value: quarter, setValue: setQuarter }}
                />
                {
                    (year && quarter) ? 
                        <Bills
                            users={users}
                            usage={usage}
                            year={year}
                            quarter={quarter}
                            setMessage={setMessage}
                        />
                        : <></>
                }
            </div>
        </>}
    </>);
};
