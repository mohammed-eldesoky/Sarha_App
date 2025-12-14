import { User } from "../../DB/models/user.model.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/email/index.js";
import { generateOtp } from "./../../utils/otp/index.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../../utils/hash/index.js";
import { Token } from "../../DB/models/token.model.js";
import { generateToken } from "../../utils/token/index.js";

// Register user service
export const register = async (req, res, next) => {
  //get data from req body
  const { fullName, email, password, phoneNumber, dob ,nickName} = req.body;

  //check user existance
  const userExist = await User.findOne({
    $or: [
      {
        $and: [
          { email: { $ne: null } }, //  email is not null
          { email: { $exists: true } }, // email exists
          { email: email }, // email matches with body
        ],
      },
      {
        $and: [
          { phoneNumber: { $ne: null } }, //  phoneNumber is not null
          { phoneNumber: { $exists: true } }, // phoneNumber exists
          { phoneNumber: phoneNumber }, // phoneNumber matches with body
        ],
      },
    ],
  });
  if (userExist) {
    throw new Error("User already exists", { cause: 409 });
  }

  //prepare data >> hash password - encrypt phoneNumber
  const user = new User({
    fullName,
    email,
    password: hashPassword(password), // hash password
    phoneNumber,
    dob,
    nickName,

  });

  //generate otp
  const otp = Math.floor(Math.random() * 90000 + 10000); // generate a random 5-digit otp min: 10000, max: 99999
  const otpExpiration = Date.now() + 15 * 60 * 1000; // set expiration time for 5 minutes
  user.otp = otp; // set otp
  user.otpExpiration = otpExpiration; // set otp expiration

  //send email verification
  if (email)
    await sendEmail({
      to: email,
      subject: "verify your account",
      html: `<P>Your verification code is: ${otp}</P>`,
    });

  // create user

  const userCreated = await user.save(); //resolve or reject
  userCreated.password = undefined;
  userCreated.otp = undefined;
  userCreated.otpExpiration = undefined;

  //send response
  return res.status(201).json({
    message: "User created successfully",
    success: true,
    data: userCreated,
  });

  //generate token
};

// verify account service
export const verifyAccount = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }

  // check if user is banned
  if (user.banUntil && user.banUntil > Date.now()) {
    const remaining = Math.ceil((user.banUntil - Date.now()) / 1000);
    return res.status(403).json({
      message: `You are temporarily banned. Try again after ${remaining} seconds.`,
      success: false,
    });
  }

  // check otp validity
  if (
    user.otp !== Number(otp) ||
    !user.otpExpiration ||
    user.otpExpiration < Date.now()
  ) {
    user.failedAttempts += 1;

    if (user.failedAttempts >= 5) {
      user.banUntil = new Date(Date.now() + 5 * 60 * 1000); // ban for 5 min
      user.failedAttempts = 0; // reset attempts after ban
    }

    await user.save();

    throw new Error("Invalid OTP or OTP expired", { cause: 401 });
  }

  // success -> reset
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiration = undefined;
  user.failedAttempts = 0;
  user.banUntil = undefined;

  await user.save();

  return res.status(200).json({
    message: "Account verified successfully",
    success: true,
  });
};

// send otp service

export const sendOtp = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOneAndUpdate({ email });

  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }

  // prevent resend if user is banned
  if (user.banUntil && user.banUntil > Date.now()) {
    const remaining = Math.ceil((user.banUntil - Date.now()) / 1000);
    return res.status(403).json({
      message: `You are temporarily banned. Try again after ${remaining} seconds.`,
      success: false,
    });
  }

  // generate new otp
  const { otp, otpExpiration } = generateOtp();

  user.otp = otp;
  user.otpExpiration = otpExpiration;
  await user.save();

  // send email with new otp
  sendEmail({
    to: email,
    subject: "send OTP",
    html: `<p>Your new verification code is: ${otp}</p>`,
  });

  return res.status(200).json({
    message: "OTP resent successfully",
    success: true,
  });
};

// //login with google
export const loginWithGoogle = async (req, res, next) => {
  //get data from body
  const { idToken } = req.body;
  //verify id token
  const client = new OAuth2Client(
    "151933020018-a856nhfp2f9g96f9u9pt9j1qocjv5nbm.apps.googleusercontent.com"
  );
  const ticket = await client.verifyIdToken({ idToken });
  const payload = ticket.getPayload(); //{email,name,picture,phone}
  //check user
  let userExist = await User.findOne({ email: payload.email });

  if (!userExist) {
    userExist = await User.create({
      fullName: payload.name,
      email: payload.email,
      phoneNumber: payload.phone || null,
      dob: payload.birthdate || null,
      isVerified: true,
      userAgent: "google",
    });
  }
  const Token = jwt.sign(
    { id: userExist._id, name: userExist.fullName },
    "ryrygergregegeg",
    { expiresIn: "1h" }
  );

  //send response
  return res.status(200).json({
    message: "Login With Google Successfully",
    success: true,
    data: { Token },
  });
};

// login user service
export const login = async (req, res, next) => {
  const { email, phoneNumber, password } = req.body;

  // check user existence
  const userExist = await User.findOne({
    $or: [
      {
        $and: [
          { email: { $ne: null } },
          { email: { $exists: true } },
          { email: email },
        ],
      },
      {
        $and: [
          { phoneNumber: { $ne: null } },
          { phoneNumber: { $exists: true } },
          { phoneNumber: phoneNumber },
        ],
      },
    ],
  });

  if (!userExist) {
    throw new Error("User does not exist", { cause: 404 });
  }

  if (userExist.isVerified == false) {
    throw new Error("User is not verified", { cause: 401 });
  }

  // check password
  const match = comparePassword(password, userExist.password);
  if (!match) {
    throw new Error("Invalid credentials", { cause: 401 });
  }
  // check if user deleted
  if (userExist.deletedAt) {
    userExist.deletedAt = undefined;
    await userExist.save();
  }
  // create JWT token
  const accessToken = generateToken({
    payload: { id: userExist._id },
    options: { expiresIn: "15m" },
  });

  // create refresh token
  const refreshToken = generateToken({
    payload: { id: userExist._id },
    options: { expiresIn: "7d" },
  });

  //
  await Token.create({
    token: refreshToken,
    user: userExist._id,
    type: "refresh",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  // send response
  return res.status(200).json({
    message: "Login successfully",
    success: true,
    accessToken,
    refreshToken,
  });
};

//update user password
export const updatePassword = async (req, res, next) => {
  // Update password
  const { oldPassword, newPassword } = req.body;

  // get user from token
  const user = await User.findById(req.user._id).select("password");
  if (!user) {
    throw new Error("User does not exist", { cause: 404 });
  }

  // check matching
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Old password is incorrect", { cause: 400 });
  }

  // hash new password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  user.password = hashedPassword;

  await user.save();

  return res.status(200).json({
    message: "Password updated successfully",
    success: true,
  });
};

//refresh token

// export const refreshAccessToken = async (req, res, next) => {
//   const { refreshToken } = req.body;
//   if (!refreshToken) {
//     throw new Error("Refresh token is required", { cause: 401 });
//   }

//   // check if refresh token is in DB
//   const user = await User.findOne({ refreshToken });
//   if (!user) {
//     throw new Error("Invalid refresh token", { cause: 403 });
//   }

//   // verify refresh token
//   jwt.verify(refreshToken, process.env.TOKEN_SECRET, (err, payload) => {
//     if (err) {
//       throw new Error("Invalid refresh token", { cause: 403 });
//     }

//     // generate new access token
//     const newAccessToken = jwt.sign(
//       { id: payload.id, email: payload.email },
//       process.env.TOKEN_SECRET,
//       { expiresIn: "15m" }
//     );

//     return res.status(200).json({
//       accessToken: newAccessToken,
//     });
//   });
// };

// forget password

/**
 * @_remember_front_end
 */
export const forgetPassword = async (req, res, next) => {
  //get data from req.body
  const { email, otp, newPassword } = req.body;

  // check if user exists in db
  const user = await User.findOne({ email }); // {} || null

  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }
  //check otp valid
  if (user.otp != otp) {
    throw new Error("Invalid OTP", { cause: 400 });
  }
  //check otp expired
  if (Date.now() > user.otpExpiration) {
    throw new Error("OTP expired", { cause: 400 });
  }

  // update password

  user.password = hashPassword(newPassword);
  user.credentialUpdateAt = Date.now();
  user.otp = undefined;
  user.otpExpiration = undefined;
  await user.save(); //create if not exist or update if exist
  //destroy all refresh token
  await Token.deleteMany({ user: user._id, type: "refresh" });
  //send res
  return res.status(200).json({
    message: "Password updated successfully",
    success: true,
  });
};

// logout

export const logout = async (req, res, next) => {
  //get data from req
  const token = req.headers.authorization;
  //storre data into db
  await Token.create({ token, user: req.user._id, type: "access" }); //req.user from auth middleware

  //send res
  return res.status(200).json({
    message: "user logout  successfully",
    success: true,
  });
};
