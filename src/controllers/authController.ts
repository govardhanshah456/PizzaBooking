import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/userService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";


export class AuthController {
    constructor(private userService: UserService, private logger: Logger) { }
    async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const resp = validationResult(req);
        if (!resp.isEmpty()) {
            // console.log(resp.array())
            const error = createHttpError(400, resp.array())
            // console.log(error)
            next(error)
            return;
        }
        const { firstName, lastName, email, password } = req.body
        this.logger.info(`FirstName->${firstName}`)
        this.logger.info(`LastName->${lastName}`)
        this.logger.info(`Email->${email}`)
        let user;

        try {
            user = await this.userService.create({ firstName, lastName, email, password }, this.logger)
            this.logger.info(`Sending Response To Client.`)
        } catch (error) {
            this.logger.info(`Error Occured.`)
            next(error);
            return;
        }
        res.status(201).json(user)
    }
}