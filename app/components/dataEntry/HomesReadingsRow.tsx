import { useState } from "react";
import { dataDictType } from "../../dataEntry/page";
import { quarterType, stateType, voidFunc, yearType } from "../../lib/commonTypes"

type HomesReadingsRowsType = {
    year: yearType
    quarter: quarterType
    state: stateType<dataDictType>
    setMessage: voidFunc<string>
};

export default function HomesReadingsRows(
    {
        year,
        quarter,
        state,
        setMessage
    }: HomesReadingsRowsType
) {
    const updateHomesDataUpdate = (
        id: string, 
        month: 1 | 2 | 3, 
        val: string,
    ) => {
        if (isNaN(Number(val)) || !year || !quarter) { 
            setMessage('Only numbers are allowed in data boxes.')
            return;
        };
        setMessage('');

        const { value, setValue } = state;

        setValue({
            ...value,
            [id]: {
                ...value[id],
                data: {
                    ...value[id].data,
                    [year]: {
                        ...value[id].data[year],
                        [quarter]: {
                            ...value[id].data[year][quarter],
                            [month]: Number(val)
                        }
                    }
                }
            }
        });
    };

    const entries = Object.entries(state.value);
    const maxIdx = 3 * entries.length;
    const [focus, setFocus] = useState(0);

    const [shift, setShift] = useState(false);
    document.onkeyup = (key) => {
        // TODO
        // detect for shift key release, and update shift state accordingly
    };

    document.onkeydown = (key) => {
        // TODO
        // detect for shift key press, and update shift state accordingly

        const activeElement = document.activeElement
        if (!activeElement) { return };
        // @ts-expect-error
        const idx = activeElement.tabIndex;
        if (idx <= 0) { return };

        if (key.key == 'Enter' && !shift) {
            if (focus == maxIdx) { return };
            
            let newFocus = focus + 3;
            if (newFocus > maxIdx) {
                newFocus = newFocus % 3 + 1;
            };

            document.getElementById(`tabIDX=${newFocus}`)?.focus();
            setFocus(newFocus);
        } else if (key.key == 'Enter' && shift) {
            // TODO
            // move focus accordingly, if possible
        };
    };

    return entries.map(([userId, userInfo], idx) => {
        return(
            <tr
                key={userId}
                className={ 
                    idx % 2 ? 
                        'bg-gray-300' :
                        'bg-gray-100'
                }
            >
                <td className="text-xl p-2">{ userInfo.name }</td>
                { 
                    [1, 2, 3].map(month => {
                        if (month !== 1 && month !== 2 && month !== 3) { return <></> };
                        return (
                            <td key={month}>
                                <input
                                    className="p-1 my-2 rounded-lg"
                                    onChange={(e) => {
                                        updateHomesDataUpdate(
                                            userId, 
                                            month, 
                                            e.currentTarget.value
                                        )
                                    }}
                                    value={state.value[userId].data[year][quarter][month]}
                                    id={ `tabIDX=${(idx * 3) + month}` }
                                    tabIndex={ (idx * 3) + month }
                                    onFocus={ e => setFocus(e.target.tabIndex) }
                                />
                            </td>
                        );
                    })
                }
            </tr>
        );
    });
};
