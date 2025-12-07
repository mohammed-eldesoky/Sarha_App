// async handler
import { generateToken, verifyToken } from "./../token/index.js";
import { Token } from "./../../DB/models/token.model.js";
import fs from "fs";


export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      next(error);
    });
  };
};

//global error handler

// export const globalErorrHandler = async (err, req, res, next) => {
//   if (req.file) {
//     fs.unlinkSync(req.file.path); //if error, delete the file
//   }

//   if (err.message == "jwt expired") {
//     const refreshToken = req.headers.refreshtoken;
//     const payload = verifyToken(refreshToken);
//     const tokenExist = await Token.findOneAndDelete({
//       token: refreshToken,
//       user: payload.id,
//       type: "refresh",
//     });
//     if (!tokenExist) {
//       throw new Error("invalid token",{cause:401});
//       //logout from all devices
//     }

//     const accessToken = generateToken({
//       payload: { id: payload.id },
//       options: { expiresIn: "15m" },
//     });

//     const newrefreshToken = generateToken({
//       payload: { id: payload.id },
//       options: { expiresIn: "7d" },
//     });
//     //store into db
//     await Token.create({
//       token: newrefreshToken,
//       user: payload.id,
//       type: "refresh",
//         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7days
//     });
//     //send res
//     return res
//       .status(200)
//       .json({
//         message: "refresh token successfully",
//         success: true,
//         data: { accessToken, refreshToken: newrefreshToken },
//       });
//   }

//   res.status(err.cause || 500).json({
//     message: err.message,
//     success: false,
//     stack: err.stack,
//     error: err,
//   });
// };

export const globalErorrHandler = async (err, req, res, next) => {
try {
    if (req.file) {
    fs.unlinkSync(req.file.path); // if error, delete the file
  }

  if (err.message == "jwt expired") {
    const refreshToken = req.headers.refreshtoken;

    // check token existence and not expired
    const tokenExist = await Token.findOne({
      token: refreshToken,
      type: "refresh",
      expiresAt: { $gt: new Date() },
    });

    if (!tokenExist) {
      throw new Error("invalid or expired refresh token", { cause: 401 });
    }

    // verify payload after confirming existence
    const payload = verifyToken(refreshToken);

    // delete old token
    await Token.deleteOne({ _id: tokenExist._id });

    // generate new tokens
    const accessToken = generateToken({
      payload: { id: payload.id },
      options: { expiresIn: "15m" },
    });

    const newrefreshToken = generateToken({
      payload: { id: payload.id },
      options: { expiresIn: "7d" },
    });

    // store new refresh token in DB
    await Token.create({
      token: newrefreshToken,
      user: payload.id,
      type: "refresh",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return res.status(200).json({
      message: "refresh token successfully",
      success: true,
      data: { accessToken, refreshToken: newrefreshToken },
    });
  }

  res.status(err.cause || 500).json({
    message: err.message,
    success: false,
    error: err,
  });
} catch (err) {
    res.status(err.cause || 500).json({
    message: err.message,
    success: false,
    error: err,
})
}
};
