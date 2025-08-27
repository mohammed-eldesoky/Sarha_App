import cloudinary, {
  uploadFiles,
} from "./../../utils/cloud/cloudnairy.copnfig.js";
import { Message } from "./../../DB/models/message.model.js";
//send message


export const sendMessage = async (req, res, next) => {

    // get data from req
    const { content } = req.body;
    const { receiver } = req.params;

    // if send file or files 
    const attachments = await uploadFiles(req.files || req.file, {
      folder: `${receiver}/message`,
    });
    // create message in DB
    const messageCreate = await Message.create({
      content,
      receiver,
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
