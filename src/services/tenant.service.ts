import { AppDataSource } from '../data-source';
import { Tenant } from '../entity/Tenant';
import { ILike, Repository } from 'typeorm';
import { TenantParams } from '../types';

export class TenantService {
    private tenantRepository: Repository<Tenant>;

    constructor() {
        this.tenantRepository = AppDataSource.getRepository(Tenant);
    }

    async createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
        const tenant = this.tenantRepository.create(tenantData);
        return await this.tenantRepository.save(tenant);
    }

    async getTenantById(id: number): Promise<Tenant | null> {
        return await this.tenantRepository.findOne({ where: { id } });
    }

    async getAllTenants(queryParams: TenantParams): Promise<{
          data: Tenant[];
          totalItems: number;
          currentPage: number;
          totalPages: number;
          limit: number;
        }> {
        const { q, currentPage:page = 1, perPage:limit = 6, sortBy:sort = 'id', sortOrder:order = 'ASC' } = queryParams;
        const skip = (page - 1) * limit;
        const take = limit;
        const where = q ? { name: ILike(`%${q}%`) } : {};
        const orderBy = { [sort]: order };
        const tenants = await this.tenantRepository.findAndCount({
            where,
            skip,
            take,
            order: orderBy,
        });
        return {
            data: tenants[0],
            totalItems: tenants[1],
            currentPage: page,
            totalPages: Math.ceil(tenants[1] / limit),
            limit: take,
        }
    }

    async updateTenant(id: number, tenantData: Partial<Tenant>): Promise<Tenant | null> {
        await this.tenantRepository.update(id, tenantData);
        return await this.getTenantById(id);
    }

    async deleteTenant(id: number): Promise<boolean> {
        const result = await this.tenantRepository.delete(id);
        return result.affected !== 0;
    }
} 