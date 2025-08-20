import jwt from "jsonwebtoken";

// verify Token
export const verifyToken = (token, secretkey =process.env.TOKEN_SECRET ) => {
  return jwt.verify(token, secretkey);
};

// generate token

export const generateToken = (
  payload,
  secretkey = process.env.TOKEN_SECRET,
  options={}
) => {};
