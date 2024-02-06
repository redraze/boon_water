import { NextResponse } from "next/server";
import { validateRequest } from "../../lib/authFunctions";
import { collectionConnect } from "../../lib/dbFunctions";

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


// gets a water users' balance history by id
export async function PATCH(req: Request) {
    try {
        const { token, pathname, id, balanceChange, note } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
            return NextResponse.json({ data: [], validity });
        };

        let success = true;
        // TODO:
        // 
        // 1)
        // let collection = await collectionConnect('balances');
        // push update into specified user's current year balance history
        // let cursor = await ...
        // if (!cursor.modified) {
        //     success = false
        //     ...
        // }
        //
        // 2)
        // then update user's balance
        // collection = await collectionConnect('waterUsers');
        // ...

        return NextResponse.json({ success, validity })

    } catch (error) {
        console.log(`error thrown in [/api${origin}] POST: ` + error);
        return NextResponse.json({});
    };
};