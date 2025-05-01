import { Repository } from "typeorm";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import * as bcrypt from "bcrypt";

export class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    async create(userData: Partial<User> & { password: string }, tenantId?: number): Promise<User> {
        if (!userData.password) {
            throw new Error("Password is required");
        }
        
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const userToCreate = {
            ...userData,
            password: hashedPassword,
            tenant: tenantId ? { id: tenantId } : undefined,
        };
        
        const user = this.userRepository.create(userToCreate);
        return this.userRepository.save(user);
    }

    async findAll(
        tenantId?: number,
        limit: number = 6,
        offset: number = 0,
      ): Promise<{
        data: User[];
        totalItems: number;
        currentPage: number;
        totalPages: number;
        limit: number;
      }> {
        const [data, totalItems] = await this.userRepository.findAndCount({
          where: {
            tenant: tenantId ? { id: tenantId } : undefined,
          },
          take: limit,
          skip: offset,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            tenant: {
              id: true,
            },
          },
          relations: ['tenant'],
        });
      
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(totalItems / limit);
      
        return {
          data,
          totalItems,
          currentPage,
          totalPages,
          limit,
        };
      }
      

    async findOne(id: number, tenantId?: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: {
                id,
                tenant: tenantId ? { id: tenantId } : undefined,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                tenant: {
                    id: true,
                },
            },
        });
    }

    async update(id: number, userData: Partial<User>, tenantId?: number): Promise<User | null> {
        const user = await this.findOne(id, tenantId);
        if (!user) return null;

        const updateData = { ...userData };
        
        if (userData.password) {
            updateData.password = await bcrypt.hash(userData.password, 10);
        }

        await this.userRepository.update(
            { id, tenant: tenantId ? { id: tenantId } : undefined },
            updateData
        );

        return this.findOne(id, tenantId);
    }

    async delete(id: number, tenantId?: number): Promise<boolean> {
        const result = await this.userRepository.delete({
            id,
            tenant: tenantId ? { id: tenantId } : undefined,
        });
        return result.affected ? result.affected > 0 : false;
    }
} 