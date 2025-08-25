import joi from "joi";
import { fileUpload } from "../utils/multer/index.js";
export const isValid = (schema) => {
  return (req, res, next) => {
    let data =   { ...req.body, ...req.params, ...req.query }
    const { value, error } = schema.validate(data, { abortEarly: false });
    if (error) {
      let errorMessages = error.details.map((err) => {
        return err.message;
      });
      errorMessages = errorMessages.join(", ");

      throw new Error(errorMessages, { cause: 404 });
    }

    //call next
    next();
  };
};

export const generalFields = {
  fullName: joi.string().min(3).max(50),
  email: joi.string().email(),
  phoneNumber: joi.string().length(11),
  password: joi
    .string()
    .regex(/^[a-zA-Z0-9]{8,30}$/)
    .min(8)
    .max(20),
  name: joi.string().min(3).max(30),

  dob: joi.date(),
  otp: joi.string().length(5),
  repassword: joi.string().min(8).valid(joi.ref("password")), // should be equal to `password`
};
