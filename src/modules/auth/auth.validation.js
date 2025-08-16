import joi from "joi"
 // validation

export const registerSchema =joi.object({
    fullName: joi.string().min(3).max(50).required(),
    email: joi.string().email(), //optional if phoneNumber exist
    password: joi
      .string()
      .regex(/^[a-zA-Z0-9]{8,30}$/)
      .required(),
    phoneNumber: joi.string().length(11), //optional if email exist
    dob: joi.date(),
  }).or("email","phoneNumber")

 
