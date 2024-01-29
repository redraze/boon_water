import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { dbConnect } from "../../lib/dbConnect";

async function authenticateUser(email: string, hash: string) {
  const dbClient = await dbConnect();
  const db = dbClient?.db('shadowDb');
  const collection = db?.collection('shadow');

  const cursor = await collection?.findOne(
    { email: email, hash: hash }, 
    { projection: { _id: 1, email: 1, name: 1 }}
  )

  if (!cursor) { throw new Error('login failed') };
  return cursor;
};

export async function POST(req: Request) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) { throw new Error('JWT_SECRET not defined') };
    
    const { email, hash } = await req.json();
    if (!email || !hash) { throw new Error('missing user credentials') };
    
    const userInfo = await authenticateUser(email, hash);
    
    const expiryOptions = process.env.NODE_ENV == 'production' ? { expiresIn: '60m' } : {}
    
    const token = jwt.sign(
      { 
        id: userInfo._id,
        email: userInfo.email,
        name: userInfo.name
      },
      secret,
      expiryOptions
    );

    return NextResponse.json({ token });
    
  } catch (error) {
    console.log('error thrown in [/api/users]: ' + error);
  };
};
