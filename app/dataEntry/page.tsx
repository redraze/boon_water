"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getData, patchData } from "../lib/dataEntryFunctions";
import { 
    quarterType, 
    waterUsageType, 
    yearType, 
    patchDataType, 
    mDict
} from "../lib/commonTypes";
import Message from "../components/message/Message";
import Spinner from "../components/spinner/Spinner";
import { backFlushId, wellHeadId } from "../lib/settings";
import Selections from "../components/Selections";
import UserActions from "../components/dataEntry/UserActions";
import OtherReadingsRow from "../components/dataEntry/OtherReadingsRow";
import HomesReadingsRows from "../components/dataEntry/HomesReadingsRow";

export type dataDictType = { [id: string]: { name: string, data: waterUsageType['data'] } };

export default function DataEntry() {
    const router = useRouter();
    const pathname = usePathname();

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // homes data
    const [homesData, setHomesData] = useState<dataDictType>({});
    const [homesDataUpdate, setHomesDataUpdate] = useState<dataDictType>({});
    
    // well head data
    const [wellHeadData, setWellHeadData] = useState<waterUsageType>();
    const [wellHeadDataUpdate, setWellHeadDataUpdate] = useState<waterUsageType>();

    // backflush data
    const [backflushData, setBackflushData] = useState<waterUsageType>();
    const [backflushDataUpdate, setBackflushDataUpdate] = useState<waterUsageType>();

    useEffect(() => {
        // prevent data refetching from hot reloads in non-prod env
        if (process.env.NODE_ENV !== 'development' && homesData.length) { return };

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
              
                const homesDataDraft: dataDictType = {};
                ret.data.map(user => {
                    if (user._id == wellHeadId) {
                        setWellHeadData(user);
                        setWellHeadDataUpdate(user);
                    } else if (user._id == backFlushId) {
                        setBackflushData(user);
                        setBackflushDataUpdate(user);
                    } else {
                        homesDataDraft[user._id] = {
                            name: user.name,
                            data: user.data
                        };
                    };
                });
                setHomesData(homesDataDraft);
                setHomesDataUpdate(homesDataDraft);
            };
        });
        setLoading(false);
    }, []);
    

    const [year, setYear] = useState<yearType | undefined>(undefined);
    const [quarter, setQuarter] = useState<quarterType | undefined>(undefined);

    const resetUsage = () => {
        setHomesDataUpdate(homesData);
        setWellHeadDataUpdate(wellHeadData);
        setBackflushDataUpdate(backflushData);
    };

    const handleSubmit = () => {
        setLoading(true);

        const updates: patchDataType[] = [];

        // check for updates in homes readings
        Object.entries(homesDataUpdate).map(([id, update]) => {
            if (update !== homesData[id]) {
                updates.push({ id, update: update.data })
            };
        });

        // check for updates in well head readings
        if (wellHeadDataUpdate && wellHeadDataUpdate !== wellHeadData) {
            updates.push({
                id: wellHeadId,
                update: wellHeadDataUpdate.data
            });
        };

        // check for updates in backflush readings
        if (backflushDataUpdate && backflushDataUpdate !== backflushData) {
            updates.push({
                id: backFlushId,
                update: backflushDataUpdate.data
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

                // update cache
                setHomesData(homesDataUpdate);
                setWellHeadData(wellHeadDataUpdate);
                setBackflushData(backflushDataUpdate);                
            };
        });

        setLoading(false);
    };

    return (<>
        <Message messageState={{ value: message, setValue: setMessage }} />
        { loading ? <Spinner /> : <>
            <div className="p-32 min-h-screen w-full">

                <div className="flex w-full justify-between mb-10">
                    <Selections
                        setQuarter={setQuarter}
                        setYear={setYear}
                        resetUsage={resetUsage}
                    />
                    <UserActions 
                        year={year} 
                        quarter={quarter} 
                        resetUsage={resetUsage} 
                        handleSubmit={handleSubmit} 
                    />
                </div>

                { !year || !quarter ? <></> : <>
                    <table className="w-full" id="dataTable">
                        <thead className="bg-gray-500 text-white uppercase text-2xl font-bold">
                            <tr>
                                <td></td>
                                <td className="p-2">{ mDict[1][quarter] }</td>
                                <td className="p-2">{ mDict[2][quarter] }</td>
                                <td className="p-2">{ mDict[3][quarter] }</td>
                            </tr>
                        </thead>

                        <tbody>

                            {/* water users readings */}
                            {
                                !Object.keys(homesData).length ? <></> : <>
                                    <HomesReadingsRows 
                                        year={year}
                                        quarter={quarter}
                                        state={{
                                            value: homesDataUpdate, 
                                            setValue: setHomesDataUpdate 
                                        }}
                                        setMessage={setMessage}
                                    />
                                </>
                            }

                            <tr className="bg-gray-500 border-b-8 border-gray-500"></tr>

                            {/* well head and backflush readings */}
                            <OtherReadingsRow
                                quarter={quarter}
                                year={year}
                                states={[
                                    { value: wellHeadDataUpdate, setValue: setWellHeadDataUpdate }, 
                                    { value: backflushDataUpdate, setValue: setBackflushDataUpdate }
                                ]}
                                setMessage={setMessage}
                            />

                        </tbody>
                    </table>
                </>}
            </div>
        </> }
    </>);
};
