"use client";

import { waterUsageType } from "../../lib/commonTypes";

type billsPropsType = {
    data: waterUsageType[],
    year: 'cur' | 'prev',
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
};

export default function Bills({ data, year, quarter }: billsPropsType) {
    return(<>
        {
            // TODO
            // data.map(entry => {
            //     ...
            // })
        }
    </>);
};
