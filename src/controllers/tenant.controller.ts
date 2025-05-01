import { Request, Response } from 'express';
import { TenantService } from '../services/tenant.service';
import logger from '../config/logger';
import { TenantParams } from '../types';

export class TenantController {
    private tenantService: TenantService;

    constructor() {
        this.tenantService = new TenantService();
    }

    async createTenant(req: Request, res: Response) {
        try {
            const tenant = await this.tenantService.createTenant(req.body);
            res.status(201).json(tenant);
        } catch (error) {
            logger.error('Failed to create tenant:', error);
            res.status(400).json({ error: 'Failed to create tenant' });
        }
    }

    async getTenant(req: Request, res: Response) {
        try {
            const tenant = await this.tenantService.getTenantById(Number(req.params.id));
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }
            res.json(tenant);
        } catch (error) {
            logger.error('Failed to get tenant:', error);
            res.status(400).json({ error: 'Failed to get tenant' });
        }
    }

    async getAllTenants(req: Request, res: Response) {
        try {
            const queryParams: TenantParams = req.query;
            const tenants = await this.tenantService.getAllTenants(queryParams);
            res.json(tenants);
        } catch (error) {
            logger.error('Failed to get tenants:', error);
            res.status(400).json({ error: 'Failed to get tenants' });
        }
    }

    async updateTenant(req: Request, res: Response) {
        try {
            const tenant = await this.tenantService.updateTenant(Number(req.params.id), req.body);
            if (!tenant) {
                return res.status(404).json({ error: 'Tenant not found' });
            }
            res.json(tenant);
        } catch (error) {
            logger.error('Failed to update tenant:', error);
            res.status(400).json({ error: 'Failed to update tenant' });
        }
    }

    async deleteTenant(req: Request, res: Response) {
        try {
            const success = await this.tenantService.deleteTenant(Number(req.params.id));
            if (!success) {
                return res.status(404).json({ error: 'Tenant not found' });
            }
            res.status(204).send();
        } catch (error) {
            logger.error('Failed to delete tenant:', error);
            res.status(400).json({ error: 'Failed to delete tenant' });
        }
    }
} 