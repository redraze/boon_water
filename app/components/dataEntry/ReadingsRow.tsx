import { quarterType, stateType, waterUsageType, yearType } from "../../lib/commonTypes"

type ReadingsRowType = {
    name: string
    className: string
    updateState: stateType<waterUsageType | undefined>
    updateFunc: any
    year: yearType
    quarter: quarterType
};

export default function ReadingsRow(
    {
        name, 
        className, 
        updateState, 
        updateFunc, 
        year, 
        quarter
    }: ReadingsRowType
) {
    const { value: val, setValue: setVal } = updateState;
    
    return(<>
        { val == undefined ? <></> : 
            <tr className={className}>
                <td className="text-xl uppercase p-2">{name}</td>
                { [1, 2, 3].map(q => {
                    if (q !== 1 && q !== 2 && q !== 3) { return <></> };
                    return(
                        <td key={q}>
                            <input
                                className="p-1 my-2 rounded-lg"
                                onChange={ (e) => { 
                                    updateFunc(
                                        q, 
                                        e.currentTarget.value, 
                                        setVal, 
                                        val
                                    )
                                }}
                                value={val?.data[year][quarter][q]}
                            />
                        </td>
                    )
                }) }
            </tr>
        }
    </>);
};
