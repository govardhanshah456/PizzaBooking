import { NextFunction, Response, Request } from "express";
import { AuthRequest, LoginUserRequest, ProcessingFor, RegisterUserRequest } from "../types";
import { UserService } from "../services/userService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";
import fs from "fs"
import { Config } from "../config";
import { refreshTokenService } from "../services/refreshTokenService";
import { AppDataSource } from "../data-source";
import { RefreshToken } from "../entity/RefreshToken";

export class AuthController {
    constructor(private userService: UserService, private logger: Logger) { }
    private async processTokens(user: any, next: NextFunction, res: Response, processingFor: ProcessingFor) {
        const payload: JwtPayload = {
            sub: String(user.id),
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }
        let privateKey = '';
        try {
            if (!Config.PRIVATE_KEY) {
                next(createHttpError(500, "SECRET_KEY not found"))
                return;
            }
            privateKey = Config.PRIVATE_KEY;
        } catch (error) {
            const errorMsg = 'Error while reading private key pem file.';
            this.logger.error(errorMsg)
            this.logger.error(error)
            next(createHttpError(500, errorMsg))
            return;
        }
        const accessToken = sign(payload, privateKey, {
            algorithm: 'RS256',
            issuer: 'auth-service',
            expiresIn: '1m'
        })
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60
        })
        const refreshTokenDB = await new refreshTokenService(AppDataSource.getRepository(RefreshToken)).create(user);
        this.logger.info(payload)
        this.logger.info(Config)
        const updatedPayload = {
            ...payload,
            id: String(refreshTokenDB.id)
        }
        const refreshToken = sign(updatedPayload, Config.REFRESH_TOKEN_SECRET as string, {
            algorithm: 'HS256',
            issuer: 'auth-service',
            expiresIn: '1y',
            jwtid: String(refreshTokenDB.id)
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 365
        })
    }
    async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const resp = validationResult(req);
        if (!resp.isEmpty()) {
            const error = createHttpError(400, resp.array()[0].msg as string)
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
            await this.processTokens(user, next, res, ProcessingFor.REGISTER);
            this.logger.info(`Sending Response To Client.`)
        } catch (error) {
            this.logger.info(`Error Occured.`)
            next(error);
            return;
        }
        res.status(201).json(user)
    }
    async login(req: LoginUserRequest, res: Response, next: NextFunction) {
        const resp = validationResult(req);
        if (!resp.isEmpty()) {
            const error = createHttpError(400, resp.array()[0].msg as string)
            next(error)
            return;
        }
        const { email, password } = req.body
        this.logger.info(`Email->${email}`)
        let user;

        try {
            user = await this.userService.getByEmail(email, this.logger);
            if (!user) {
                this.logger.info(`User with email ${email} not found.`)
                const error = createHttpError(400, "User with this email ID does not exist");
                next({ '0': { msg: error.message, type: "Login" }, statusCode: error.statusCode });
                return;
            }
            const passwordVerification = await this.userService.comparePassword(password
                , user.password,
                this.logger
            )
            if (!passwordVerification) {
                const error = createHttpError(400, "Incorrect Password.");
                this.logger.info(error)
                next({ '0': { msg: error.message, type: "Login" } });
                return;
            }
            await this.processTokens(user, next, res, ProcessingFor.LOGIN);
            this.logger.info(`Sending Response To Client.`)
            // res.status(200).json(user)
        } catch (error) {
            this.logger.info(`Error Occured.`)
            next(error);
            return;
        }
        res.status(200).json(user)
    }
    async me(req: AuthRequest, res: Response) {
        const { sub: id } = req.auth
        const user = await this.userService.getById(id, this.logger)
        res.json(user)
    }
    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { sub: id } = req.auth
            const user = await this.userService.getById(id, this.logger)
            if (!user) {
                next(createHttpError(404, "User not found"))
                return;
            }
            await AppDataSource.getRepository(RefreshToken).delete({ id: Number(req.auth.id) })
            await this.processTokens(user, next, res, ProcessingFor.REFRESH_TOKEN)
            res.status(200).json({ id: user?.id })
        } catch (error) {
            next(error);
            return;
        }

    }
    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await AppDataSource.getRepository(RefreshToken).delete({ id: Number(req.auth.id) })
            this.logger.info(`User with ID ${req.auth.sub} logged out.`)
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')
            res.status(200).json({ msg: "Logged out successfully" })
        } catch (error) {
            next(error)
            return;
        }

    }
}