import { Router } from "express";
import * as userService from "./user.service.js";
import { fileUpload } from "../../utils/multer/index.js";
import { fileValidation } from './../../middlewares/file.validaion.js';
import { isAuthorized } from './../../middlewares/auth.middleware.js';
const router = Router();
router.delete("/", userService.deleteAcount);
// router.post(
//   "/upload-profile-picture",
//   fileUpload().single("profilePicture"),
//   isAuthorized,
//   fileValidation(), 
//   userService.uploadProfilePicture
// );
router.post(
  "/upload-profile-picture",
  isAuthorized,
  fileUpload().single("profilePicture"),
  fileValidation(),//single ,array[{},{}], fields,none,any
  userService.uploadProfilePicture
);

export default router;
