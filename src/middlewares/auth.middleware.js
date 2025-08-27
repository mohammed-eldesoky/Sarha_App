import { verifyToken } from "../utils/token/index.js";
import { User } from "./../DB/models/user.model.js";
import { Token } from "./../DB/models/token.model.js";

export const isAuthorized = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error("token is required", { cause: 401 });
  }

  const token = authHeader
  const payload = verifyToken(token);
  //check token into db
  const blockedToken = await Token.findOne({ token, type: "access" });
  if (blockedToken) {
    throw new Error("invalid token", { cause: 401 });
  }

  // check user in database
  const userExist = await User.findById(payload.id);
  if (!userExist) {
    throw new Error("user not found", { cause: 404 });
  }

if (userExist.credentialUpdateAt >new Date( payload.iat * 1000)){
      throw new Error("token expired", { cause: 401 });
}// 

  req.user = userExist;
  req.userId = userExist._id;

  return next();
};
