import { expressjwt, GetVerificationKey } from "express-jwt";
import { Request } from "express";
import jwksClient from "jwks-rsa";
import { Config } from "../config";
import { AuthCookie, IResponseJwtPayload } from "../types";
import logger from "../config/logger";
import { AppDataSource } from "../data-source";
import { RefreshToken } from "../entity/RefreshToken";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {

        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as IResponseJwtPayload).id),
                    user: {
                        id: Number(token?.payload?.sub)
                    }
                }
            })
            return refreshToken === null;
        } catch (error) {
            logger.error(error);
            logger.error(`ID: ${(token?.payload as IResponseJwtPayload).id}`)
        }
        return false;
    }
});
