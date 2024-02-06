"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getData, patchData } from "../lib/dataEntryFunctions";
import { quarterType, waterUsageType, yearType, patchDataType } from "../lib/commonTypes";
import Message from "../components/message/Message";
import Spinner from "../components/spinner/Spinner";
import Selections from "../components/dataEntry/Selections";
import TableHead from "../components/dataEntry/TableHead";

export default function DataEntry() {
    const router = useRouter();
    const pathname = usePathname();

    const [message, setMessage] = useState('');
    const [usageData, setUsageData] = useState<waterUsageType[] | undefined>(undefined);

    const [usageUpdate, setUsageUpdate] = useState<usageUpdateType>({});
    type usageUpdateType = {[id: string]: waterUsageType['data']};

    const fetchData = () => {
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
                setUsageData(ret.data);
                if (!ret.data) {
                    setMessage('No water usage data available.');
                    return;
                };
                
                let dataMap: usageUpdateType = {};
                ret.data.map(user => { dataMap![user._id] = structuredClone(user.data) });
                setUsageUpdate(dataMap);
            };
        })
    };
    useEffect(() => { fetchData() }, []);

    const [year, setYear] = useState<yearType>('cur');
    const [quarter, setQuarter] = useState<quarterType>('Q1');

    const updateUsage = (id: string, month: 1 | 2 | 3, val: string) => {
        if (isNaN(Number(val))) { return };

        setUsageUpdate((draft = usageUpdate) => {
            draft[id][year][quarter][month] = Number(val)
            return structuredClone(draft)
        });
    };

    const resetUsage = () => {
        let dataMap: usageUpdateType = {};
        usageData?.map(user => { dataMap[user._id] = structuredClone(user.data) });
        setUsageUpdate(dataMap);
    };

    const [updating, setUpdating] = useState(false);
    const handleSubmit = () => {
        if (!usageUpdate) { 
            setMessage('no water usage data found.');
            return;
        };
        
        setUpdating(true);

        const updates: patchDataType[] = [];
        usageData?.map(user => {
            const before = JSON.stringify(user.data);
            const after = JSON.stringify(usageUpdate[user._id]);

            if (before !== after) {
                updates.push({
                    id: user._id,
                    update: usageUpdate[user._id]
                });
            };
        });
 
        if (updates.length == 0) {
            setMessage('no changes to water usage data found.');
            setUpdating(false);
            return;
        };

        patchData(pathname, updates).then((ret) => {
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
                if (ret.success) { setMessage('Water data updated successfully.') }
                else { setMessage('Failed to complete water data update. Please review the quarterly data before attempting another update.') };
                fetchData();
            };
        });

        setUpdating(false);
    };

    return (<>
        <Message text={ message } />
        { updating ? <Spinner /> : <>
            <Selections 
                setQuarter={setQuarter}
                setYear={setYear}
                resetUsage={resetUsage}
            />

            <button onClick={ () => resetUsage() }>
                Clear changes.
            </button>

            <button onClick={ () => handleSubmit() }>
                Submit changes for { quarter }, { year == 'cur' ? 'current year' : 'previous year'}.
            </button>

            <table>
                <TableHead quarter={quarter} />
                <tbody>
                    {
                        usageData?.map(user => {
                            return(
                                <tr key={user._id}>
                                    <td>{ user.name }</td>
                                    <td><input
                                        onChange={(e) => updateUsage(user._id, 1, e.currentTarget.value)}
                                        value={usageUpdate[user._id][year][quarter][1]}
                                    /></td>
                                    <td><input
                                        onChange={(e) => updateUsage(user._id, 2, e.currentTarget.value)}
                                        value={usageUpdate[user._id][year][quarter][2]}
                                    /></td>
                                    <td><input
                                        onChange={(e) => updateUsage(user._id, 3, e.currentTarget.value)}
                                        value={usageUpdate[user._id][year][quarter][3]}
                                    /></td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </> }
    </>);
};
