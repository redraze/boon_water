import { NextResponse } from "next/server";
import { validateRequest } from "../../lib/authFunctions";
import { collectionConnect } from "../../lib/dbFunctions";
import { ObjectId } from "mongodb";

const origin = '/rollData';

// gets a water users' balance history by id
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
            return NextResponse.json({ success: false, validity });
        };

        let success = true;

        // roll back water usage data for each user
        let collection = await collectionConnect('usage');
        let cursor = collection.find({});
        let users = await cursor.toArray();
        users.map(async user => {
            const dataUpdate = {
                prev: user.data['cur'],
                cur: {
                    Q1: { 1: 0, 2: 0, 3: 0 },
                    Q2: { 1: 0, 2: 0, 3: 0 },
                    Q3: { 1: 0, 2: 0, 3: 0 },
                    Q4: { 1: 0, 2: 0, 3: 0 },
                }
            };

            const cur = await collection.updateOne(
                { _id: new ObjectId(user._id) },
                { $set: { 'data': dataUpdate} }
            );

            if (cur.modifiedCount == 0) {
                console.log(`user with id ${user._id} not updated while attempting data roll back`);
                success = false;
            };
        })

        // roll back balance histories for each user
        collection = await collectionConnect('balances');
        cursor = collection.find({});
        users = await cursor.toArray();
        users.map(async user => {
            const prevBalance = user['cur'][0].newBalance;
            const prevHistory = user['cur'];
            const curHistory = [
                {
                    timeStamp: new Date().valueOf(),
                    note: 'previous year end balance',
                    balanceChange: 0,
                    newBalance: prevBalance
                }
            ];

            const cur = await collection.updateOne(
                { _id: new ObjectId(user._id) },
                { $set: { 
                    cur: curHistory,
                    prev: prevHistory
                } }
            );

            if (cur.modifiedCount == 0) {
                console.log(`user with id ${user._id} not updated while attempting balance history roll back`);
                success = false;
            };
        });

        return NextResponse.json({ success, validity })

    } catch (error) {
        console.log(`error thrown in [/api${origin}] POST: ` + error);
        return NextResponse.json({});
    };
};
