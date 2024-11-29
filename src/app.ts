import { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import express from "express"
import { HttpError } from "http-errors";
import authRouter from "./routes/auth";
import "reflect-metadata"
const app = express();
app.use(express.json())
app.use("/auth", authRouter)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    const errors: {
        type: string;
        msg: string;
    }[] = []
    for (let i = 0; ; i++) {
        if (!Object.prototype.hasOwnProperty.call(err, i)) {
            break;
        }
        else {
            const errr: HttpError = err;
            const error = {
                type: errr?.name,
                msg: errr?.message,
            }
            errors.push(error);
        }
    }
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
        errors: errors
    })
})

export default app;
