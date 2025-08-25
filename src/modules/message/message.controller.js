import { Router } from "express";
import * as messageService from "./message.service.js";
import { fileUpload } from "./../../utils/multer/multer.cloud.js";
import { isValid } from "./../../middlewares/validation.middleware.js";
import { sendMessageSchema } from "./message.validation.js";

const router = Router();
//sarha.com/message/549894859489584
router.post(
  "/:receiver",
  fileUpload().array("attachments", 2),
  isValid(sendMessageSchema),
messageService.sendMessage

);

export default router;
