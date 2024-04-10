"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getData, patchData } from "../lib/dataEntryFunctions";
import { quarterType, waterUsageType, yearType, patchDataType, mDict, voidFunc } from "../lib/commonTypes";
import Message from "../components/message/Message";
import Spinner from "../components/spinner/Spinner";
import { backFlushId, wellHeadId } from "../lib/settings";
import Selections from "../components/Selections";
import ReadingsRow from "../components/dataEntry/ReadingsRow";

export default function DataEntry() {
    const router = useRouter();
    const pathname = usePathname();

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // water users data and updates
    const [usageData, setUsageData] = useState<waterUsageType[] | undefined>(undefined);
    const [usageUpdate, setUsageUpdate] = useState<usageUpdateType>({});
    type usageUpdateType = {[id: string]: waterUsageType['data']};
    
    // well head data and update
    const [wellHeadUsage, setWellHeadUsage] = useState<waterUsageType | undefined>(undefined);
    const [wellHeadUsageUpdate, setWellHeadUsageUpdate] = useState<waterUsageType>();

    // backflush data and update
    const [backflushUsage, setBackflushUsage] = useState<waterUsageType | undefined>(undefined);
    const [backflushUsageUpdate, setBackflushUsageUpdate] = useState<waterUsageType | undefined>(undefined);

    const fetchData = () => {
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
                
                // just water users data
                let usageDataDraft: waterUsageType[] = [];
                let usageUpdateDraft: usageUpdateType = {};

                ret.data.map(user => { 
                    if (user._id == wellHeadId) {
                        setWellHeadUsage(user);
                        setWellHeadUsageUpdate(user);
                    } else if (user._id == backFlushId) {
                        setBackflushUsage(user);
                        setBackflushUsageUpdate(user);
                    } else {
                        usageUpdateDraft![user._id] = structuredClone(user.data);
                        usageDataDraft.push(user);
                    };
                });

                setUsageData(usageDataDraft);
                setUsageUpdate(usageUpdateDraft);
            };
        });
        setLoading(false);
    };
    useEffect(() => { fetchData() }, []);

    const [year, setYear] = useState<yearType | undefined>(undefined);
    const [quarter, setQuarter] = useState<quarterType | undefined>(undefined);

    // updates water users update data
    const updateUserUsage = (id: string, month: 1 | 2 | 3, val: string) => {
        if (isNaN(Number(val)) || !year || !quarter) { return };

        setUsageUpdate((draft = usageUpdate) => {
            draft[id][year][quarter][month] = Number(val)
            return structuredClone(draft)
        });
    };

    // updates well head and backflush data updates
    const updateOtherUsage = (
        month: 1 | 2 | 3, 
        val: string, 
        setUpdate: voidFunc<waterUsageType>, 
        prev: waterUsageType
    ) => {
        if (
            isNaN(Number(val)) 
            || !year
            || !quarter
            || wellHeadUsage == undefined
            || backflushUsage == undefined
        ) { 
            return;
        };

        setUpdate({
            ...prev!,
            data: {
                ...prev!.data,
                [year]: {
                    ...prev?.data[year],
                    [quarter]: {
                        ...prev?.data[year][quarter],
                        [month]: Number(val)
                    }
                    }
            }
        });
    };

    const resetUsage = () => {
        // reset water users usage update
        let usageUpdateDraft: usageUpdateType = {};
        usageData?.map(user => {
            usageUpdateDraft[user._id] = structuredClone(user.data)
        });
        setUsageUpdate(usageUpdateDraft);

        // reset well head and backflush updates
        setWellHeadUsageUpdate(wellHeadUsage);
        setBackflushUsageUpdate(backflushUsage);
    };

    const handleSubmit = () => {
        if (!usageUpdate) { 
            setMessage('no water usage data found.');
            return;
        };
        
        setLoading(true);

        const updates: patchDataType[] = [];

        // check for updates in water users' readings
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
 
        // check for updates in well head readings
        if (wellHeadUsage !== wellHeadUsageUpdate) {
            updates.push({
                id: wellHeadId,
                update: wellHeadUsageUpdate?.data!
            });
        };

        // check for updates in backflush readings
        if (backflushUsage !== backflushUsageUpdate) {
            updates.push({
                id: backFlushId,
                update: backflushUsageUpdate?.data!
            });
        };

        if (updates.length == 0) {
            setMessage('no changes to water usage data found.');
            setLoading(false);
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

        setLoading(false);
    };

    return (<>
        <Message text={ message } />
        { loading ? <Spinner /> : <>
            <div className="p-32 min-h-screen w-full">
                <div className="flex w-full justify-between mb-10">
                    <Selections
                        setQuarter={setQuarter}
                        setYear={setYear}
                        resetUsage={resetUsage}
                    />

                    <button
                        className={ !year || !quarter ?
                            "border-2 border-gray-400 p-2 bg-gray-200 rounded-lg text-l uppercase text-gray-400" :
                            "border-2 border-sky-500 p-2 bg-gray-200 rounded-lg text-l uppercase hover:bg-sky-500 hover:text-white"
                        }
                        onClick={ () => resetUsage() }
                        disabled={ !year || !quarter }
                    >
                        clear changes
                    </button>

                    <button 
                        className={ !year || !quarter ? 
                            "border-2 border-gray-400 p-2 bg-gray-200 text-gray-400 rounded-lg text-l uppercase" :
                            "bg-gray-200 border-2 border-sky-500 hover:bg-sky-500 hover:text-white rounded-lg p-2 text-l uppercase"
                        }
                        onClick={ () => handleSubmit() }
                        disabled={ !year || !quarter }
                    >
                        Submit changes { !year || !quarter ? <></> : 
                            <>for <b>{ quarter }, { year == 'cur' ? 'current year' : 'previous year'}</b></>
                        }
                    </button>
                </div>

                { !year || !quarter ? <></> : <>
                    <table className="w-full">
                        <thead className="bg-gray-500 text-white uppercase text-xl">
                            <tr>
                                <td></td>
                                <td>{ mDict[1][quarter] }</td>
                                <td>{ mDict[2][quarter] }</td>
                                <td>{ mDict[3][quarter] }</td>
                            </tr>
                        </thead>

                        <tbody>
                            {/* well head readings */}
                            { wellHeadUsageUpdate == undefined ? <></> : 
                                <ReadingsRow
                                    name={'well head'}
                                    className={"bg-gray-100"}
                                    updateState={{ 
                                        value: wellHeadUsageUpdate, 
                                        setValue: setWellHeadUsageUpdate
                                    }}
                                    updateFunc={updateOtherUsage}
                                    year={year}
                                    quarter={quarter}
                                />
                            }

                            {/* backflush readings */}
                            { backflushUsageUpdate == undefined ? <></> : 
                                <ReadingsRow
                                    name={'backflush'}
                                    className={"bg-gray-300"}
                                    updateState={{ 
                                        value: backflushUsageUpdate, 
                                        setValue: setBackflushUsageUpdate
                                    }}
                                    updateFunc={updateOtherUsage}
                                    year={year}
                                    quarter={quarter}
                                />
                            }

                            {/* water users readings */}
                            { usageData?.map((user, idx) => {
                                return(
                                    <tr
                                        className={ 
                                            idx % 2 ? 
                                                'bg-gray-300' :
                                                'bg-gray-100'
                                        }
                                        key={user._id}
                                    >
                                        <td className="text-xl">{ user.name }</td>
                                        { [1, 2, 3].map(month => {
                                            if (month !== 1 && month !== 2 && month !== 3) { return <></> };
                                            return (
                                                <td key={month}>
                                                    <input
                                                        className="p-1 my-2 rounded-lg"
                                                        onChange={(e) => {
                                                            updateUserUsage(
                                                                user._id, 
                                                                month, 
                                                                e.currentTarget.value
                                                            )
                                                        }}
                                                        value={usageUpdate[user._id][year][quarter][month]}
                                                    />
                                                </td>
                                            )
                                        }) }
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>}
            </div>
        </> }
    </>);
};
