

export const isAuthorized = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new Error("token is required", { cause: 401 });
    }

    const token = authHeader.split(" ")[1]; 
    const payload = verifyToken(token);

    // check user in database
    const userExist = await User.findById(payload.id);
    if (!userExist) {
      throw new Error("user not found", { cause: 404 });
    }

    req.user = userExist;      
    req.userId = userExist._id; 

    return next();

};
