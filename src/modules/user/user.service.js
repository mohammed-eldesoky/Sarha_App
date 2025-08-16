import { verifyToken } from "../../utils/token/index.js";
import { User } from "./../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import cloudinary from './../../utils/cloud/cloudnairy.copnfig.js';
// 1- delete userAccount

export const deleteAcount = async (req, res, next) => {
  try {
    //get data from req params
    const { token } = req.headers.authorization;
    const payload = jwt.verify(token, "fdghdfrhdfhdfhdf");
    const { id, name } = payload;
    //delete user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new Error("User not found", { cause: 404 });
    }

    //send response
    return res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    return res
      .status(error.cause || 500)
      .json({ message: error.message, success: false });
  }
};

//2-upload profile picture

export const uploadProfilePicture = async (req, res, next) => {
  //req.file becouse we are using multer & single

  //delete old picture
  if(req.user.profilePicture){
  fs.unlink(req.user.profilePicture);
  } // if user has profile picture delete it


  //update user login profilePic= PATH >>req.file
  const token = req.headers.authorization;
  const { id } = verifyToken(token);
  const userExist = await User.findByIdAndUpdate(
    id,
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
  return res
    .status(200)
    .json({
      message: "your pictute uploaded successfully",
      success: true,
      data: userExist,
    });
};

export const uploadprofilePictureCloud =async (req,res,next)=>{
//get data from user

const user = req.user;
const file = req.file;

//delete old picture

await cloudinary.uploader.destroy(user.profilePic.public_id)

// upload new picture
const {secure_url,public_id}  = await cloudinary.uploader.upload(req.file.path,{
  folder:`users/${user._id}/profile-pic`
})

//update into db
await User.updateOne({_id:req.user._id},{profilePic:{secure_url,public_id}})


  //send response
  return res
    .status(200)
    .json({
      message: "your pictute uploaded successfully",
      success: true,
      data: {secure_url,public_id},
    });
}