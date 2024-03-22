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
            className={ active == id ? '' : '' }
        >
            <div>
                <h1>North Boon Water Co.</h1>
                <h4>1885 N. Boon Road</h4>
                <h4>Oak Harbor, WA 98277</h4>
            </div>

            <div>
                <div className="user info">
                    <p>{ info.name }</p>
                    <p>{ info.address }</p>
                    <p>{ info.email }</p>
                </div>

                <div className="statement date">
                    <b>Statement date:</b>
                    <p>{ date }</p>
                </div>
            </div>

            <div>
                <div>
                    <h3>Rates Schedule:</h3>
                    <p>base rate if &lt;{rates.baseRateThresh}: <b>{formatter.format(rates.ltThresh)}</b></p>
                    <p>base rate if &gt;{rates.baseRateThresh}: <b>{formatter.format(rates.gtThresh)}</b></p>
                    <p>first {rates.secondOverage - rates.firstOverage} over {rates.firstOverage} @ {formatter.format(rates.firstOverageRate * 100)} per 100 gallons</p>
                    <p>second {rates.thirdOverage - rates.secondOverage} over {rates.secondOverage} @ {formatter.format(rates.secondOverageRate * 100)} per 100 gallons</p>
                    <p>over {rates.thirdOverage} @ {formatter.format(rates.thirdOverageRate * 100)} per 100 gallons</p>
                </div>
                
                <div>
                    <p>Meter readings</p>
                    <p>beginning of quarter: {readings[0]}</p>
                    <p>end of first month: {readings[1]}</p>
                    <p>end of second month: {readings[2]}</p>
                    <p>end of third month: {readings[3]}</p>
                    <p><b>total gallons used:</b> {totalUsage}</p>
                </div>

                <div>
                    <p>base water charge: { formatter.format(baseCharge) }</p>
                    <p>overage charges: { formatter.format(overageCharge) }</p>
                    <p>total charges: { formatter.format(baseCharge + overageCharge) }</p>
                    <p>prev balance: { formatter.format(info.balance) }</p>
                    <p>new balance: { info.comp ? 
                        (info.balance < 0 ? formatter.format(info.balance) : formatter.format(0) ) :
                        formatter.format(info.balance + baseCharge + overageCharge)
                    }
                    { info.comp ? <b> (USER IS COMP&apos;D)</b> : <></> }</p>
                </div>
            </div>
        </div>
    );
};
