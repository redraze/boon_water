"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getData } from "../lib/dataFunctions";
import { quarterType, waterUsageType, yearType } from "../lib/commonTypes";
import Message from "../components/message/Message";
import UsageRow from "../components/dataEntry/usageRow";

export default function DataEntry() {
    const router = useRouter();
    const pathname = usePathname();

    const [message, setMessage] = useState('');
    const [usageData, setUsageData] = useState<waterUsageType[] | undefined>(undefined);

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
                };
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
    
    const [editBy, setEditBy] = useState('month');
    const [selection, setSelection] = useState<string | undefined>();

    const handleSubmit = () => {
        // TODO
    };

    return (<>
        <Message text={ message } />
        
        <select onChange={ (e) => {
            setEditBy(e.currentTarget.value);
            setSelection(undefined);
        }}>
            <option value='month' >Edit by month</option>
            <option value='user' >Edit by user</option>
        </select>

        <select onChange={ (e) => {
            if (
                e.currentTarget.value == 'Q1' 
                || e.currentTarget.value == 'Q2' 
                || e.currentTarget.value == 'Q3' 
                || e.currentTarget.value == 'Q4'
            ) {
                setQuarter(e.currentTarget.value);
                setSelection(undefined);
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
                setSelection(undefined);
            };
        }}>
            <option value='cur'>Current Year</option>
            <option value='prev'>Previous Year</option>
        </select>

        <table>
            <thead>
                <tr>
                    <td></td>
                    <td>{ monthsTable[1][quarter] }</td>
                    <td>{ monthsTable[2][quarter] }</td>
                    <td>{ monthsTable[3][quarter] }</td>
                    <td></td>
                    <td></td>
                </tr>
            </thead>
            <tbody>
                {
                    usageData?.map(user => {
                        return(
                            <UsageRow
                                key={user._id}
                                user={user}
                                year={year}
                                quarter={quarter}
                                editBy={editBy}
                                selectionState={{value: selection, setValue: setSelection}}
                            />
                        );
                    })
                }
                <tr style={editBy == 'month' ? {display: ''} : {display: 'none'} }>
                    <td></td>
                    {
                        ['M1', 'M2', 'M3'].map(m => {
                            return selection == m ?
                                <td><button onClick={() => setSelection(undefined)}>[cancel]</button></td> :
                                <td><button onClick={() => setSelection(m)}>[edit]</button></td>
                        })
                    }
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    {
                        ['M1', 'M2', 'M3'].map(m => {
                            return selection == m ?
                                <td><button onClick={() => handleSubmit()}>[submit]</button></td> :
                                <td></td>
                        })
                    }
                    <td></td>
                </tr>
            </tbody>
        </table>
    </>);
};
