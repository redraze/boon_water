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
        <div className="fixed flex bottom-0 left-0 w-full bg-white border-t-4 border-sky-500 text-l">
        {/* TODO: make this div horizontally scrollable (using inline-block ?) */}
            {
                usage.map(entry => {
                    return (<div
                        key={entry._id}
                        onClick={ () => setActive(entry._id) }
                        className={ entry._id == active ? 
                            'hover:cursor-pointer bg-white text-sky-500 p-1 m-1 rounded-lg border-2 border-sky-500' :
                            'hover:cursor-pointer text-gray-200 bg-gray-400 p-1 m-1 rounded-lg border-2'
                        }
                    >
                        {entry.name}
                    </div>);
                })
            }
        </div>

        {/* selected user's statement */}
        <div ref={pdfRef} className="pb-10">
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
