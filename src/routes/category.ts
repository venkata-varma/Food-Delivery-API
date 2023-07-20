const express = require("express");
const router = express.Router();
import { upload } from "../controllers/upload";
import * as category from "../controllers/category";

router.post("/add-category", upload.single("image"), category.categoryCreate);
router.get("/get-all-categories", category.getCat);
router.patch("/category-update/:id", upload.single("image"), category.editCat, (err: any, req: any, res: any, next: any) => {
    res.status(404).json({
        success: false,
        message: "Some error found",
        error: err.message
    })
}   );





router.delete("/category-delete/:id", category.deleteCat);
router.get("/category/:id", category.getCatById);

export default router;
