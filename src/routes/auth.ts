import express from "express"
import { AuthController } from "../controllers/authController";
import { UserService } from "../services/userService";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import logger from "../config/logger";

const authRouter = express.Router();
const userRepo = AppDataSource.getRepository(User)
const userService = new UserService(userRepo);
const authController = new AuthController(userService, logger)
authRouter.post("/register", (req, res, next) => authController.register(req, res, next))

export default authRouter