import Cookies from "js-cookie";
import { quarterType, shrinkageObject, triple, waterUsageType, yearType } from "./commonTypes";
import { clientSideLoggingEnabled } from "./settings";

/**
 * Attmptes to fetch all water users' water usage data.
 * @param pathname - string containing the origin of the request
 * @returns undefined if a server error is encountered, or an object containing: data, an array of objects containing id, name, and water usage data; validity, a boolean indicating token validity
 */
export const getData = async (pathname: string) => {
    try {
        if (!pathname) { return { data: undefined, validity: false } };

        const response = await fetch("/api/reporting", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: Cookies.get('token'),
                pathname
            }),
        });

        if (!response.ok) { throw new Error('api fetch response not OK') };

        const res: { data: waterUsageType[], validity: boolean } = await response.json();
        return res;
      
    } catch (error) {
        if (clientSideLoggingEnabled) {
            console.log('error thrown in [/lib/reportingFunctions getData function]: ' + error);
        };
    };
};


/**
 * @returns various data for the usages and shrinkage tables
 */
export const getReportingData = (
    quarter: quarterType | undefined, 
    year: yearType | undefined, 
    wellHeadData: waterUsageType | undefined,
    userData: waterUsageType[] | undefined,
    backFlushData: waterUsageType | undefined,
) => {
    if (!year || !quarter || !userData || !wellHeadData || !backFlushData) { return };

    let prevQ: quarterType = 'Q1';
    if (quarter == 'Q1') { prevQ = 'Q4' }
    else if (quarter == 'Q2') { prevQ = 'Q1'}
    else if (quarter == 'Q3') { prevQ = 'Q2'}
    else if (quarter == 'Q4') { prevQ = 'Q3'};

    // differences in monthly well head readings
    const headDiffsDraft: triple<number> = [
        wellHeadData.data[year][quarter][1] - wellHeadData.data[quarter == 'Q1' ? 'prev' : year][prevQ][3],
        wellHeadData.data[year][quarter][2] - wellHeadData.data[year][quarter][1],
        wellHeadData.data[year][quarter][3] - wellHeadData.data[year][quarter][2]
    ];

    // differences in monthly sum of home readings
    const homesDiffsDraft: triple<number> = [0, 0, 0];
    userData.map(user => {
        homesDiffsDraft[0] += user.data[year][quarter][1] - user.data[quarter == 'Q1' ? 'prev' : year][prevQ][3];
        homesDiffsDraft[1] += user.data[year][quarter][2] - user.data[year][quarter][1];
        homesDiffsDraft[2] += user.data[year][quarter][3] - user.data[year][quarter][2];
    });

    // differences in monthly back flush readings
    const flushDiffsDraft: triple<number> = [
        backFlushData.data[year][quarter][1] - backFlushData.data[quarter == 'Q1' ? 'prev' : year][prevQ][3],
        backFlushData.data[year][quarter][2] - backFlushData.data[year][quarter][1],
        backFlushData.data[year][quarter][3] - backFlushData.data[year][quarter][2]
    ];
    
    // shrinkages for each month of the quarter
    const shrinkagesDraft: triple<shrinkageObject> = [
        {gallons: 0, percent: 0}, 
        {gallons: 0, percent: 0}, 
        {gallons: 0, percent: 0}
    ];
    headDiffsDraft.map((upStream, idx) => {
        const downStream = homesDiffsDraft[idx] + flushDiffsDraft[idx];

        const shrinkageGals = upStream - downStream;
        const shrinkagePercent = shrinkageGals / upStream * 100;

        shrinkagesDraft[idx] = {
            gallons: shrinkageGals,
            percent: isNaN(shrinkagePercent) ? 0 : shrinkagePercent
        };
    });

    // total shrinkage for the quarter
    const totalHeadDiff = headDiffsDraft[2] - headDiffsDraft[0];
    const totalHomesDiff = homesDiffsDraft[2] - homesDiffsDraft[0];
    const totalFlushDiff = flushDiffsDraft[2] - flushDiffsDraft[0];
    const totalShrinkageGals = totalHeadDiff - (totalHomesDiff + totalFlushDiff);
    const totalShrinkagePercent = totalShrinkageGals / totalHeadDiff * 100;

    return {
        headDiffsDraft, 
        homesDiffsDraft, 
        flushDiffsDraft, 
        shrinkagesDraft, 
        totalShrinkageGals, 
        totalShrinkagePercent
    };
};
