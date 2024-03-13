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
        <select
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
            disabled={ (q == 'Q1' && y == 'prev') || !q || !y ? true : false } 
            onClick={ () => { setYear(y), setQuarter(q) } }
        >
            Generate bills
        </button>
    </>);
};
