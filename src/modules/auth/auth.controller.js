import { Router } from "express";
import * as authService from "./auth.service.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { forgetPasswordSchema, loginSchema, registerSchema } from "./auth.validation.js";
import { fileUpload } from "../../utils/multer/index.js";
import { isAuthorized } from './../../middlewares/auth.middleware.js';
const router = Router();
router.post(
  "/register",
  isValid(registerSchema),
  fileUpload().none(),//parse data body >>form data
  authService.register
);

router.post("/login",isValid(loginSchema), authService.login);
router.post("/verify-account", authService.verifyAccount);
router.post("/send-otp", authService.sendOtp);
router.post("/google", authService.loginWithGoogle);
router.put("/update-password",isAuthorized,authService.updatePassword);
// router.post("/refresh",authService.refreshAccessToken)
router.put("/forget-password",isValid(forgetPasswordSchema),authService.forgetPassword)
router.post("/logout",isAuthorized,authService.logout)
export default router;