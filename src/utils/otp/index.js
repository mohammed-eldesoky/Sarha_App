/**
 * @param {*} expireTime - The time in milliseconds 
 * @returns {Object} - An object containing the generated OTP and its expiration time
 * 
*/
export const generateOtp = (expireTime=15 * 60 * 1000) => {
  const otp = Math.floor(Math.random() * 90000 + 10000); // generate a random 5-digit otp min: 10000, max: 99999
    const otpExpiration = Date.now() + expireTime; // set expiration time for 5 minutes

    return { otp, otpExpiration };
};

