import express from "express"
import { AuthController } from "../controllers/authController";
import { UserService } from "../services/userService";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

const authRouter = express.Router();
const userRepo = AppDataSource.getRepository(User)
const userService = new UserService(userRepo);
const authController = new AuthController(userService)
authRouter.post("/register", (req, res) => authController.register(req, res))

export default authRouter