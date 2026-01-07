// TypeScript types matching backend DTOs

export enum MealType {
  Breakfast = 1,
  Lunch = 2,
  Dinner = 3,
  Snack = 4,
}

export enum DietPlanStatus {
  Active = 1,
  Completed = 2,
  Expired = 3,
  Draft = 4,
}

export interface DietPlanMeal {
  id: string;
  type: MealType;
  plannedRecipeId?: string;
  plannedRecipeName?: string;
  customName?: string;
  isMandatory: boolean;
}

export interface DietPlanDay {
  id: string;
  date: string; // ISO date string (DateOnly)
  dailyTargetCalories?: number;
  meals: DietPlanMeal[];
}

export interface DietPlan {
  dietPlanId: string;
  dietitianId: string;
  clientId: string;
  clientName: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: DietPlanStatus;
  days: DietPlanDay[];
}

// Request DTOs
export interface CreateDietPlanMealDto {
  type: MealType;
  plannedRecipeId?: string;
  customName?: string;
  isMandatory: boolean;
}

export interface CreateDietPlanDayDto {
  date: string; // ISO date string (YYYY-MM-DD)
  dailyTargetCalories?: number;
  meals: CreateDietPlanMealDto[];
}

export interface CreateDietPlanRequest {
  dietitianId: string; // Will be set from JWT in API
  clientId: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  days: CreateDietPlanDayDto[];
}

export interface CreateDietPlanResult {
  dietPlanId: string;
  success: boolean;
  errorMessage?: string;
}

// Helper function to get meal type display name
export function getMealTypeDisplay(type: MealType): string {
  switch (type) {
    case MealType.Breakfast:
      return 'Breakfast';
    case MealType.Lunch:
      return 'Lunch';
    case MealType.Dinner:
      return 'Dinner';
    case MealType.Snack:
      return 'Snack';
    default:
      return 'Unknown';
  }
}

// Helper function to get status badge color
export function getStatusBadgeColor(status: DietPlanStatus): string {
  switch (status) {
    case DietPlanStatus.Active:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case DietPlanStatus.Draft:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case DietPlanStatus.Expired:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case DietPlanStatus.Completed:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to get status display name
export function getStatusDisplay(status: DietPlanStatus): string {
  switch (status) {
    case DietPlanStatus.Active:
      return 'Active';
    case DietPlanStatus.Draft:
      return 'Draft';
    case DietPlanStatus.Expired:
      return 'Expired';
    case DietPlanStatus.Completed:
      return 'Completed';
    default:
      return 'Unknown';
  }
}
