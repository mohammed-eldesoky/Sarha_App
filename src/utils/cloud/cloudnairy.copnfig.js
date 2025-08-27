import {v2 as cloudinary} from "cloudinary";


cloudinary.config({
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET,
  cloud_name:process.env.CLOUD_NAME,  
})

// upload 1 file
export async function  uploadFile ({path,options}) {
  return await cloudinary.uploader.upload(path,options); 
}

//upload multiple files
// export async function uploadFiles (files,options) {

//     let attchment = [];
    
//   if (!files || files.length === 0) {
//     return attchment; // return empty array if no files
//   }
//     for (const file of files) {
//       const { secure_url, public_id } = await uploadFile({path:file.path,options});
//       attchment.push({ secure_url, public_id });
//     }
//     return attchment;
// }

export async function uploadFiles(input, options) {
  let files = [];

  // single or  multiple
  if (!input) return [];
  if (Array.isArray(input)) {
    files = input;
  } else {
    files = [input]; // single file
  }

  const attachments = [];
  for (const file of files) {
    const { secure_url, public_id } = await uploadFile({ path: file.path, options });
    attachments.push({ secure_url, public_id });
  }
  return attachments;
}

export default cloudinary; 
// export should after config