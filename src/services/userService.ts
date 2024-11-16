import { Repository } from "typeorm"
import { User } from "../entity/User"
import { UserData } from "../types"

export class UserService {
    constructor(private userRepo: Repository<User>) { }
    async create({ firstName, lastName, email, password }: UserData) {

        await this.userRepo.save({
            firstName,
            lastName,
            email,
            password
        })
    }
}