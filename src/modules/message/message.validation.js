import joi from "joi";


export const sendMessageSchema =joi.object({
    content: joi.string().min(5).max(1000),
    
    // params
    nickName: joi
      .string()
      .min(3)
      .max(30)
      .lowercase()
      .pattern(/^[a-z0-9_]+$/)
      .required(),
     sender:joi.string().hex().length(24),

}).required()


// schema for get specific message
export const getMessageSchema = joi.object({
    id: joi.string().hex().length(24).required()
}).required();