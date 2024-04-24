import { shrinkageObject } from "../../lib/commonTypes";

export default function TotalsTable({ shrinkageTotals }: { shrinkageTotals: shrinkageObject }) {
    return (<>
        <div className="pt-8">

            <table className=" mx-auto w-2/3 border-4 border-gray-500 text-xl font-bold">
                <thead>
                    <tr className="bg-gray-500 text-white uppercase text-2xl">
                        <td className="pt-2 text-center">Total Shrinkage</td>
                    </tr>
                </thead>
            </table>

            <table className=" mx-auto w-2/3 border-4 border-gray-500 text-xl font-bold">
                <tbody>
                    <tr className='bg-gray-100 border-t-8 border-gray-500 font-bold'>
                        <td className={ shrinkageTotals.gallons < 0 ? 
                            "w-1/2 text-center p-4 bg-yellow-500 text-red-500" :
                            "w-1/2 text-center p-4"
                        }>
                            { shrinkageTotals.gallons } gallons
                        </td>
                        <td className={ shrinkageTotals.percent < 0 ?
                            "w-1/2 text-center p-4 bg-yellow-500 text-red-500" :
                            "w-1/2 text-center p-4"
                        }>
                            { shrinkageTotals.percent.toFixed(2) }%
                        </td>
                    </tr>
                </tbody>
                
            </table>
        </div>
    </>);
};
