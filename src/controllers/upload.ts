import express, { Request, Response } from "express";
import multer from "multer";
const router = express.Router();
import path from "path";
router.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

router.use(
  express.json({
    limit: "50mb",
  })
);

export const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req: Request, file: any, cb: any) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("Only jpg, jpeg, png"), false);
      return;
    }
    cb(null, true);
  },
} as any);






















var stp:any = multer.diskStorage({

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname).replace(/\\/g, "/"))
  }
})
var uploadm:any = multer({
  storage: stp,
  limits: {
    fileSize: 90000000
  },
  fileFilter(req:any, file:any, cb:any) {
    if (!file.originalname.match(/\.(jpg |jpeg|png)$/)) {
      return cb(new Error('Please Upload jpg, jpeg,png files only'))
    }
    cb(undefined, true)
  }
}as any );
export const uploadM = upload.fields([{ name: 'image0' }, { name: 'image1' }, { name: 'image2' }, { name: 'image3' }, { name: 'image4' }])
export const uploadT = upload.fields([{ name: 'image0' }, { name: 'image1' }, { name: 'image2' }])