"use client";

import { useState } from "react";
import { quarterType, stateType, voidFunc, yearType } from "../../lib/commonTypes";

type SelectionsProps = {
    quarterState: stateType<quarterType>
    setYear: voidFunc<yearType>
};

export default function Selections({ quarterState, setYear }: SelectionsProps) {
    const {value: quarter, setValue: setQuarter } = quarterState;

    const [y, setY] = useState<yearType>('cur');
    const [q, setQ] = useState<quarterType>(quarter);

    return (<>
        <select onChange={ (e) => {
            if (
                e.currentTarget.value == 'Q1' 
                || e.currentTarget.value == 'Q2' 
                || e.currentTarget.value == 'Q3' 
                || e.currentTarget.value == 'Q4'
            ) {
                setQ(e.currentTarget.value);
            };
        }}>
            <option>Q1</option>
            <option>Q2</option>
            <option>Q3</option>
            <option>Q4</option>
        </select>

        <select onChange={ (e) => {
            if (
                e.currentTarget.value == 'cur' 
                || e.currentTarget.value == 'prev'
            ) {
                setY(e.currentTarget.value);
            };
        }}>
            <option value='cur'>Current Year</option>
            <option value='prev'>Previous Year</option>
        </select>

        <button
            disabled={ q == 'Q1' && y == 'prev' ? true : false } 
            onClick={ () => { setYear(y), setQuarter(q) } }
        >
            Generate bills
        </button>
    </>);
};
