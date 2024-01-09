import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function authenticateUser(username: string, hash: string) {
  // TODO
  // check username and hash against database

  return {
    id: 1,
    name: 'username'
  };
};

export async function POST(req: any) {
  const { username, hash } = await req.json();

  const userInfo = await authenticateUser(username, hash);

  const token = jwt.sign(
    { 
      userId: userInfo.id,
      username: userInfo.name
    },
    process.env.JWT_SECRET!,
    // {
    //   expiresIn: "1m"
    // }
  );
  return NextResponse.json({ token });
};
