import { Router } from "express";
import * as userService from "./user.service.js";
import { fileUpload } from "../../utils/multer/index.js";
import { fileUpload as fileuploadCloud } from "../../utils/multer/multer.cloud.js";
import { fileValidation } from "./../../middlewares/file.validaion.js";
import { isAuthorized } from "./../../middlewares/auth.middleware.js";
const router = Router();
router.delete("/",isAuthorized, userService.deleteAcount);

router.post(
  "/upload-profile-picture",
  isAuthorized,
  fileUpload({ folder: "profile-pictures" }).single("profilePicture"),
  fileValidation(), //single ,array[{},{}], fields,none,any
  userService.uploadProfilePicture
);

router.post(
  "/upload-profile-cloud",
  isAuthorized,  // req >> req.user
  fileuploadCloud().single("profilePicture"),//req.file
  userService.uploadprofilePictureCloud
);
export default router;
