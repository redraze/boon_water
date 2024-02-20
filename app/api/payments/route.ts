import { ObjectId } from "mongodb";
import { balanceEntryType, userInfo } from "../../lib/commonTypes";
import { NextResponse } from "next/server";
import { collectionConnect } from "../../lib/dbFunctions";
import { validateRequest } from "../../lib/authFunctions";

const origin = '/payments';

// gets all water users' personal info
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
            return NextResponse.json({ users: [], validity });
        };

        const collection = await collectionConnect('waterUsers');
        const cursor = collection?.find({});
        const users = await cursor?.toArray();
        await cursor?.close();

        return NextResponse.json({ users, validity })

    } catch (error) {
        console.log(`error thrown in [/api/${origin}] POST: ` + error);
        return NextResponse.json({});
    };
};


// edits an existing water user's contact info
export async function PATCH(req: Request) {
    try {
        const {
            token,
            pathname,
            payments,
            note
        }: {
            token: string,
            pathname: string,
            payments: ({
                id: string,
                name: string,
                payment: number,
                balance: number
            } | undefined)[],
            note: string
        } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'PATCH');
        if (!validity) {
            console.log(`message logged from [/api${origin}] PATCH: token validation failed`);
            return NextResponse.json({ success: false, validity });
        };

        if (!payments || !note) {
            console.log(`message logged from [/api${origin}] PATCH: incomplete request`);
            return NextResponse.json({ success: false, validity });
        };

        let success = true;

        // push balance entries (payments) to users' balance histories
        let collection = await collectionConnect('balances');
        payments.map(async paymentInfo => {
            if (!paymentInfo) { return };
            const entry: balanceEntryType = {
                timeStamp: new Date().valueOf(),
                note: note,
                balanceChange: paymentInfo.payment * -1,
                newBalance: paymentInfo.balance
            };
            const cursor = await collection.updateOne(
                { _id: new ObjectId(paymentInfo.id) },
                {
                    $push: {
                       cur: {
                          $each: [ entry ],
                          $position: 0
                       }
                    }
                }
            )
            if (!cursor.modifiedCount) { success = false };
        });
        if (!success) {
            console.log("failed to update user's name in balances collection")
            return NextResponse.json({ success, validity });
        };

        // update users' balances
        collection = await collectionConnect('waterUsers');
        payments.map(async paymentInfo => {
            if (!paymentInfo) { return };
            const cursor = await collection.updateOne(
                { _id: new ObjectId(paymentInfo.id) },
                { $set: { 'info.balance': paymentInfo.balance } }
            );
            if (!cursor.modifiedCount) { success = false };
        });
        if (!success) {
            console.log("failed to update user's info in waterUsers collection")
            return NextResponse.json({ success: false, validity });
        };

        return NextResponse.json({ success, validity });

    } catch (error) {
        console.log(`error thrown in [/api${origin}] PATCH: ` + error);
        return NextResponse.json({});
    };
};
