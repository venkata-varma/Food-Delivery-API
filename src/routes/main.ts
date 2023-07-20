import express from "express";
import authRoute from "./user";
import restRoute from "./restaurants";
import catRoute from "./category";
import foodRoute from "./food";
import couponRoute from './couponRoute'
const mainRouter = express.Router();

mainRouter.use("/account", authRoute);
mainRouter.use("/", restRoute);
mainRouter.use("/", catRoute);
mainRouter.use("/", foodRoute);
mainRouter.use('/', couponRoute)

export default mainRouter;
