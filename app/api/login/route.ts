import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function authenticateUser(email: string, hash: string) {
  try {
    // TODO
    // check email and hash against database
    // and return associated id and username
    // const { id, username } = checkDB(email, hash);
    
    return {
      id: '123',
      email: email,
      username: 'testUser'
    };
  } catch {
    throw new Error('unable to complete database query');
  };
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
        userId: userInfo.id,
        userEmail: userInfo.email,
        username: userInfo.username
      },
      secret,
      expiryOptions
    );

    return NextResponse.json({ token });
    
  } catch (error) {
    console.log('error thrown in [/api/users]: ' + error);
  };
};
