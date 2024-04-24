"use client";

import { useState } from "react";
import { quarterType, stateType, voidFunc, yearType } from "../../lib/commonTypes";

type SelectionsProps = {
    quarterState: stateType<quarterType | undefined>
    setYear: voidFunc<yearType | undefined>
};

export default function Selections({ quarterState, setYear }: SelectionsProps) {
    const {value: quarter, setValue: setQuarter } = quarterState;

    const [y, setY] = useState<yearType>();
    const [q, setQ] = useState<quarterType | undefined>(quarter ? quarter : undefined);

    return (<>
        <div className="w-full flex justify-center">
            <select
                className="text-xl rounded-lg p-2 border-2 focus:border-sky-500 m-2"
                onChange={ (e) => {
                    if (
                        e.currentTarget.value == 'Q1' 
                        || e.currentTarget.value == 'Q2' 
                        || e.currentTarget.value == 'Q3' 
                        || e.currentTarget.value == 'Q4'
                    ) {
                        setQ(e.currentTarget.value);
                    };
                }}
                defaultValue={''}
            >
                <option value={''} disabled hidden>Quarter</option>
                <option>Q1</option>
                <option>Q2</option>
                <option>Q3</option>
                <option>Q4</option>
            </select>

            <select
                className="text-xl rounded-lg p-2 border-2 focus:border-sky-500 m-2"
                onChange={ (e) => {
                    if (
                        e.currentTarget.value == 'cur' 
                        || e.currentTarget.value == 'prev'
                    ) {
                        setY(e.currentTarget.value);
                    };
                }}
                defaultValue={''}
            >
                <option value={''} disabled hidden>Year</option>
                <option value='cur'>Current Year</option>
                <option value='prev'>Previous Year</option>
            </select>

            <button
                className={
                    (q == 'Q1' && y == 'prev') || !q || !y ?
                        'border-2 border-gray-400 p-2 m-2 text-xl bg-gray-200 text-gray-400 rounded-lg' :
                        'border-2 border-sky-500 p-2 m-2 text-xl hover:bg-sky-500 hover:text-white rounded-lg'
                }
                disabled={ (q == 'Q1' && y == 'prev') || !q || !y ? true : false } 
                onClick={ () => { setYear(y), setQuarter(q) } }
            >
                Generate bills
            </button>
        </div>
    </>);
};
