export const isValid =(schema)=>{
return (req,res,next)=>{


  const { value, error } = schema.validate(req.body,{abortEarly:false});
  if (error) {
  
    let errorMessages= error.details.map(err=>{
      return err.message
    })
    errorMessages= errorMessages.join(", ")
    
    throw new Error(errorMessages, { cause: 404 });
  }


 //call next 
 next() 
 }
 
}
