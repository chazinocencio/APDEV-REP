import multer from "multer";

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "src/uploads/profilepics/");
    },

    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }

});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {

        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images allowed"));
        }

    }
});

export default upload;