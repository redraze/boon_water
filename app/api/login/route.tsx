import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function authenticateUser(email: string, hash: string) {
  // TODO
  // check email and hash against database
  // and return associated id and username
  // const { id, username } = checkDB(email, hash);

  return {
    // id: id,
    email: email,
    // name: username
  };
};

export async function POST(req: Request) {
  const { username, hash } = await req.json();

  const userInfo = await authenticateUser(username, hash);

  const token = jwt.sign(
    { 
      // userId: userIngo.id,
      userEmail: userInfo.email,
      // username: userInfo.username
    },
    process.env.JWT_SECRET!,
    // {
    //   expiresIn: "1m"
    // }
  );
  return NextResponse.json({ token });
};
