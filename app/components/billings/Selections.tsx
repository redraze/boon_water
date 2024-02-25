"use client";

import { quarterType, voidFunc, yearType } from "../../lib/commonTypes";

type SelectionsProps = {
    setQuarter: voidFunc<quarterType>
    setYear: voidFunc<yearType>
};

export default function Selections({setQuarter, setYear}: SelectionsProps) {
    return (<>
        <select onChange={ (e) => {
            if (
                e.currentTarget.value == 'Q1' 
                || e.currentTarget.value == 'Q2' 
                || e.currentTarget.value == 'Q3' 
                || e.currentTarget.value == 'Q4'
            ) {
                setQuarter(e.currentTarget.value);
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
                setYear(e.currentTarget.value);
            };
        }}>
            <option value='cur'>Current Year</option>
            <option value='prev'>Previous Year</option>
        </select>
    </>);
};
