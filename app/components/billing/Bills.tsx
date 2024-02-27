"use client";

import { useEffect, useRef, useState } from "react";
import type {
    quarterType,
    readingsDict,
    usersInfoDictType,
    waterUsageType,
    yearType
} from "../../lib/commonTypes";
import { getReadings } from "../../lib/billingFunctions";
import UserActions from "./UserActions";
import Statement from "./Statement";

type billsPropsType = {
    users: usersInfoDictType,
    usage: waterUsageType[],
    year: yearType,
    quarter: quarterType
};

export default function Bills({ users, usage, year, quarter }: billsPropsType) {
    const [tabs, setTabs] = useState<JSX.Element[]>([]);
    const [statementInfo, setStatementInfo] = useState<readingsDict>({});
    const [active, setActive] = useState('');

    useEffect(() => {
        const tempTabs: JSX.Element[] = [];
        const tempStatementInfo: readingsDict = {};

        usage.map(entry => {
            tempTabs.push(
                <div
                    key={entry._id}
                    className={ entry._id == active ? 'tab_active' : 'tab_inactive' }
                    onClick={ () => setActive(entry._id) }
                >
                    {entry.name}
                </div>
            );

            const readings = getReadings(entry, year, quarter);
            tempStatementInfo[entry._id] = readings;
        });

        setTabs(tempTabs);
        setStatementInfo(tempStatementInfo);
        setActive(usage[0]?._id);
    }, [usage]);

    useEffect(() => {
        const tempStatementInfo: readingsDict = {};
        usage.map(entry => {
            const readings = getReadings(entry, year, quarter);
            tempStatementInfo[entry._id] = readings;
        });
        setStatementInfo(tempStatementInfo);
    }, [year, quarter]);

    const date = new Date();
    const formattedDate = [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/');
    
    const pdfRef = useRef(null);

    return(<>
        { tabs }
        <div ref={pdfRef}>
            {
                Object.entries(statementInfo).map(([id, readings]) => {
                    return (
                        <Statement
                            key={id}
                            id={id}
                            info={users[id]}
                            readings={readings}
                            date={formattedDate}
                            active={active}
                        />
                    );
                })
            }
        </div>
        <UserActions quarter={quarter} pdfRef={pdfRef} />
    </>);
};
