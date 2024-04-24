import { mDict, quarterType, shrinkageObject, triple } from "../../lib/commonTypes";

type DiffsTablePropsType = {
    quarter: quarterType,
    headDiffs: triple<number>,
    homesDiffs: triple<number>,
    flushDiffs:triple<number>,
    shrinkages: triple<shrinkageObject>
}

export default function DiffsTable(
    {
        quarter, 
        headDiffs, 
        homesDiffs, 
        flushDiffs, 
        shrinkages
    }: DiffsTablePropsType
) {
    const setStyle = (val: number) => {
        if (val < 0) {
            return "bg-yellow-500 text-red-500 font-bold p-2 text-center"
        } else {
            return "p-2 text-center"
        }
    };

    return (<>
        <table className="w-full border-4 border-gray-500 text-xl">

            {/* month names */}
            <thead className="bg-gray-500 text-white uppercase text-2xl">
                <tr>
                    <td></td>
                    <td className="p-2 text-center">{ mDict[1][quarter] }</td>
                    <td className="p-2 text-center">{ mDict[2][quarter] }</td>
                    <td className="p-2 text-center">{ mDict[3][quarter] }</td>
                </tr>
            </thead>

            <tbody>
                {/* well head readings */}
                <tr className='bg-gray-100'>
                    <td className="p-4 text-center">&#916; Well Head</td>
                    {
                        headDiffs.map((val, idx) => {
                            return <td key={idx} className={ setStyle(val) }>{ val }</td>
                        })
                    }
                </tr>

                {/* summed homes readings */}
                <tr className='bg-gray-300'>
                    <td className="p-4 text-center">&#916; Sum(Homes)</td>
                    {
                        homesDiffs.map((val, idx) => {
                            return <td key={idx} className={ setStyle(val) }>{ val }</td>
                        })
                    }
                </tr>

                {/* backflush readings */}
                <tr className='bg-gray-100'>
                    <td className="p-4 text-center">&#916; Backflush</td>
                    {
                        flushDiffs.map((val, idx) => {
                            return <td key={idx} className={ setStyle(val) }>{ val }</td>
                        })
                    }
                </tr>

                {/* shrinkages in gallons */}
                <tr className='bg-gray-300 border-t-8 border-gray-500 text-center'>
                    <td className="pt-4 pl-4">Shrinkage</td>
                    {
                        shrinkages.map((obj, idx) => {
                            return <td key={idx} className={ setStyle(obj.gallons) }>{ obj.gallons } gallons</td>
                        })
                    }
                </tr>

                {/* percent shrinkages */}
                <tr className='bg-gray-300'>
                    <td></td>
                    {
                        shrinkages.map((obj, idx) => {
                            return <td key={idx} className={ setStyle(obj.percent) }>{ obj.percent.toFixed(2) }%</td>
                        })
                    }
                </tr>
            </tbody>

        </table>
    </>);
};
