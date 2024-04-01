"use client";

import { quarterType } from "../../lib/commonTypes";

export default function TableHead({ quarter }: { quarter: quarterType }) {
    const monthsTable = {
        1: { Q1: 'January', Q2: 'April', Q3: 'July', Q4: 'October' },
        2: { Q1: 'February', Q2: 'May', Q3: 'August', Q4: 'November' },
        3: { Q1: 'March', Q2: 'June', Q3: 'September', Q4: 'December' }
    };
    
    return (<>
        <thead className="bg-gray-500 text-white uppercase text-xl">
            <tr>
                <td></td>
                <td>{ monthsTable[1][quarter] }</td>
                <td>{ monthsTable[2][quarter] }</td>
                <td>{ monthsTable[3][quarter] }</td>
            </tr>
        </thead>
    </>);
};
