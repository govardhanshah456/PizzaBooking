import { Repository } from "typeorm"
import { User } from "../entity/User"
import { UserData } from "../types"
import { Logger } from "winston"
import { Roles } from "../constants"
import bcrypt from "bcrypt"
import createHttpError from "http-errors"
export class UserService {
    constructor(private userRepo: Repository<User>) { }
    async create({ firstName, lastName, email, password }: UserData, logger: Logger) {
        try {
            const passwordHash = await bcrypt.hash(password, 10)
            const existingUser = await this.userRepo.findOne({
                where: {
                    email
                }
            })
            if (existingUser) {
                const error = createHttpError(400, 'User already exist')
                throw error
            }
            const user = await this.userRepo.save({
                firstName,
                lastName,
                email,
                password: passwordHash,
                role: Roles.CUSTOMER
            })
            logger.info(`User Created Successfully`)
            return user
        } catch (error) {
            logger.info(`Some Error Ocucred while saving user in db.`)
            logger.error(error)
            throw error;
        }

    }
}