import { Router } from "express";
import * as authService from "./auth.service.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { registerSchema } from "./auth.validation.js";
import { fileUpload } from "../../utils/multer/index.js";
const router = Router();
router.post(
  "/register",
  isValid(registerSchema),
  fileUpload().none(),//parse data body >>form data
  authService.register
);

router.post("/login", authService.login);
router.post("/verify-account", authService.verifyAccount);
router.post("/resend-otp", authService.resendOtp);
router.post("/google", authService.loginWithGoogle);
router.put("/update-password",authService.updatePassword);
router.post("/refresh",authService.refreshAccessToken)
export default router;
