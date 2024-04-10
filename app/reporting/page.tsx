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

    const shrinkageTotals = () => {
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
                <div className="w-full p-6 flex">
                    <div className="m-auto">
                        <Selections setQuarter={setQuarter} setYear={setYear} />
                    </div>
                </div>

                { !year || !quarter ? <></> :
                    <div className="w-2/3 m-auto">
                        <table className="w-full border-4 border-gray-500 text-xl">
                            <thead className="bg-gray-500 text-white uppercase text-2xl">
                                <tr>
                                    <td></td>
                                    {
                                        [1, 2, 3].map(num => {
                                            if (num !== 1 && num !== 2 && num !== 3) { return };
                                            return(
                                                <td key={num} className="p-2">
                                                    { mDict[num][quarter] }
                                                </td>
                                            );
                                        })
                                    }
                                </tr>
                            </thead>

                            <tbody>
                                <tr className='bg-gray-100'>
                                    <td className="p-2">Well Head</td>
                                    {
                                        [1, 2, 3].map(month => {
                                            if (month !== 1 && month !== 2 && month !== 3) { return };
                                            return(
                                                <td key={month} className="p-2">
                                                    { wellHeadData?.data[year][quarter][month] }
                                                </td>
                                            );
                                        })
                                    }
                                </tr>

                                <tr className='bg-gray-300'>
                                    <td className="p-2">Homes</td>
                                    {
                                        [0, 1, 2].map(idx => {
                                            if (idx !== 0 && idx !== 1 && idx !== 2) { return };
                                            return(
                                                <td key={idx} className="p-2">
                                                    { homeSums[idx] }
                                                </td>
                                            );
                                        })
                                    }
                                </tr>

                                <tr className='bg-gray-100'>
                                    <td className="p-2">Backflush</td>
                                    {
                                        [1, 2, 3].map(month => {
                                            if (month !== 1 && month !== 2 && month !== 3) { return };
                                            return(
                                                <td key={month} className="p-2">
                                                    { backFlushData?.data[year][quarter][month] }
                                                </td>
                                            );
                                        })
                                    }
                                </tr>

                                {/* shrinkage in gallons */}
                                <tr className='bg-gray-300 border-t-8 border-gray-500'>
                                    <td className="p-2">Shrinkage</td>
                                    {
                                        shrinkageGals.map((gals, idx) => {
                                            return (
                                                <td 
                                                    key={idx}
                                                    className={ (gals && gals < 0) ? 
                                                        "p-2 text-red-600 font-bold bg-yellow-500" : 
                                                        "p-2"
                                                    }
                                                >
                                                    { gals ? gals + ' gallons' : 0 }
                                                </td>
                                            )
                                        })
                                    }
                                </tr>

                                {/* percent shrinkage */}
                                <tr className='bg-gray-300'>
                                    <td></td>
                                    {
                                        shrinkageGals.map((shrinkageGals, index) => {
                                            // narrow index type
                                            const idx = index + 1;
                                            if (idx !== 1 && idx !== 2 && idx !== 3) { return };

                                            const wellHeadGals = wellHeadData?.data[year][quarter][idx];

                                            if (!shrinkageGals || !wellHeadGals) {
                                                return(<td key={idx} className="p-2">0%</td>);
                                            };

                                            const shrinkagePercent = shrinkageGals / wellHeadGals * 100;
                                            return(
                                                <td 
                                                    key={idx}
                                                    className={
                                                        shrinkagePercent < 0 ? 
                                                            "p-2 text-red-600 font-bold bg-yellow-500" :
                                                            "p-2"
                                                    }
                                                >
                                                    { shrinkagePercent.toFixed(2) + '%' }
                                                </td>
                                            );
                                        })
                                    }
                                </tr>

                                <tr className='bg-gray-100 border-t-8 border-gray-500 font-bold'>
                                    <td className="p-2">Total Shrinkage</td>
                                    <td></td>
                                    { shrinkageTotals() }
                                </tr>
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </>}
    </>);
};
