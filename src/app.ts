import { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import express from "express"
import { HttpError } from "http-errors";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant.routes";
import userRouter from "./routes/userRoutes";
import cookieParser from "cookie-parser";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.json())
app.use("/auth", authRouter)
app.use("/tenants", tenantRouter)
app.use("/users", userRouter)
// app.use("/tenants", tenantR)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(globalErrorHandler)

export default app;
