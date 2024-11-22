import express, { NextFunction, Request, Response } from "express"
import { AuthController } from "../controllers/authController";
import { UserService } from "../services/userService";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import { body } from "express-validator";

const authRouter = express.Router();
const userRepo = AppDataSource.getRepository(User)
const userService = new UserService(userRepo);
const authController = new AuthController(userService, logger)
authRouter.post("/register", [body("email").notEmpty()], (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next))

export default authRouter