import bcrypt  from 'bcrypt';
//hash
export const hashPassword = (password)=>{
    return bcrypt.hashSync(password,10)
}


// compare
export const comparePassword = (password,hashPassword)=>{
return bcrypt.compareSync(password,hashPassword)

}