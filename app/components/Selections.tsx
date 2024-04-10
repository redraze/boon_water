"use client";

import { quarterType, voidFunc, yearType } from "../lib/commonTypes";

type SelectionsProps = {
    setQuarter: voidFunc<quarterType | undefined>
    setYear: voidFunc<yearType | undefined>
    resetUsage?: voidFunc
};

export default function Selections({ setQuarter, setYear, resetUsage }: SelectionsProps) {
    return (<>
        <div 
            className="p-2 bg-gray-300 w-fit rounded-lg border-2 border-sky-500"
        >
            <select 
                className="mx-2 p-1 rounded-lg border-2 focus:border-sky-500"
                defaultValue={'Select Quarter'}
                onChange={ (e) => {
                    const q = e.currentTarget.value;
                    if (q == 'Q1' || q == 'Q2' || q == 'Q3' || q == 'Q4') {
                        setQuarter(q);
                        if (resetUsage) { resetUsage() };
                    } else {
                        setQuarter(undefined);
                    };
                }}
            >
                <option disabled hidden>Select Quarter</option>
                <option>Q1</option>
                <option>Q2</option>
                <option>Q3</option>
                <option>Q4</option>
            </select>

            <select
                className="mx-2 p-1 rounded-lg border-2 focus:border-sky-500"
                defaultValue={'Select Year'}
                onChange={ (e) => {
                    const y = e.currentTarget.value;
                    if (y == 'cur' || y == 'prev') {
                        setYear(y);
                        if (resetUsage) { resetUsage() };
                    } else {
                        setYear(undefined);
                    };
                }}
            >
                <option disabled hidden>Select Year</option>
                <option value='cur'>Current Year</option>
                <option value='prev'>Previous Year</option>
            </select>
        </div>
    </>);
};
