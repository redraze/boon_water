"use client";

import { quarterType, voidFunc, yearType } from "../lib/commonTypes";

type SelectionsProps = {
    setQuarter: voidFunc<quarterType>
    setYear: voidFunc<yearType>
    resetUsage: voidFunc
};

export default function Selections({setQuarter, setYear, resetUsage}: SelectionsProps) {
    return (<>
        <div 
            className="p-2 bg-gray-300 w-fit rounded-lg border-2 border-sky-500"
        >
            <select 
                className="mx-2 p-1 rounded-lg border-2 focus:border-sky-500"
                onChange={ (e) => {
                    if (
                        e.currentTarget.value == 'Q1' 
                        || e.currentTarget.value == 'Q2' 
                        || e.currentTarget.value == 'Q3' 
                        || e.currentTarget.value == 'Q4'
                    ) {
                        setQuarter(e.currentTarget.value);
                        resetUsage();
                    };
                }}
            >
                <option>Q1</option>
                <option>Q2</option>
                <option>Q3</option>
                <option>Q4</option>
            </select>

            <select
                className="mx-2 p-1 rounded-lg border-2 focus:border-sky-500"
                onChange={ (e) => {
                    if (
                        e.currentTarget.value == 'cur' 
                        || e.currentTarget.value == 'prev'
                    ) {
                        setYear(e.currentTarget.value);
                        resetUsage();
                    };
                }}
            >
                <option value='cur'>Current Year</option>
                <option value='prev'>Previous Year</option>
            </select>
        </div>
    </>);
};
