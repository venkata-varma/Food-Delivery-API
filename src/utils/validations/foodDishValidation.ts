import { NextFunction, Request, Response } from "express";

export const foodDishValidate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors: any = [];
    const { dishName, category, cuisine, weight,veg,description , currency} = req.body;

    if (!dishName) {
        errors.push({ message: "Dish field is required" });
    }
    if (!category) {
        errors.push({ message: "FoodCat field is required" });
    }
    if (!cuisine) {
        errors.push({ message: "Cuisine field is required" });
    }
    if (!weight) {
        errors.push({ message: "Weight field is required" });
    }
    if (!veg) {
        errors.push({ message: "Veg field is required" });
    }
    if (!description) {
        errors.push({ message: "Description field is required" });
    }
    if (!currency) {
        errors.push({ message: "Currency field is required" });
    }
    errors.length ? res.status(400).json({ status: "false", errors }) : next();
};
