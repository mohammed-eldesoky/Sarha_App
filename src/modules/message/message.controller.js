import { Router } from "express";
import * as messageService from "./message.service.js";
import { fileUpload } from "./../../utils/multer/multer.cloud.js";
import { isValid } from "./../../middlewares/validation.middleware.js";
import { getMessageSchema, sendMessageSchema } from "./message.validation.js";
import { isAuthorized } from "./../../middlewares/auth.middleware.js";

const router = Router();
//sarha.com/message/549894859489584
router.post(
  "/:receiver",
  fileUpload().array("attachments", 2),
  isValid(sendMessageSchema),
  messageService.sendMessage
);

// another endpoint for send message with sender info
router.post(
  "/:receiver",
  isAuthorized,
  fileUpload().array("attachments", 2),
  isValid(sendMessageSchema),
  messageService.sendMessage
);

// get specific message
router.get(
  "/:id",
  isAuthorized,
  isValid(getMessageSchema),
  messageService.getMessage
);

export default router;
