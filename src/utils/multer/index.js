import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";
import fs from "fs"
// file apload
export function fileUpload({folder,allowtype=["image/jpeg","image/png"]}={}) {
  const storage = diskStorage({
    destination: (req, file, cb) => {
      let dest = `uploads/${req.user._id}/${folder}`;
      if(!fs.existsSync(dest)){
      fs.mkdirSync(dest,{recursive:true});
      }
      cb(null, dest);
    }, //any name you want

    filename: (req, file, cb) => {
      if (file.mimetype == "applicaion/json") {
        cb(new Error("invalid file format ", { cause: 400 })); //global error
      }
      cb(null, nanoid({ length: 5 }) + "_" + file.originalname); //create unique filename
    },
  });

  //file filter
  const fileFilter = (req, file, cb) => {
    if (allowtype.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("invalid file format ", { cause: 400 })); //global error
    }
  };

  return multer({ fileFilter, storage }); // new multer()
}
