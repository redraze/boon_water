"use client";

import { useEffect, useState } from "react";
import { quarterType, waterUsageType, yearType } from "../../lib/commonTypes";
import { calculateCharge } from "../../lib/billingFunctions";

type billsPropsType = {
    data: waterUsageType[],
    year: yearType,
    quarter: quarterType
};

export default function Bills({ data, year, quarter }: billsPropsType) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const [tabs, setTabs] = useState<JSX.Element[]>([]);
    const [charges, setCharges] = useState<{[id: string]: number}>({});
    const [active, setActive] = useState('');

    useEffect(() => {
        const tempTabs: JSX.Element[] = [];
        const tempCharges: {[id: string]: number} = {};

        data.map(entry => {
            tempTabs.push(
                <div
                    key={entry._id}
                    className={ entry._id == active ? 'tab_active' : 'tab_inactive' }
                    onClick={ () => setActive(entry._id) }
                >
                    {entry.name}
                </div>
            );
            tempCharges[entry._id] = calculateCharge(entry, year, quarter);
        });

        setTabs(tempTabs);
        setCharges(tempCharges);
        setActive(data[0]?._id);
    }, [data]);

    useEffect(() => {
        const tempCharges: {[id: string]: number} = {};
        data.map(entry => {
            tempCharges[entry._id] = calculateCharge(entry, year, quarter);
        });
        setCharges(tempCharges);
    }, [year, quarter]);

    return(<>
        { tabs }
        {
            data.map(entry => {
                return <div
                    key={entry._id}
                    style={ active == entry._id ? {display: 'flex'} : {display: 'none'} }
                >
                    <h1>{entry.name}</h1>
                    <h2>charges due: {formatter.format(charges[entry._id])}</h2>
                </div>
            })
        }
    </>);
};
