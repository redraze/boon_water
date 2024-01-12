import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

async function determineValidity(token: string) {
    // TODO
    // decode token using JWT_SECRET,
    // then make sure the token is valid and hasn't expired,
    // determine if the token provided has permission 
    // to access the desired endpoint specified in path

    return true;
};

export async function POST(req: Request) {
    const { token, pathname } = await req.json();
    const validity = await determineValidity(token);
    return NextResponse.json({ validity });
};
