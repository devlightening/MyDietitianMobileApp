import { z } from 'zod';
import { MealType } from '../types/diet-plan';

// Meal schema
export const createMealSchema = z.object({
  type: z.nativeEnum(MealType),
  plannedRecipeId: z.string().uuid().optional(),
  customName: z.string().optional(),
  isMandatory: z.boolean().default(false),
}).refine(
  (data) => data.plannedRecipeId || data.customName,
  {
    message: 'Either plannedRecipeId or customName must be provided',
    path: ['plannedRecipeId'],
  }
);

// Day schema
export const createDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  dailyTargetCalories: z.number().int().positive().optional(),
  meals: z.array(createMealSchema).min(1, 'At least one meal is required per day'),
});

// Diet plan schema
export const createDietPlanSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  name: z.string().min(3, 'Plan name must be at least 3 characters').max(200, 'Plan name too long'),
  startDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Invalid start date'),
  endDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Invalid end date'),
  days: z.array(createDaySchema).min(1, 'At least one day is required'),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type CreateDietPlanFormData = z.infer<typeof createDietPlanSchema>;
