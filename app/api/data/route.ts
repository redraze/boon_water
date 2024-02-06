import { NextResponse } from "next/server";
import { verifyToken } from "../../lib/authFunctions";
import { collectionConnect } from "../../lib/dbFunctions";
import { ObjectId } from "mongodb";
import { patchDataType } from "../../lib/commonTypes";

// gets all water users' water usage data
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, 'POST');
        if (!validity) {
            console.log('message logged from [/api/data] POST: token validation failed');
            return NextResponse.json({ data: [], validity });
        };

        const collection = await collectionConnect('usage');
        const cursor = collection?.find({});
        const data = await cursor?.toArray();
        await cursor?.close();

        return NextResponse.json({ data, validity })

    } catch (error) {
        console.log(`error thrown in [/api/data] POST: ` + error);
        return NextResponse.json({});
    };
};


// updates users' water usage data
export async function PATCH(req: Request) {
    try {
        const { token, pathname, updates }: {
            token: string,
            pathname: string,
            updates: patchDataType[]
        } = await req.json();

        const validity = await validateRequest(token, pathname, 'POST');
        if (!validity) {
            console.log('message logged from [/api/data] POST: token validation failed');
            return NextResponse.json({ success: false, validity });
        };

        const collection = await collectionConnect('usage');

        let cursor;
        let success = true;

        updates.map(async (update: patchDataType) => {
            cursor = await collection?.updateOne(
                { _id: new ObjectId(update.id) },
                { $set: { 'data': update.update }}
            );
            if (!cursor?.modifiedCount) {
                success = false;
            };
        })

        return NextResponse.json({ success: success, validity });

    } catch (error) {
        console.log(`error thrown in [/api/data] POST: ` + error);
        return NextResponse.json({});
    };
};


/**
 * Attempts to validate request.
 * @param req - Request
 * @param method - string
 * @throws undefined if a server error is encountered
 * @returns boolean indicating token validity
 */
const validateRequest = async (token: string, pathname: string, method: string) => {
    // prevent users with valid tokens but invalid permissions from 
    // gaining access to protected endpoints through request origin spoofing
    if (pathname !== '/dataEntry') {
        console.log(`message logged from [/api/users] ${method}: invalid pathname origin`);
        // TODO: log request and flag for review
        return false;
    };

    const validity = verifyToken(token, pathname);
    if (validity == undefined) {
        throw new Error('[validateRequest function]: internal server error encountered');
    };
    return validity;
};
