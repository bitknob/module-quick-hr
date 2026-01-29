import { Request, Response } from 'express';
import { z } from 'zod';
import { PricingPlan } from '../models/PricingPlan.model';
import { ResponseFormatter, logger } from '@hrm/common';

const CreatePricingPlanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0, 'Monthly price must be non-negative'),
  yearlyPrice: z.number().min(0, 'Yearly price must be non-negative'),
  features: z.array(z.object({
    name: z.string(),
    included: z.boolean()
  })).min(1, 'At least one feature is required'),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0)
});

const UpdatePricingPlanSchema = CreatePricingPlanSchema.partial();

export class PricingPlanController {
  static async getAllPricingPlans(req: Request, res: Response) {
    try {
      const { activeOnly = 'true' } = req.query;
      
      const whereClause = activeOnly === 'true' ? { isActive: true } : {};
      
      const pricingPlans = await PricingPlan.findAll({
        where: whereClause,
        order: [['sortOrder', 'ASC'], ['name', 'ASC']]
      });

      ResponseFormatter.success(
        res,
        { pricingPlans },
        'Pricing plans retrieved successfully'
      );
    } catch (error) {
      logger.error('Error fetching pricing plans:', error);
      ResponseFormatter.error(res, 'Failed to fetch pricing plans', '', 500);
    }
  }

  static async getPricingPlanById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const planId = parseInt(id, 10);
      
      if (isNaN(planId)) {
        return ResponseFormatter.error(res, 'Invalid pricing plan ID', '', 400);
      }
      
      const pricingPlan = await PricingPlan.findByPk(planId);
      
      if (!pricingPlan) {
        return ResponseFormatter.error(res, 'Pricing plan not found', '', 404);
      }

      ResponseFormatter.success(
        res,
        { pricingPlan },
        'Pricing plan retrieved successfully'
      );
    } catch (error) {
      logger.error('Error fetching pricing plan:', error);
      ResponseFormatter.error(res, 'Failed to fetch pricing plan', '', 500);
    }
  }

  static async createPricingPlan(req: Request, res: Response) {
    try {
      const validatedData = CreatePricingPlanSchema.parse(req.body);
      
      const existingPlan = await PricingPlan.findOne({ 
        where: { name: validatedData.name } 
      });
      
      if (existingPlan) {
        return ResponseFormatter.error(res, 'Pricing plan with this name already exists', '', 409);
      }

      const pricingPlan = await PricingPlan.create(validatedData);

      ResponseFormatter.success(
        res,
        { pricingPlan },
        'Pricing plan created successfully'
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ResponseFormatter.error(
          res,
          'Validation error',
          JSON.stringify(error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))),
          400
        );
      }

      logger.error('Error creating pricing plan:', error);
      ResponseFormatter.error(res, 'Failed to create pricing plan', '', 500);
    }
  }

  static async updatePricingPlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const planId = parseInt(id, 10);
      
      if (isNaN(planId)) {
        return ResponseFormatter.error(res, 'Invalid pricing plan ID', '', 400);
      }
      
      const validatedData = UpdatePricingPlanSchema.parse(req.body);

      const pricingPlan = await PricingPlan.findByPk(planId);
      
      if (!pricingPlan) {
        return ResponseFormatter.error(res, 'Pricing plan not found', '', 404);
      }

      if (validatedData.name && validatedData.name !== pricingPlan.name) {
        const existingPlan = await PricingPlan.findOne({ 
          where: { name: validatedData.name } 
        });
        
        if (existingPlan) {
          return ResponseFormatter.error(res, 'Pricing plan with this name already exists', '', 409);
        }
      }

      await pricingPlan.update(validatedData);

      ResponseFormatter.success(
        res,
        { pricingPlan },
        'Pricing plan updated successfully'
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ResponseFormatter.error(
          res,
          'Validation error',
          JSON.stringify(error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))),
          400
        );
      }

      logger.error('Error updating pricing plan:', error);
      ResponseFormatter.error(res, 'Failed to update pricing plan', '', 500);
    }
  }

  static async deletePricingPlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const planId = parseInt(id, 10);
      
      if (isNaN(planId)) {
        return ResponseFormatter.error(res, 'Invalid pricing plan ID', '', 400);
      }

      const pricingPlan = await PricingPlan.findByPk(planId);
      
      if (!pricingPlan) {
        return ResponseFormatter.error(res, 'Pricing plan not found', '', 404);
      }

      await pricingPlan.destroy();

      ResponseFormatter.success(
        res,
        null,
        'Pricing plan deleted successfully'
      );
    } catch (error) {
      logger.error('Error deleting pricing plan:', error);
      ResponseFormatter.error(res, 'Failed to delete pricing plan', '', 500);
    }
  }

  static async togglePricingPlanStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const planId = parseInt(id, 10);
      
      if (isNaN(planId)) {
        return ResponseFormatter.error(res, 'Invalid pricing plan ID', '', 400);
      }

      const pricingPlan = await PricingPlan.findByPk(planId);
      
      if (!pricingPlan) {
        return ResponseFormatter.error(res, 'Pricing plan not found', '', 404);
      }

      await pricingPlan.update({ isActive: !pricingPlan.isActive });

      ResponseFormatter.success(
        res,
        { pricingPlan },
        `Pricing plan ${pricingPlan.isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      logger.error('Error toggling pricing plan status:', error);
      ResponseFormatter.error(res, 'Failed to toggle pricing plan status', '', 500);
    }
  }
}
