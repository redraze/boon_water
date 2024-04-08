"use client";

import { useEffect, useRef, useState } from "react";
import type {
    quarterType,
    readingsDict,
    usersInfoDictType,
    voidFunc,
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
    setMessage: voidFunc<string>
};

export default function Bills({ users, usage, year, quarter, setMessage }: billsPropsType) {
    const [statementInfo, setStatementInfo] = useState<readingsDict>({});
    const [active, setActive] = useState('');

    useEffect(() => {
        setStatementInfo((draft: readingsDict = {}) => {
            usage.map(entry => {
                draft[entry._id] = getReadings(entry, year, quarter)
            });
            return draft;
        });
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
        <UserActions 
            quarter={quarter}
            pdfRef={pdfRef}
            statementInfo={statementInfo}
            users={users}
            setMessage={setMessage}
            usage={usage}
        />

        {/* username tabs */}
        <div className="w-full flex border-b-2 border-t-2 border-gray-500 my-4">
            {
                usage.map(entry => {
                    return (<div
                        key={entry._id}
                        onClick={ () => setActive(entry._id) }
                        className={ entry._id == active ? 
                            'bg-white text-sky-500 p-1 m-1 rounded-lg border-2 border-sky-500' :
                            'text-gray-200 bg-gray-400 p-1 m-1 rounded-lg border-2'
                        }
                    >
                        {entry.name}
                    </div>);
                })
            }
        </div>

        {/* selected user's statement */}
        <div ref={pdfRef} className="pb-32">
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
    </>);
};
