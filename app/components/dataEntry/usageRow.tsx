"use client";

import { useEffect, useState } from "react";
import { quarterType, stateType, waterUsageType, yearType } from "../../lib/commonTypes";

type usageRowPropsType = {
    user: waterUsageType,
    year: yearType,
    quarter: quarterType
    editBy: string
    selectionState: stateType<string | undefined>
};

export default function UsageRow({ user, year, quarter, editBy, selectionState }: usageRowPropsType) {
    const {value: selection, setValue: setSelection} = selectionState;

    const [q1, setQ1] = useState(user.data[year][quarter][1]);
    const [q2, setQ2] = useState(user.data[year][quarter][2]);
    const [q3, setQ3] = useState(user.data[year][quarter][3]);

    const resetData = () => {
        setQ1(user.data[year][quarter][1]);
        setQ2(user.data[year][quarter][2]);
        setQ3(user.data[year][quarter][3]);
    };
    useEffect(() => { resetData() }, [selection]);

    const handleSubmit = () => {
        // TODO
        // make a fetch request to backend api
        // on success, update usageData
    };

    return (<>
        <tr>
            <td>{ user.name }</td>
            {
                selection == user._id ? 
                    <>
                        <td><input onChange={(e) => setQ1(Number(e.currentTarget.value) ? Number(e.currentTarget.value) : 0)} value={q1} /></td>
                        <td><input onChange={(e) => setQ2(Number(e.currentTarget.value) ? Number(e.currentTarget.value) : 0)} value={q2} /></td>
                        <td><input onChange={(e) => setQ3(Number(e.currentTarget.value) ? Number(e.currentTarget.value) : 0)} value={q3} /></td>
                    </> :
                    <>
                        <td>{ user.data[year][quarter][1] }</td>
                        <td>{ user.data[year][quarter][2] }</td>
                        <td>{ user.data[year][quarter][3] }</td>
                    </>
            }
            {
                editBy == 'user' ?
                    selection == user._id ?
                        <>
                            <td><button onClick={() => setSelection(undefined)}>[cancel]</button></td>
                            <td><button onClick={() => handleSubmit()}>[submit]</button></td>
                        </> :
                        <td><button onClick={() => setSelection(user._id)}>[edit]</button></td>
                    : <></>
            }
        </tr>
    </>);
};
