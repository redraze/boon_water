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

    const [quarter, setQuarter] = useState<quarterType | undefined>(undefined);
    const [year, setYear] = useState<yearType | undefined>(undefined);

    type numThruple = [number, number, number];
    const [homeSums, setHomeSums] = useState<numThruple>([0, 0, 0]);

    const [shrinkageGals, setShrinkageGals] = useState<numThruple>([0, 0, 0]);

    useEffect(() => {
        if (!year || !quarter) { return };

        let homeSumsDraft: numThruple = [0, 0, 0];
        userData?.map(user => {
            homeSumsDraft[0] += user.data[year!][quarter!][1];
            homeSumsDraft[1] += user.data[year!][quarter!][2];
            homeSumsDraft[2] += user.data[year!][quarter!][3];
        });
        setHomeSums(homeSumsDraft);

        setShrinkageGals([
            wellHeadData?.data[year][quarter][1]! - (homeSumsDraft[0] + backFlushData?.data[year][quarter][1]!),
            wellHeadData?.data[year][quarter][2]! - (homeSumsDraft[1] + backFlushData?.data[year][quarter][2]!),
            wellHeadData?.data[year][quarter][3]! - (homeSumsDraft[2] + backFlushData?.data[year][quarter][3]!)
        ]);
    }, [year, quarter]);

    const getShrinkagePercentages = () => {
        if (!year || !quarter) { return };

        const shrinkagePercents: numThruple = [0, 0, 0];
        shrinkagePercents[0] = shrinkageGals[0] / wellHeadData?.data[year][quarter][1]! * 100;
        shrinkagePercents[1] = shrinkageGals[1] / wellHeadData?.data[year][quarter][2]! * 100;
        shrinkagePercents[2] = shrinkageGals[2] / wellHeadData?.data[year][quarter][3]! * 100;

        return(<>
            <td>{ isNaN(shrinkagePercents[0]) ? <>0%</> : shrinkagePercents[0].toFixed(2) + '%' }</td>
            <td>{ isNaN(shrinkagePercents[1]) ? <>0%</> : shrinkagePercents[1].toFixed(2) + '%' }</td>
            <td>{ isNaN(shrinkagePercents[2]) ? <>0%</> : shrinkagePercents[2].toFixed(2) + '%' }</td>
        </>);
    };

    const getShrinkageTotals = () => {
        if (!year || !quarter) { return };
            
        const totalShrinkageGallons = shrinkageGals.reduce((prev, cur) => prev + cur);

        const totalWellheadGallons = 
            wellHeadData?.data[year][quarter][1]! 
            + wellHeadData?.data[year][quarter][2]! 
            + wellHeadData?.data[year][quarter][3]!;

        const totalShrinkagePercent = totalShrinkageGallons / totalWellheadGallons * 100;

        return(<>
            <td>{ totalShrinkageGallons + 'gal' }</td>
            <td>{ isNaN(totalShrinkagePercent) ? '0%' : totalShrinkagePercent.toFixed(2) + '%' }</td>
        </>);
    };

    return (<>
        <Message text={ message } />
        { loading ? <Spinner /> : <>
            <div className="pt-20 w-full h-screen">
                <div className="w-full m-auto">
                    <Selections setQuarter={setQuarter} setYear={setYear} />
                </div>

                {
                    !year || !quarter ? <></> :
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    <td>{ mDict[1][quarter] }</td>
                                    <td>{ mDict[2][quarter] }</td>
                                    <td>{ mDict[3][quarter] }</td>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>Well Head</td>
                                    <td>{ wellHeadData?.data[year][quarter][1] }</td>
                                    <td>{ wellHeadData?.data[year][quarter][2] }</td>
                                    <td>{ wellHeadData?.data[year][quarter][3] }</td>
                                </tr>

                                <tr>
                                    <td>Homes</td>
                                    <td>{ homeSums[0] }</td>
                                    <td>{ homeSums[1] }</td>
                                    <td>{ homeSums[2] }</td>
                                </tr>

                                <tr>
                                    <td>Backflush</td>
                                    <td>{ backFlushData?.data[year][quarter][1] }</td>
                                    <td>{ backFlushData?.data[year][quarter][2] }</td>
                                    <td>{ backFlushData?.data[year][quarter][3] }</td>
                                </tr>

                                {/* shrinkage in gallons */}
                                <tr>
                                    <td>Shrinkage</td>
                                    <td>{ shrinkageGals[0] ? shrinkageGals[0] : 0 }</td>
                                    <td>{ shrinkageGals[1] ? shrinkageGals[1] : 0 }</td>
                                    <td>{ shrinkageGals[2] ? shrinkageGals[2] : 0 }</td>
                                </tr>

                                {/* percent shrinkage */}
                                <tr>
                                    <td></td>
                                    { getShrinkagePercentages() }
                                </tr>

                                <tr>
                                    <td>Total Shrinkage</td>
                                    <td></td>
                                    { getShrinkageTotals() }
                                </tr>
                            </tbody>
                        </table>
                    }
            </div>
        </>}
    </>);
};
