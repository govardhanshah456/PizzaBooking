import { Repository } from "typeorm"
import { User } from "../entity/User"
import { UserData } from "../types"
import { Logger } from "winston"
import { Roles } from "../constants"

export class UserService {
    constructor(private userRepo: Repository<User>) { }
    async create({ firstName, lastName, email, password }: UserData, logger: Logger) {
        try {
            const user = await this.userRepo.save({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER
            })
            logger.info(`User Created Successfully`)
            return user
        } catch (error) {
            logger.info(`Some Error Ocucred while saving suer in db.`)
            logger.error(error)
            throw error;
        }

    }
}