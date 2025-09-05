import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req,file)
    cb(null, "uploads/blogs"); // save to /uploads/blogs
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  }
});

// Allow images + PDF
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;   // added pdf
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images or PDF files are allowed!"));
  }
};

export const upload = multer({ storage, fileFilter });
