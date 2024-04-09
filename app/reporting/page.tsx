"use client";

import { useEffect, useState } from "react";
import Message from "../components/message/Message";
import { usePathname, useRouter } from "next/navigation";
import { getData } from "../lib/reportingFunctions";
import { waterUsageType } from "../lib/commonTypes";
import { wellHeadId } from "../lib/settings";
import Spinner from "../components/spinner/Spinner";

export default function Profile() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const pathname = usePathname(), router = useRouter();
  
    const [userData, setUserData] = useState<waterUsageType[] | undefined>(undefined);
    const [wellData, setWellData] = useState<waterUsageType | undefined>(undefined);

    useEffect(() => {
        setLoading(true);
        getData(pathname).then((ret) => {
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
                if (!ret.data) {
                    setMessage('No water usage data available.');
                    return;
                };
                
                setUserData(() => {
                    return ret.data.filter(user => {
                        if (user._id == wellHeadId) {
                            setWellData(user);
                        } else {
                            return user;
                        };
                    });
                });
            };
        });
        setLoading(false);
    }, []);

    return (<>
        <Message text={ message } />
        { loading ? <Spinner /> : <>
            
        </>}
    </>);
};
