import { quarterType, stateType, voidFunc, waterUsageType, yearType } from "../../lib/commonTypes"

type OtherReadingsRowType = {
    quarter: quarterType
    year: yearType
    states: stateType<waterUsageType | undefined>[]
    setMessage: voidFunc<string>
};

export default function OtherReadingsRow(
    {
        quarter,
        year, 
        states,
        setMessage
    }: OtherReadingsRowType
) {
    const updateOtherDataUpdate = (input: {
        month: 1 | 2 | 3, 
        num: string, 
        state: stateType<waterUsageType | undefined>,
    }) => {
        if (!year || !quarter) { return };

        if (isNaN(Number(input.num))) { 
            setMessage('Only numbers are allowed in data boxes.')
            return;
        };
        setMessage('');

        const { value: prev, setValue: setState } = input.state;
        if (!prev) { return };
        setState({
            ...prev,
            data: {
                ...prev.data,
                [year]: {
                    ...prev.data[year],
                    [quarter]: {
                        ...prev.data[year][quarter],
                        [input.month]: Number(input.num)
                    }
                }
            }
        });
    };

    return states.map((state, idx) => {
        const { value, setValue } = state;
        if (!value || !setValue) { return };

        return (
            <tr 
                key={idx}
                className={ 
                idx % 2 ? 
                    'bg-gray-300' :
                    'bg-gray-100'
                }
            >
                <td className="text-xl uppercase p-2">{value.name}</td>
                { [1, 2, 3].map(month => {
                    if (month !== 1 && month !== 2 && month !== 3) { return <></> };
                    return(
                        <td key={month}>
                            <input
                                className="p-1 my-2 rounded-lg"
                                onChange={ (e) => updateOtherDataUpdate({
                                        month,
                                        num: e.currentTarget.value, 
                                        state
                                    })
                                }
                                value={value.data[year][quarter][month]}
                            />
                        </td>
                    )
                }) }
            </tr>
        )
    });
};
