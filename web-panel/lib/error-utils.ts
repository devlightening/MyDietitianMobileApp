import { ApiError } from './api';

/**
 * Maps backend error codes to translation keys
 */
export function getErrorTranslationKey(errorCode: string): string {
  const errorCodeMap: Record<string, string> = {
    'DIETITIAN_NOT_FOUND': 'dietitianNotFound',
    'INGREDIENT_NOT_FOUND': 'ingredientNotFound',
    'UNAUTHORIZED': 'unauthorized',
    'NOT_FOUND': 'notFound',
    'INVALID_OPERATION': 'invalidOperation',
    'INVALID_ARGUMENT': 'invalidArgument',
    'INTERNAL_SERVER_ERROR': 'serverError',
  };

  return errorCodeMap[errorCode] || 'generic';
}

/**
 * Gets a user-friendly error message from an API error
 * This function can be used both in components (with useTranslations) and in utility functions
 */
export function getErrorMessage(error: ApiError | Error | unknown, t?: (key: string) => string): string {
  // If it's our ApiError type
  if (error && typeof error === 'object' && 'code' in error && 'status' in error) {
    const apiError = error as ApiError;
    
    // If translations are provided, use them
    if (t) {
      const translationKey = getErrorTranslationKey(apiError.code);
      return t(`errors.${translationKey}`);
    }
    
    // Fallback to the message from backend
    return apiError.message;
  }
  
  // If it's a regular Error
  if (error instanceof Error) {
    if (t) {
      return t('errors.generic');
    }
    return error.message;
  }
  
  // Unknown error
  if (t) {
    return t('errors.generic');
  }
  return 'An unexpected error occurred';
}

/**
 * Note: For components, use getErrorMessage(error, t) where t = useTranslations()
 * This utility function cannot use hooks directly.
 */

