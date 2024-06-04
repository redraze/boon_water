import { useEffect } from "react";
import { dataDictType } from "../../dataEntry/page";
import { quarterType, stateType, voidFunc, yearType } from "../../lib/commonTypes"

type HomesReadingsRowsType = {
    year: yearType
    quarter: quarterType
    state: stateType<dataDictType>
    setMessage: voidFunc<string>
    setFocus: voidFunc<number>
    setMaxIdx: voidFunc<number>
};

export default function HomesReadingsRows(
    {
        year,
        quarter,
        state,
        setMessage,
        setFocus,
        setMaxIdx
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
    // six is added to this value because there are two more rows, well head and back flush
    useEffect(() => { setMaxIdx(entries.length * 3 + 6) }, []);

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
                        const cellIdx = (idx * 3) + month;
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
                                    id={ `tabIDX=${cellIdx}` }
                                    tabIndex={cellIdx}
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
