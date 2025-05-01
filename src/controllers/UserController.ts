import { Request, Response } from "express";
import { UserService } from "../services/newUserService";
import { User } from "../entity/User";

interface RequestWithTenant extends Request {
    user?: {
        tenantId?: number;
    };
}

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async create(req: RequestWithTenant, res: Response) {
        try {
            const userData = req.body;
            const tenantId = req.user?.tenantId;
            const user = await this.userService.create(userData, tenantId);
            return res.status(201).json(user);
        } catch (error) {
            return res.status(500).json({ message: "Error creating user", error });
        }
    }

    async findAll(req: RequestWithTenant, res: Response) {
        try {
            const tenantId = req.user?.tenantId;
            const limit = parseInt(req.query.perPage as string) || 6;
            let offset = parseInt(req.query.currentPage as string) || 0;
            if(offset){
                offset--;
            }
            const queryParams = req.query;
            const users = await this.userService.findAll(tenantId, limit, offset, queryParams);
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching users", error });
        }
    }

    async findOne(req: RequestWithTenant, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const tenantId = req.user?.tenantId;
            const user = await this.userService.findOne(id, tenantId);
            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching user", error });
        }
    }

    async update(req: RequestWithTenant, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const userData = req.body;
            const tenantId = req.user?.tenantId;
            const user = await this.userService.update(id, userData, tenantId);
            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ message: "Error updating user", error });
        }
    }

    async delete(req: RequestWithTenant, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const tenantId = req.user?.tenantId;
            const success = await this.userService.delete(id, tenantId);
            
            if (!success) {
                return res.status(404).json({ message: "User not found" });
            }
            
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: "Error deleting user", error });
        }
    }
} 