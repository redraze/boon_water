import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function authenticateUser(email: string, hash: string) {
  // TODO
  // check email and hash against database
  // and return associated id and username
  // const { id, username } = checkDB(email, hash);

  return {
    id: '123',
    email: email,
    username: 'testUser'
  };
};

export async function POST(req: Request) {
  const { email, hash } = await req.json();

  const userInfo = await authenticateUser(email, hash);

  const expiryOptions = process.env.NODE_ENV == 'production' ? { expiresIn: '60m' } : {}

  const token = jwt.sign(
    { 
      userId: userInfo.id,
      userEmail: userInfo.email,
      username: userInfo.username
    },
    process.env.JWT_SECRET!,
    expiryOptions
  );
  return NextResponse.json({ token });
};
