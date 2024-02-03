"use client";

import { quarterType, waterUsageType, yearType } from "../../lib/commonTypes";

type usageRowPropsType = {
    user: waterUsageType,
    year: yearType,
    quarter: quarterType
};

export default function UsageRow({ user, year, quarter }: usageRowPropsType) {
    return (<>
        <tr>
            <td>{ user.name }</td>
            <td>{ user.data[year][quarter][1] }</td>
            <td>{ user.data[year][quarter][2] }</td>
            <td>{ user.data[year][quarter][3] }</td>
        </tr>
    </>);
};
