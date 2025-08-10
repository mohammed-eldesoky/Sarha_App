
import  jwt  from 'jsonwebtoken';
export const verifyToken= (token,secretkey="fhdfhdfhdfhdfhdfh")=>{

  return jwt.verify(token,secretkey)



}