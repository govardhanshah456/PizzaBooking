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
            logger.info("Reached upto here, just checking -4")
            const existingUser = await this.userRepo.findOne({
                where: {
                    email
                }
            })
            logger.info("Reached upto here, just checking -3")
            if (existingUser) {
                const error = createHttpError(400, 'User already exist')
                throw error
            }
            logger.info("Reached upto here, just checking -1")
            const user = await this.userRepo.save({
                firstName,
                lastName,
                email,
                password: passwordHash,
                role: Roles.CUSTOMER
            })
            logger.info("Reached upto here, just checking -2")
            logger.info(`User Created Successfully`)

            return user
        } catch (error) {
            logger.info(`Some Error Ocucred while saving user in db.`)
            logger.error(error)
            throw error;
        }

    }

    async getByEmail(email: string, logger: Logger) {
        try {
            const existingUser = await this.userRepo.findOne({
                where: {
                    email
                }
            })
            return existingUser
        } catch (error) {
            logger.info(`Some Error Ocucred while saving user in db.`)
            logger.error(error)
            throw error;
        }
    }

    async comparePassword(password: string, hashedPassword: string, logger: Logger) {

        try {
            return await bcrypt.compare(password, hashedPassword)
        } catch (error) {
            logger.error("Error Occured While Bcrypt Password verification.")
            logger.error(error)
            throw new Error((error as any).message);
        }
    }
}