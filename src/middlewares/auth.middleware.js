import { User } from "../DB/models/user.model.js";
import { verifyToken } from "../utils/token/index.js";


export const isAuthorized = async (req, res, next) => {
  //get token from header
  const token = req.headers.authorization;

  if (!token) {
    throw new Error("token is requird", { cause: 401 });
  }

  const payload = verifyToken(token);

  //check user in database
  const userExist = await User.findById(payload.id);

  if (!userExist) {
    throw new Error("user not found", { cause: 404 });
  }
    req.user = userExist;

  return next();
};
