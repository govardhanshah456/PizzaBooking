import express, { NextFunction, Request, RequestHandler, Response } from "express"
import { AuthController } from "../controllers/authController";
import { UserService } from "../services/userService";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import { body } from "express-validator";
import { AuthRequest } from "../types";
import authMiddleware from "../middlewares/authMiddleware";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";

const authRouter = express.Router();
const userRepo = AppDataSource.getRepository(User)
const userService = new UserService(userRepo);
const authController = new AuthController(userService, logger)

const registerValidationRules = [
    body("email").notEmpty().trim().isEmail().withMessage("Valid email is required"),
    body("firstName").notEmpty().withMessage("First name is required").trim(),
    body("lastName").notEmpty().withMessage("Last name is required").trim(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
];

const loginValidationRules = [
    body("email").notEmpty().trim().isEmail().withMessage("Valid email is required"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

authRouter.post("/register", registerValidationRules, (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next))
authRouter.post("/login", loginValidationRules, (req: Request, res: Response, next: NextFunction) => authController.login(req, res, next))
authRouter.get("/me", authMiddleware as RequestHandler, (req: Request, res: Response) => authController.me(req as AuthRequest, res))
authRouter.post("/refresh", validateRefreshToken as RequestHandler, (req: Request, res: Response, next: NextFunction) => authController.refresh(req as AuthRequest, res, next))
authRouter.post("/logout", [authMiddleware as RequestHandler, parseRefreshToken as RequestHandler], (req: Request, res: Response, next: NextFunction) => authController.logout(req as AuthRequest, res, next))
export default authRouter