import { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import express from "express"
import { HttpError } from "http-errors";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant.routes";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.json())
app.use("/auth", authRouter)
app.use("/tenants", tenantRouter)
// app.use("/tenants", tenantR)
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            const errr: any = (err as any)[i];

            // console.log(errr)
            const error = {
                type: errr?.location,
                msg: errr?.msg,
            }
            errors.push(error);
        }
    }
    const statusCode = err.statusCode || err.status || 500
    res.status(statusCode).json({
        errors: [...errors, err?.inner?.message ? err?.inner?.message : '']
    })
})

export default app;
