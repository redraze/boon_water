"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getData } from "../lib/dataFunctions";
import { quarterType, waterUsageType, yearType } from "../lib/commonTypes";
import Message from "../components/message/Message";

export default function DataEntry() {
    const router = useRouter();
    const pathname = usePathname();

    const [message, setMessage] = useState('');
    const [usageData, setUsageData] = useState<waterUsageType[] | undefined>(undefined);

    type usageUpdateType = {[id: string]: waterUsageType['data']};

    useEffect(() => {
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
                ret.data.map(user => { dataMap![user._id] = user.data });
                setUsageUpdate(dataMap);
            };
        })
    }, []);

    const [year, setYear] = useState<yearType>('cur');
    const [quarter, setQuarter] = useState<quarterType>('Q1');

    const monthsTable = {
        1: { Q1: 'January', Q2: 'April', Q3: 'July', Q4: 'October' },
        2: { Q1: 'February', Q2: 'May', Q3: 'August', Q4: 'November' },
        3: { Q1: 'March', Q2: 'June', Q3: 'September', Q4: 'December' }
    };
    
    const [usageUpdate, setUsageUpdate] = useState<usageUpdateType>({});
    const [r, reRender] = useState(false)

    const updateData = (id: string, month: 1 | 2 | 3, val: string) => {
        if (isNaN(Number(val))) { return };

        setUsageUpdate((draft = usageUpdate) => {
            draft[id][year][quarter][month] = Number(val)
            return draft
        });
        
        // force rerender
        reRender(!r)
    };

    const handleSubmit = () => {
        // TODO
        // check for changes in the data before making a backend api request
    };

    return (<>
        <Message text={ message } />
        
        <select onChange={ (e) => {
            if (
                e.currentTarget.value == 'Q1' 
                || e.currentTarget.value == 'Q2' 
                || e.currentTarget.value == 'Q3' 
                || e.currentTarget.value == 'Q4'
            ) {
                setQuarter(e.currentTarget.value);
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
            };
        }}>
            <option value='cur'>Current Year</option>
            <option value='prev'>Previous Year</option>
        </select>

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
    </>);
};
