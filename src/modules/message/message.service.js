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
