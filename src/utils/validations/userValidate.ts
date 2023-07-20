import { NextFunction, Request, Response } from "express";
import * as val from "../validation";

export const userValidationRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors: any = [];
  const { name, mobileNum, emailId, password, confirmPassword, state,city, country, address } = req.body;
  !val.isValid(name) && errors.push({ message: "name field is required" });
  !val.isValidPassword(password) &&
    errors.push({ message: "password field is required" });
  !val.isValidPassword(confirmPassword) &&
    errors.push({ message: "confirmPassword field is required" });
  !val.isValidEmail(emailId) &&
    errors.push({ message: "emailId is required!" });
  if (!state) {
    errors.push({ message: "state is required!" });
  }
  if (!city) {
    errors.push({ message: "city is required!" });
  }
  if (!country) {
    errors.push({ message: "country is required!" });
  }
  if (!address) {
    errors.push({ message: "address is required!" });
  }
  !val.isValidPhone(mobileNum) &&
    errors.push({ message: "mobileNum is required!" });
  errors.length ? res.status(400).json({ status: "false", errors }) : next();
};

export const userValidationLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors: any = [];
  const { mobileNum, password } = req.body;
  !val.isValidPassword(password) &&
    errors.push({ message: "password field is required" });
  !val.isValidPhone(mobileNum) &&
    errors.push({ message: "mobileNum is required!" });
  errors.length ? res.status(400).json({ status: "false", errors }) : next();
};


export const updateProfileValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors: any = [];
  const { name,mobileNum, emailId} = req.body;
  
  !val.isValidPhone(mobileNum) &&
    errors.push({ message: "Valid mobileNum is required!" });
  !val.isValidEmail(emailId) &&
    errors.push({ message: "Valid emailId is required!" });

    if(mobileNum.length!==10){
      errors.push({ message: "Mobile number should be of length  10"  })
    }
  !val.isValid(name) && errors.push({ message: "name field is required" })
  errors.length ? res.status(400).json({ status: "false", errors }) : next();
};


export const mobileNumValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors: any = [];
  const {  mobileNum} = req.body;

  !val.isValidPhone(mobileNum) &&
    errors.push({ message: "Valid mobileNum is required!" });

  if (mobileNum.length !== 10) {
    errors.push({ message: "Mobile number should be of length  10" })
  }

  errors.length ? res.status(400).json({ status: "false", errors }) : next();
};

