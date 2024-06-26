import { NextResponse } from "next/server";
import { validateRequest } from "../../lib/authFunctions";
import { collectionConnect } from "../../lib/dbFunctions";
import { ObjectId } from "mongodb";
import { patchDataType } from "../../lib/commonTypes";

const origin = '/dataEntry';

// gets all water users' water usage data
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
            return NextResponse.json({ data: [], validity });
        };

        const collection = await collectionConnect('usage');
        const cursor = collection?.find({});
        const data = await cursor?.toArray();
        await cursor?.close();

        return NextResponse.json({ data, validity })

    } catch (error) {
        console.log(`error thrown in [/api${origin}] POST: ` + error);
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

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
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
        console.log(`error thrown in [/api${origin}] POST: ` + error);
        return NextResponse.json({});
    };
};
