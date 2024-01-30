import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { dbConnect } from "../../lib/dbConnect";
import { ObjectId } from "mongodb";

// checks the user's provided credentials against a shadow db.
// returns a JWT token if login credentials were legitimate
export async function POST(req: Request) {
  try {
    const { email, hash } = await req.json();
    if (!email || !hash) { throw new Error('missing user credentials') };
    
    const collection = await shadowCollection();
    const userInfo = await collection?.findOne(
      { email: email, hash: hash }, 
      { projection: { _id: 1, email: 1, name: 1 }}
    );
  
    const token = generateToken(userInfo)
    return NextResponse.json({ token });
    
  } catch (error) {
    console.log('error thrown in [/api/users -> POST]: ' + error);
    return NextResponse.json({});
  };
};


// updates a user's information in the shadow db.
// returns a new JWT token if update was successfull
export async function PATCH(req: Request) {
  try {
    const vars: {
      updateType: string
      id: string,
      email: string,
      hash: string,
      oldHash: string,
      newHash: string
    } = await req.json();

    if (vars.updateType == 'password') {
      const { id, oldHash, newHash } = vars;
      if (!id || !oldHash || !newHash) { throw new Error('missing user credentials') };

      const collection = await shadowCollection();
      const userInfo = await collection?.findOneAndUpdate(
        { _id: new ObjectId(id), hash: oldHash },
        { $set: {hash: newHash} },
        { projection: { _id: 1, email: 1, name: 1 }}
      );
    
      const token = generateToken(userInfo)
      return NextResponse.json({ token });

    } else if (vars.updateType == 'email') {
      const { id, email, hash } = vars;
      if (!id || !email || !hash) { throw new Error('missing user credentials') };
      
      const collection = await shadowCollection();
      const userInfo = await collection?.findOneAndUpdate(
        { _id: new ObjectId(id), hash: hash },
        { $set: {email: email} },
        { projection: { _id: 1, email: 1, name: 1 }}
      );
        
      const token = generateToken(userInfo)
      return NextResponse.json({ token });
    };

  } catch (error) {
    console.log('error thrown in [/api/users -> EMAIL]: ' + error);
    return NextResponse.json({});
  };
};


/**
 * @returns the shadow collection in the shadowDb database.
 */
const shadowCollection = async () => {
  const dbClient = await dbConnect();
  const db = dbClient?.db('shadowDb');
  const collection = db?.collection('shadow');
  return collection;
};


/**
 * Generates a JWT token with the provided user information and the JWT_SECRET environmental variable.
 * @param userInfo an object containing the following user information: {_id: string, email: string, name: string}
 * @returns a JWT token in the form of a string
 * @throws if any of the neccessary user info is not provided, or if the JWT_SECRET string is not defined
 */
const generateToken = (userInfo: {_id: string, email: string, name: string} | any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) { throw new Error('JWT_SECRET not defined') };

  if (!userInfo || !userInfo._id || !userInfo.email || !userInfo.name) {
    throw new Error('login failed');
  };

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

  return token;
};
