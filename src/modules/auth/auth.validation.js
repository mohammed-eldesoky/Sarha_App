import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";
// validation

export const registerSchema = joi
  .object({
    fullName: generalFields.fullName.required(),
    email: generalFields.email, //optional if phoneNumber exist
    password: generalFields.password,
    phoneNumber: generalFields.phoneNumber, //optional if email exist
    dob: generalFields.dob,
    nickName:generalFields.nickName
  })
  .or("email", "phoneNumber").required();

export const loginSchema = joi
  .object({
    email: generalFields.email,
    phoneNumber: generalFields.phoneNumber,
    password: generalFields.password,
  })
  .or("email", "phoneNumber").required();

export const forgetPasswordSchema = joi.object({
  email: generalFields.email.required(),

  otp: generalFields.otp.required(),
  newPassword: generalFields.password.required(),
});
