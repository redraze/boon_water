"use client";

import { useEffect, useState } from "react";
import Message from "../components/message/Message";
import { usePathname, useRouter } from "next/navigation";
import { getData, getReportingData } from "../lib/reportingFunctions";
import { quarterType, shrinkageObject, triple, waterUsageType, yearType } from "../lib/commonTypes";
import { backFlushId, wellHeadId } from "../lib/settings";
import Spinner from "../components/spinner/Spinner";
import Selections from "../components/Selections";
import DiffsTable from "../components/reporting/DiffsTable";
import TotalsTable from "../components/reporting/TotalsTable";

export default function Profile() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const pathname = usePathname(), router = useRouter();
  
    const [userData, setUserData] = useState<waterUsageType[] | undefined>(undefined);
    const [wellHeadData, setWellHeadData] = useState<waterUsageType | undefined>(undefined);
    const [backFlushData, setBackflushData] = useState<waterUsageType | undefined>(undefined);

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
                            setWellHeadData(user);
                        } else if (user._id == backFlushId) {
                            setBackflushData(user);
                        } else {
                            return user;
                        };
                    });
                });
            };
        });
        setLoading(false);
    }, []);

    const [quarter, setQuarter] = useState<quarterType>();
    const [year, setYear] = useState<yearType>();

    const [headDiffs, setHeadDiffs] = useState<triple<number>>([0, 0, 0]);
    const [homesDiffs, setHomesDiffs] = useState<triple<number>>([0, 0, 0]);
    const [flushDiffs, setFlushDiffs] = useState<triple<number>>([0, 0, 0]);

    const [shrinkages, setShrinkages] = useState<triple<shrinkageObject>>([{gallons: 0, percent: 0}, {gallons: 0, percent: 0}, {gallons: 0, percent: 0}]);
    const [shrinkageTotals, setShrinkageTotals] = useState<shrinkageObject>({gallons: 0, percent: 0});

    useEffect(() => {
        const retData = getReportingData(quarter, year, wellHeadData, userData, backFlushData);
        if (!retData) { return };
        setHeadDiffs(retData.headDiffsDraft);
        setHomesDiffs(retData.homesDiffsDraft);
        setFlushDiffs(retData.flushDiffsDraft);
        setShrinkages(retData.shrinkagesDraft);
        setShrinkageTotals({ 
            gallons: retData.totalShrinkageGals,
            percent: isNaN(retData.totalShrinkagePercent) ? 0 : retData.totalShrinkagePercent 
        });
    }, [year, quarter]);

    return (<>
        <Message text={ message } />
        { loading ? <Spinner /> : <>
            <div className="pt-16 pb-12 w-full min-h-screen">
                <div className="w-full p-6 flex">
                    <div className="m-auto">
                        <Selections setQuarter={setQuarter} setYear={setYear} />
                    </div>
                </div>

                { !year || !quarter || (year == 'prev' && quarter == 'Q1') ? <></> :
                    <div className="w-2/3 m-auto">

                        {/* monthly differences */}
                        <DiffsTable
                            quarter={quarter} 
                            headDiffs={headDiffs} 
                            homesDiffs={homesDiffs} 
                            flushDiffs={flushDiffs} 
                            shrinkages={shrinkages}
                        />

                        {/* quarterly totals */}
                        <TotalsTable shrinkageTotals={shrinkageTotals} />
                    </div>
                }
            </div>
        </>}
    </>);
};
