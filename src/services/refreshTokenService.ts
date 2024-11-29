import { Repository } from "typeorm";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";

export class refreshTokenService {
    constructor(private refreshTokenRepo: Repository<RefreshToken>) { }
    public async create(user: User) {
        const newRefreshToken = await this.refreshTokenRepo.save({
            user,
            expiresAt: new Date(Date.now() + (1000 * 60 * 60 * 365))
        })
        return newRefreshToken
    }
}