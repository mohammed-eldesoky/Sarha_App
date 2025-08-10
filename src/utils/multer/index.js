import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";

// file apload
export function fileUpload() {
  const storage = diskStorage({
    destination: "uploads", //any name you want

    filename: (req, file, cb) => {
      if (file.mimetype == "applicaion/json") {
        cb(new Error("invalid file format ", { cause: 400 })); //global error
      }
      cb(null, nanoid({ length: 5 }) + "_" + file.originalname); //create unique filename
    },
  });

  //file filter
  const fileFilter = (req, file, cb) => {
    if (
      ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(new Error("invalid file format ", { cause: 400 })); //global error
    }
  };

  return multer({ fileFilter, storage }); // new multer()
}
