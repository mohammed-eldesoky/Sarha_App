import multer, { diskStorage } from "multer";

// file apload
export function fileUpload({allowtype=["image/jpeg","image/png"]}={}) {
  const storage = diskStorage({}); // TEMB =>  random file name

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
