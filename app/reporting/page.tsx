"use client";

import { useEffect, useState } from "react";
import Message from "../components/message/Message";
import { usePathname, useRouter } from "next/navigation";
import { getData } from "../lib/reportingFunctions";
import { mDict, quarterType, waterUsageType, yearType } from "../lib/commonTypes";
import { backFlushId, wellHeadId } from "../lib/settings";
import Spinner from "../components/spinner/Spinner";
import Selections from "../components/Selections";

export default function Profile() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const pathname = usePathname(), router = useRouter();
  
    const [userData, setUserData] = useState<waterUsageType[] | undefined>(undefined);
    const [wellData, setWellData] = useState<waterUsageType | undefined>(undefined);
    const [flushData, setFlushData] = useState<waterUsageType | undefined>(undefined);

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
                        } else if (user._id == backFlushId) {
                            setFlushData(user);
                        } else {
                            return user;
                        };
                    });
                });
            };
        });
        setLoading(false);
    }, []);

    const [quarter, setQuarter] = useState<quarterType>('Q1');
    const [year, setYear] = useState<yearType>('cur');

    const resetUsage = () => {

    };

    return (<>
        <Message text={ message } />
        { loading ? <Spinner /> : <>
            <div className="pt-20">
                <Selections setQuarter={setQuarter} setYear={setYear} resetUsage={resetUsage} />

                <table>
                    <thead>
                        <tr>
                            <td></td>
                            <td>{quarter ? mDict[1][quarter] : ''}</td>
                            <td>{quarter ? mDict[2][quarter] : ''}</td>
                            <td>{quarter ? mDict[3][quarter] : ''}</td>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>Individual Users (sum)</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>

                        <tr>
                            <td>Well Head Reading</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>

                        <tr>
                            <td>Backflush Reading</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>

                        <tr>
                            <td>Shrinkage (gallons)</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>

                        <tr>
                            <td>Shrinkage (percent)</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>

                        <br/>

                        <tr>
                            <td>Total Shrinkage</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>}
    </>);
};
