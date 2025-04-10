import { Router, RequestHandler } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import authMiddleware from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { tenantValidationRules, validateTenant } from '../middlewares/tenantValidation';

const router = Router();
const tenantController = new TenantController();

// Create bound methods to preserve 'this' context
const createTenant = tenantController.createTenant.bind(tenantController);
const getAllTenants = tenantController.getAllTenants.bind(tenantController);
const getTenant = tenantController.getTenant.bind(tenantController);
const updateTenant = tenantController.updateTenant.bind(tenantController);
const deleteTenant = tenantController.deleteTenant.bind(tenantController);

// Only admin can create, update, and delete tenants
router.post('/', 
    authMiddleware as RequestHandler, 
    adminMiddleware as RequestHandler,
    tenantValidationRules,
    validateTenant,
    createTenant as RequestHandler
);

router.get('/', authMiddleware as RequestHandler, getAllTenants as RequestHandler);
router.get('/:id', authMiddleware as RequestHandler, getTenant as RequestHandler);

router.put('/:id', 
    authMiddleware as RequestHandler, 
    adminMiddleware as RequestHandler,
    tenantValidationRules,
    validateTenant,
    updateTenant as RequestHandler
);

router.delete('/:id', authMiddleware as RequestHandler, adminMiddleware as RequestHandler, deleteTenant as RequestHandler);

export default router; 