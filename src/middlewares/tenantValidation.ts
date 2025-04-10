import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const tenantValidationRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .bail()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required')
        .bail()
        .isLength({ min: 5 })
        .withMessage('Address must be at least 5 characters long'),
];

export const validateTenant = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
}; 