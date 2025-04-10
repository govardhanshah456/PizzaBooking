import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Roles } from '../constants';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    
    if (!authReq.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (authReq.auth.role !== Roles.ADMIN) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
}; 