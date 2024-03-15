import { NextResponse } from "next/server";
import { validateRequest } from "../../lib/authFunctions";
import { collectionConnect } from "../../lib/dbFunctions";
import { balanceEntryType } from "../../lib/commonTypes";
import { ObjectId } from "mongodb";

const origin = '/balances';

// gets a water users' balance history by id
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
            return NextResponse.json({ data: [], validity });
        };

        const collection = await collectionConnect('balances');
        const cursor = collection?.find({});
        const data = await cursor?.toArray();
        await cursor?.close();

        return NextResponse.json({ data, validity })

    } catch (error) {
        console.log(`error thrown in [/api${origin}] POST: ` + error);
        return NextResponse.json({});
    };
};


// pushes a new balance transaction to the water user's balance history
export async function PATCH(req: Request) {
    try {
        const { token, pathname, id, balanceChange, newBalance, note } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
            return NextResponse.json({ success: false, entry: undefined, validity });
        };

        const entry: balanceEntryType = {
            timeStamp: new Date().valueOf(),
            note: note,
            balanceChange: balanceChange,
            newBalance: newBalance
        };
        let success = true;

        let collection = await collectionConnect('balances');
        let cursor = await collection!.updateOne(
            { _id: new ObjectId(id) },
            {
                $push: {
                   cur: {
                      $each: [ entry ],
                      $position: 0
                   }
                }
            }
        );
        if (!cursor.modifiedCount) {
            success = false;
            return NextResponse.json({ success, entry: undefined, validity })
        };

        collection = await collectionConnect('waterUsers');
        cursor = await collection!.updateOne(
            { _id: new ObjectId(id) },
            { $set: { 'info.balance': newBalance } }
        );
        if (!cursor.modifiedCount) {
            success = false;

            collection = await collectionConnect('balances');
            cursor = await collection!.updateOne(
                { _id: new ObjectId(id) },
                { $pop: { 'cur' : -1 } }
            );

            return NextResponse.json({ success, entry: undefined, validity })
        };

        return NextResponse.json({ success, entry, validity })

    } catch (error) {
        console.log(`error thrown in [/api${origin}] POST: ` + error);
        return NextResponse.json({});
    };
};