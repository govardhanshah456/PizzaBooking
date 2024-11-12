import express from "express"
import { AuthController } from "../controllers/authController";

const authRouter = express.Router();

authRouter.post("/register", (req, res) => new AuthController().register(req, res))

export default authRouter