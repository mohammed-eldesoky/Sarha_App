import cloudinary, {
  uploadFiles,
} from "./../../utils/cloud/cloudnairy.copnfig.js";
import { Message } from "./../../DB/models/message.model.js";
//send message

export const sendMessage = async (req, res, next) => {
  //get data from req
  const { content } = req.body;
  const { receiver } = req.params;
  const { files } = req;
  //upload into cloudinary
  const attchment = await uploadFiles({
    files,
    options: { folder: `${receiver}/message` },
  });

  //create message into db
  const messageCreate = Message.create({
    content,
    receiver,
    attchment,
    sender: req.user?._id, // if sender exists
  });
  //send response
  return res.status(200).json({
    message: "message sent successfully",
    success: true,
    data: messageCreate,
  });
};

// get specific message
export const getMessage = async (req, res, next) => {
  //get message id from params
  const { messageId } = req.params;

  //find message
  const message = await Message.findOne(
    { _id: messageId, receiver: req.user._id },
    {},
    { populate: [{ path: "sender", select: "-password -createdAt -updatedAt -_v" } ]}
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
