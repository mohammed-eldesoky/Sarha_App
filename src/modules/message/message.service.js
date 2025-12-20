import cloudinary, {
  uploadFiles,
} from "./../../utils/cloud/cloudnairy.copnfig.js";
import { Message } from "./../../DB/models/message.model.js";
import { User } from "../../DB/models/user.model.js";
//send message
export const sendMessage = async (req, res, next) => {
  // get data from req
  const { content } = req.body;
  const { nickName } = req.params;

  // find user by nickname
  const user = await User.findOne({ nickName: nickName.toLowerCase() });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // if send file or files
  const attachments = await uploadFiles(req.files || req.file, {
    folder: `${user._id}/message`, 
  });
  // create message in DB
  const messageCreate = await Message.create({
    content,
    receiver: user._id,
    attachments,
    sender: req.user?._id, // if sender exists
  });

  // send response
  return res.status(200).json({
    message: "Message sent successfully",
    success: true,
    data: messageCreate,
  });
};

// get specific message
export const getMessage = async (req, res, next) => {
  //get message id from params
  const { id } = req.params;

  //find message
  const message = await Message.findOne(
    { _id: id, receiver: req.user._id },
    {},
    { populate: [{ path: "sender", select: "-password  -_v" }] }
  ); // return {}||null

  if (!message) {
    throw new Error("Message not found", { cause: 404 });
  }
  // send response
  return res.status(200).json({
    message: "message retrieved successfully",
    success: true,
    data: { message },
  });
};

// get all messages for specific user
export const getAllMessages = async (req, res, next) => {
  //get user id from req.user
  const userId = req.user._id;
  const messages = await Message.find(
    { receiver: userId },
    {},
    { populate: [{ path: "sender", select: "-password  -_v" }] }
  );
  //failcase of no messages
  if (!messages || messages.length === 0) {
    throw new Error("Message not found", { cause: 404 });
  }
  // send response
  return res.status(200).json({
    message: "messages retrieved successfully",
    success: true,
    data: { messages },
  });
};
