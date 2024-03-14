import { NextResponse } from "next/server";
import { validateRequest } from "../../lib/authFunctions";
import { collectionConnect } from "../../lib/dbFunctions";
import { chargeType } from "../../components/billing/UserActions";
import { balanceEntryType } from "../../lib/commonTypes";
import { ObjectId } from "mongodb";

const origin = '/billing';

// gets all water users' info and water usage data
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
            return NextResponse.json({ data: [], validity });
        };

        let collection = await collectionConnect('usage');
        let cursor = collection?.find({});
        const data = await cursor?.toArray();
        await cursor?.close();

        collection = await collectionConnect('waterUsers');
        cursor = collection?.find({});
        const users = await cursor?.toArray();
        await cursor?.close();

        return NextResponse.json({ users, data, validity })

    } catch (error) {
        console.log(`error thrown in [/api${origin}] POST: ` + error);
        return NextResponse.json({});
    };
};


// posts charges to water user's current balances and updates their billing history
export async function PATCH(req: Request) {
    try {
        const {
            token,
            pathname,
            charges,
            note
        }: {
            token: string,
            pathname: string,
            charges: chargeType[],
            note: string
        } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'PATCH');
        if (!validity) {
            console.log(`message logged from [/api${origin}] PATCH: token validation failed`);
            return NextResponse.json({ success: false, validity });
        };

        let success = true;

        // push balance charges to user's billing histories
        let collection = await collectionConnect('balances');
        charges.map(async chargeInfo => {
            const entry: balanceEntryType = {
                timeStamp: new Date().valueOf(),
                note: chargeInfo.comp ? "[COMP'D] -- " + note : note,
                balanceChange: chargeInfo.charge,
                newBalance: chargeInfo.newBalance
            };
            const cursor = await collection.updateOne(
                { _id: new ObjectId(chargeInfo.id) },
                {
                    $push: {
                       cur: {
                          $each: [ entry ],
                          $position: 0
                       }
                    }
                }
            )
            if (cursor.modifiedCount == 0) { success = false };
        });
        if (!success) {
            console.log("failed to update user's name in balances collection")
            return NextResponse.json({ success, validity });
        };
        
        // update user's account balances
        collection = await collectionConnect('waterUsers');
        charges.map(async chargeInfo => {
            const cursor = await collection.updateOne(
                { _id: new ObjectId(chargeInfo.id) },
                { $set: { 'info.balance': chargeInfo.newBalance } }
            );
            if (cursor.modifiedCount == 0) { success = false };
        });
        if (!success) {
            console.log("failed to update some or all users' balances")
            return NextResponse.json({ success, validity });
        };

        return NextResponse.json({ success, validity })

    } catch (error) {
        console.log(`error thrown in [/api${origin}] PATCH: ` + error);
        return NextResponse.json({});
    };
};