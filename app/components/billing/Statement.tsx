"use client";

import { calculateOverageCharge } from "../../lib/billingFunctions";
import { rates } from "../../lib/billingRates";
import { readingsDict, usersInfoDictType } from "../../lib/commonTypes";

type StatementPropsType = {
    id: string,
    active: string
    info: usersInfoDictType['id'],
    readings: readingsDict['id'], 
    date: string
};

export default function Statement({ id, active, info, readings, date }: StatementPropsType) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const totalUsage = readings[3] - readings[0];
    const baseCharge = totalUsage > rates.baseRateThresh ? rates.gtThresh : rates.ltThresh;
    const overageCharge = calculateOverageCharge(totalUsage);

    return (
        <div
            style={ active == id ? {} : {display: 'none'} }
            className="w-5/6 mx-auto my-10 px-10 py-12 border-2 border-black"
        >
            <div className="w-fit m-auto text-2xl font-bold pb-10">
                <p>North Boon Water Co.</p>
                <p>1885 N. Boon Road</p>
                <p>Oak Harbor, WA 98277</p>
            </div>

            <div className="w-full flex justify-between px-32 pb-16 text-xl">
                <div className="w-fit">
                    <p className="w-fit m-auto">{ info.name }</p>
                    <p className="w-fit m-auto">{ info.address }</p>
                    <p className="w-fit m-auto">{ info.email }</p>
                </div>

                <div className="w-fit">
                    <b className="w-fit m-auto">Statement date:</b>
                    <p className="w-fit m-auto">{ date }</p>
                </div>
            </div>

            <div className="w-full flex justify-between pb-10">
                <table className="border-4 border-black">
                    <thead className="border-black border-2">
                        <tr><td className="text-right font-bold uppercase">Rates Schedule</td></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-2">
                                base rate if &lt;{rates.baseRateThresh}: 
                            </td>
                            <td className="px-2">
                                <span className="font-bold">{formatter.format(rates.ltThresh)}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="px-2">
                                base rate if &gt;{rates.baseRateThresh}:
                            </td>
                            <td className="px-2">
                                <span className="font-bold">{formatter.format(rates.gtThresh)}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="px-2">
                                first {rates.secondOverage - rates.firstOverage} over {rates.firstOverage}
                            </td>
                            <td className="px-2">
                                {formatter.format(rates.firstOverageRate * 100)} per 100 gallons
                            </td>
                        </tr>
                        <tr>
                            <td className="px-2">
                                second {rates.thirdOverage - rates.secondOverage} over {rates.secondOverage}
                            </td>
                            <td className="px-2">
                                {formatter.format(rates.secondOverageRate * 100)} per 100 gallons
                            </td>
                        </tr>
                        <tr>
                            <td className="px-2">
                                over {rates.thirdOverage}
                            </td>
                            <td className="px-2">
                                {formatter.format(rates.thirdOverageRate * 100)} per 100 gallons
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <table className="border-4 border-black">
                    <thead className="border-black border-2">
                        <tr><td className="text-right font-bold uppercase">Meter readings</td></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-2">
                                beginning of quarter:
                            </td>
                            <td className="px-2">
                                {readings[0]}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-2">
                                end of first month:
                            </td>
                            <td className="px-2">
                                {readings[1]}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-2">
                                end of second month:
                            </td>
                            <td className="px-2">
                                {readings[2]}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-2">
                                end of third month:
                            </td>
                            <td className="px-2">
                                {readings[3]}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-2">
                                <span className="font-bold">total gallons used:</span>
                            </td>
                            <td className="px-2">
                                {totalUsage}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div>
                    <table className="border-4 border-black">
                        <thead className="border-black border-2">
                            <tr className="text-right font-bold uppercase">
                                <td>Charges</td>
                            </tr>
                        </thead>
                        <tbody className="border-black border-2">
                            <tr>
                                <td className="px-2">
                                    base water charge:
                                </td>
                                <td className="px-2">
                                    { formatter.format(baseCharge) }
                                </td>
                            </tr>
                            <tr>
                                <td className="px-2">
                                    overage charges:
                                </td>
                                <td className="px-2">
                                    { formatter.format(overageCharge) }
                                </td>
                            </tr>
                            <tr>
                                <td className="px-2">
                                    total charges:
                                </td>
                                <td className="px-2">
                                    { formatter.format(baseCharge + overageCharge) }
                                </td>
                            </tr>
                            <tr>
                                <td className="px-2">
                                    prev balance:
                                </td>
                                <td className="px-2">
                                    { formatter.format(info.balance) }
                                </td>
                            </tr>
                            <tr className="border-t-2 border-black">
                                <td className="font-bold p-2">
                                    <span>{
                                        (info.balance + baseCharge + overageCharge) >= 0 ? 
                                            <>BALANCE DUE:</> :
                                            <>CREDIT REM:</>
                                    }</span>
                                </td>
                                <td className="font-bold px-2">
                                    { info.comp ? 
                                        (info.balance < 0 ? formatter.format(info.balance) : formatter.format(0) ) :
                                        formatter.format(info.balance + baseCharge + overageCharge)
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="font-bold text-center uppercase flex flex-col">
                        <span>{ 
                            info.balance + baseCharge + overageCharge > 0 && !info.comp ? 
                                <>please pay this amount</> : 
                                <>no payment needed</> 
                        }</span>
                        { info.comp ? <span>(user is comp&apos;d)</span> : <></>}
                    </div>
                </div>
            </div>
        </div>
    );
};
