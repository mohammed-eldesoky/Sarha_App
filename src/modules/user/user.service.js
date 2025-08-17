import { verifyToken } from "../../utils/token/index.js";
import { User } from "./../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import cloudinary from "./../../utils/cloud/cloudnairy.copnfig.js";
// 1- delete userAccount

export const deleteAcount = async (req, res, next) => {
  //delete user from server >>cloudnairy ||local
  if (req.user.profilePic.public_id) {
    await cloudinary.api.delete_resources_by_prefix(
      `users/${req.user._id}/profile-pic`
    );// 

    await cloudinary.api.delete_folder(`users/${req.user._id}/profile-pic`); // if user has a profile picture, delete it from cloudinary
  }

  //delete user from database
  await User.deleteOne({ _id: req.user._id });
  //send response
  return res.status(200).json({
    message: "User deleted successfully",
    success: true,
  });
};

//2-upload profile picture

export const uploadProfilePicture = async (req, res, next) => {
  //req.file becouse we are using multer & single

  //delete old picture
  if (req.user.profilePicture) {
    fs.unlink(req.user.profilePicture);
  } // if user has profile picture delete it

  //update user login profilePic= PATH >>req.file

  const userExist = await User.findByIdAndUpdate(
    req.user._id,
    {
      profilePic: req.file.path,
    },
    { new: true }
  ); //{}||null

  //fail case

  if (!userExist) {
    throw new Error("User not found", { cause: 404 });
  }

  //send response
  return res.status(200).json({
    message: "your pictute uploaded successfully",
    success: true,
    data: userExist,
  });
};

export const uploadprofilePictureCloud = async (req, res, next) => {
  const user = req.user;
  const file = req.file;

  // delete old picture
  if (user.profilePic?.public_id) {
    await cloudinary.uploader.destroy(user.profilePic.public_id);
  }

  //upload new picture
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: `users/${user._id}/profile-pic`,
    }
  );
  //update into db

  await User.updateOne(
    { _id: user._id },
    { profilePic: { secure_url, public_id } }
  );
  //send response
  return res.status(200).json({
    message: "Your picture uploaded successfully",
    success: true,
    data: { secure_url, public_id },
  });
};
