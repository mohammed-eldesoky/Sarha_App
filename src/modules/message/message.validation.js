import joi from "joi";


export const sendMessageSchema =joi.object({
    content: joi.string().min(5).max(1000),
    receiver:joi.string().hex().length(24).required(),//params
     sender:joi.string().hex().length(24),

}).required()