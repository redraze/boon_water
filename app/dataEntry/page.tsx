"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getData, patchData } from "../lib/dataFunctions";
import { quarterType, waterUsageType, yearType, patchDataType } from "../lib/commonTypes";
import Message from "../components/message/Message";
import Spinner from "../components/spinner/Spinner";

export default function DataEntry() {
    const router = useRouter();
    const pathname = usePathname();

    const [message, setMessage] = useState('');
    const [usageData, setUsageData] = useState<waterUsageType[] | undefined>(undefined);

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

    const monthsTable = {
        1: { Q1: 'January', Q2: 'April', Q3: 'July', Q4: 'October' },
        2: { Q1: 'February', Q2: 'May', Q3: 'August', Q4: 'November' },
        3: { Q1: 'March', Q2: 'June', Q3: 'September', Q4: 'December' }
    };
    
    const [usageUpdate, setUsageUpdate] = useState<usageUpdateType>({});

    const updateData = (id: string, month: 1 | 2 | 3, val: string) => {
        if (isNaN(Number(val))) { return };

        setUsageUpdate((draft = usageUpdate) => {
            draft[id][year][quarter][month] = Number(val)
            return structuredClone(draft)
        });
    };

    const resetData = () => {
        let dataMap: usageUpdateType = {};
        usageData?.map(user => { dataMap![user._id] = structuredClone(user.data) });
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
        {
            updating ? <Spinner /> : <>
                <select onChange={ (e) => {
                    if (
                        e.currentTarget.value == 'Q1' 
                        || e.currentTarget.value == 'Q2' 
                        || e.currentTarget.value == 'Q3' 
                        || e.currentTarget.value == 'Q4'
                    ) {
                        setQuarter(e.currentTarget.value);
                        resetData();
                    };
                }}>
                    <option>Q1</option>
                    <option>Q2</option>
                    <option>Q3</option>
                    <option>Q4</option>
                </select>

                <select onChange={ (e) => {
                    if (
                        e.currentTarget.value == 'cur' 
                        || e.currentTarget.value == 'prev'
                    ) {
                        setYear(e.currentTarget.value);
                        resetData();
                    };
                }}>
                    <option value='cur'>Current Year</option>
                    <option value='prev'>Previous Year</option>
                </select>

                <button onClick={ () => resetData() }>
                    Clear changes.
                </button>

                <button onClick={ () => handleSubmit() }>
                    Submit changes for { quarter }, { year == 'cur' ? 'current year' : 'previous year'}.
                </button>

                <table>
                    <thead>
                        <tr>
                            <td></td>
                            <td>{ monthsTable[1][quarter] }</td>
                            <td>{ monthsTable[2][quarter] }</td>
                            <td>{ monthsTable[3][quarter] }</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            usageData?.map(user => {
                                return(
                                    <tr key={user._id}>
                                        <td>{ user.name }</td>
                                        <td><input
                                            onChange={(e) => updateData(user._id, 1, e.currentTarget.value)}
                                            value={usageUpdate[user._id][year][quarter][1]}
                                        /></td>
                                        <td><input
                                            onChange={(e) => updateData(user._id, 2, e.currentTarget.value)}
                                            value={usageUpdate[user._id][year][quarter][2]}
                                        /></td>
                                        <td><input
                                            onChange={(e) => updateData(user._id, 3, e.currentTarget.value)}
                                            value={usageUpdate[user._id][year][quarter][3]}
                                        /></td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
        </>}
    </>);
};
