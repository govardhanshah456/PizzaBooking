import { AppDataSource } from '../data-source';
import { Tenant } from '../entity/Tenant';
import { Repository } from 'typeorm';

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

    async getAllTenants(): Promise<Tenant[]> {
        return await this.tenantRepository.find();
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