import { Card } from '@/components/ui/Card';
import { MealItemRow, MealItemData } from './MealItemRow';
import { cn } from '@/lib/utils';

export interface MealData {
  mealId: string;
  mealType: number; // 1=Breakfast, 2=Lunch, 3=Dinner, 4=Snack
  mealName: string | null;
  compliancePercentage: number;
  items: MealItemData[];
}

interface MealCardProps {
  meal: MealData;
}

function getMealTypeLabel(mealType: number): string {
  switch (mealType) {
    case 1:
      return 'Breakfast';
    case 2:
      return 'Lunch';
    case 3:
      return 'Dinner';
    case 4:
      return 'Snack';
    default:
      return 'Meal';
  }
}

function getComplianceColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

export function MealCard({ meal }: MealCardProps) {
  const mealTypeLabel = getMealTypeLabel(meal.mealType);
  const mealTitle = meal.mealName || mealTypeLabel;
  const complianceColor = getComplianceColor(meal.compliancePercentage);

  return (
    <Card className="p-0 overflow-hidden">
      {/* Meal Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{mealTitle}</h3>
            {meal.mealName && (
              <p className="text-sm text-muted-foreground mt-0.5">{mealTypeLabel}</p>
            )}
          </div>
          <div className="text-right">
            <div className={cn('text-2xl font-bold', complianceColor)}>
              {meal.compliancePercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Compliance</p>
          </div>
        </div>
      </div>

      {/* Meal Items */}
      <div className="divide-y divide-border">
        {meal.items.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground">
            <p className="text-sm">No items for this meal</p>
          </div>
        ) : (
          meal.items.map((item) => (
            <MealItemRow key={item.mealItemId} item={item} />
          ))
        )}
      </div>
    </Card>
  );
}

