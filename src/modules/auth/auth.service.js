import { User } from "../../DB/models/user.model.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/email/index.js";
import { generateOtp } from "./../../utils/otp/index.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

// Register user service
export const register = async (req, res, next) => {
  //get data from req body
  const { fullName, email, password, phoneNumber, dob } = req.body;

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
    password: bcrypt.hashSync(password, 10), // hash password
    phoneNumber,
    dob,
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

  return res.status(201).json({
    message: "User created successfully",
    success: true,
    data: userCreated,
  });

  //generate token
};

// verify account service
export const verifyAccount = async (req, res, next) => {
  //get data from req body
  const { email, otp } = req.body;
  //check user existance : otp & otpExpiration
  const user = await User.findOne({
    email: email,
    otp: otp,
    otpExpiration: { $gt: Date.now() }, // check if otp is not expired
  }); //return {} | null

  if (!user) {
    throw new Error("Invalid OTP or OTP expired", { cause: 401 });
  }
  user.isVerified = true; // update isVerified to true
  user.otp = undefined; // clear otp after verification
  user.otpExpiration = undefined; // clear otpExpiration after verification
  // update user >> isVerified:true
  await user.save();
  //send response
  return res.status(200).json({
    message: "Account verified successfully",
    success: true,
  });
};

//resend otp service

export const resendOtp = async (req, res, next) => {
  //get data from req
  const { email } = req.body;
  //generate new otp
  const { otp, otpExpiration } = generateOtp();
  //update user with new otp and otpExpiration

  const updatedUser = await User.updateOne(
    {
      email: email,
    },
    {
      otp: otp,
      otpExpiration: otpExpiration,
    }
  );
  //send email with new otp
  sendEmail({
    to: email,
    subject: "Resend OTP",
    html: `<P>Your new verification code is: ${otp}</P>`,
  });
  //send response

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
  const match = bcrypt.compareSync(password, userExist.password);
  if (!match) {
    throw new Error("Invalid credentials", { cause: 401 });
  }

  // create JWT token
  const token = jwt.sign(
    { id: userExist._id, email: userExist.email },
    "fhdfhdfhdfhdfhdfh", // verifyToken
    { expiresIn: "15m" }
  );

  // create refresh token
  const refreshToken = jwt.sign(
    { id: userExist._id, email: userExist.email },
   "fhdfhdfhdfhdfhdfh",
    { expiresIn: "7d" }
  );

  // store refresh token in DB
  userExist.refreshToken = refreshToken;
  await userExist.save();

  // send response
  return res.status(200).json({
    message: "Login successfully",
    success: true,
    token,
    refreshToken,
  });
};

//update user password
export const updatePassword = async (req, res, next) => {
  // Update password
  const { oldPassword, newPassword } = req.body;

  // get user from token
  const user = await User.findById(req.userId).select("password");
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

export const refreshAccessToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new Error("Refresh token is required", { cause: 401 });
  }

  // check if refresh token is in DB
  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new Error("Invalid refresh token", { cause: 403 });
  }

  // verify refresh token
  jwt.verify(refreshToken, "fhdfhdfhdfhdfhdfh", (err, payload) => {
    if (err) {
      throw new Error("Invalid refresh token", { cause: 403 });
    }

    // generate new access token
    const newAccessToken = jwt.sign(
      { id: payload.id, email: payload.email },
       "fhdfhdfhdfhdfhdfh",
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  });
};
