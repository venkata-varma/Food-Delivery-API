import { Request, Response } from "express";
import categorySchema from "../models/category";
let cloud = require("../utils/cloudinary");

export const categoryCreate = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const findCat: any = await categorySchema.findOne({ title: title });
    if (findCat) {
      throw "Category already exists";
    }
    let creatCat = await categorySchema.create({ title: title });
    if (req.file) {
      let result = await cloud.uploader.upload(req.file.path);
      creatCat.image = result.secure_url;
    }
    await creatCat.save();
    return res.status(200).json({ message: "Restaurant added", creatCat });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const getCat = async (req: Request, res: Response) => {
  try {
    const category = await categorySchema.find({});
    return res
      .status(200)
      .json({ total: category.length, categories: category });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const getCatById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await categorySchema.findOne({ _id: id });
    return res
      .status(200)
      .json({ categories: category });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const editCat = async (req: Request, res: Response) => {
  
    const { id } = req.params;
    const findCatToEdit: any = await categorySchema.findOne({ _id: id });
    if (req.file) {
      const result = await cloud.uploader.upload(req.file.path);
      var fimage = result.secure_url;
      var fcid = result.public_id;
    }
    let updated = await categorySchema.updateOne({ _id: findCatToEdit._id }, { $set: { image: fimage, cloudinaryId: fcid, ...req.body } }, { new: true, runValidators: true });

    return res.status(200).json({ updated: updated});
  
};

export const deleteCat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const findCatToDel: any = await categorySchema.deleteOne({
      _id: id,
    });
    if (findCatToDel.deletedCount > 0) {
      return res.status(200).json({ message: "category deleted!" });
    } else {
      return res.status(404).json({ message: "category not found!" });
    }
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};
