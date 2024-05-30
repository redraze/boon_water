import { quarterType, voidFunc, yearType } from "../../lib/commonTypes";
import domtoimage from 'dom-to-image';
import jsPDF from "jspdf";

type UserActionsPropsType = {
    year?: yearType,
    quarter?: quarterType,
    resetUsage: voidFunc,
    handleSubmit: voidFunc
};

export default function UserActions(
    { 
        year, 
        quarter, 
        resetUsage, 
        handleSubmit 
    }: UserActionsPropsType
) {
    const handlePrint = () => {
        const dataTable = document.getElementById('dataTable');
        if (!dataTable) { return };

        const tableCopy = dataTable.cloneNode(true);
        const tBody = tableCopy.childNodes[1];
        const userRows = tBody.childNodes;

        userRows.forEach(row => {
            row.childNodes.forEach((_child, key) => {
                if (key == 0) { return };
                const emptyCell = document.createElement('td');
                emptyCell.appendChild(document.createElement('input'));
                row.replaceChild(emptyCell, row.childNodes[key]);
            });
        });

        document.body.appendChild(tableCopy);
        domtoimage
            .toJpeg(tableCopy)
            .then(dataUrl => {
                const pdf = new jsPDF({
                    orientation: "landscape"
                });

                const img = new Image();
                img.src = dataUrl;
                // @ts-expect-error
                pdf.addImage(img, 'JPEG', 0, 0);

                const year = new Date().getFullYear();
                pdf.save(`${quarter} ${year}.pdf`);
            })
            .catch(error => {
                console.log('error', error);
                document.body.removeChild(tableCopy);
            })
            .finally(() => {
                document.body.removeChild(tableCopy);
            });
    };

    return(<>
        <button
            className={ !year || !quarter ?
                "border-2 border-gray-400 p-2 bg-gray-200 rounded-lg text-l uppercase text-gray-400" :
                "border-2 border-sky-500 p-2 bg-gray-200 rounded-lg text-l uppercase hover:bg-sky-500 hover:text-white"
            }
            onClick={ () => resetUsage() }
            disabled={ !year || !quarter }
        >
            clear changes
        </button>

        <button 
            className={ !year || !quarter ? 
                "border-2 border-gray-400 p-2 bg-gray-200 text-gray-400 rounded-lg text-l uppercase" :
                "bg-gray-200 border-2 border-sky-500 hover:bg-sky-500 hover:text-white rounded-lg p-2 text-l uppercase"
            }
            onClick={ () => handleSubmit() }
            disabled={ !year || !quarter }
        >
            Save changes { !year || !quarter ? <></> : 
                <>for <b>{ quarter }, { year == 'cur' ? 'current year' : 'previous year'}</b></>
            }
        </button>

        <button
            className={ !year || !quarter ? 
                "border-2 border-gray-400 p-2 bg-gray-200 text-gray-400 rounded-lg text-l uppercase" :
                "bg-gray-200 border-2 border-sky-500 hover:bg-sky-500 hover:text-white rounded-lg p-2 text-l uppercase"
            }
            onClick={ () => handlePrint() }
            disabled={ !year || !quarter }
        >
            Print blank page
        </button>
    </>);
};
