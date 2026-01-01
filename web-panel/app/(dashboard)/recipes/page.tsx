"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, ChefHat, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function IngredientsInput({ onChange }: { onChange?: (ingredients: { name: string; amount: string }[]) => void }) {
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);

  function handleIngredientChange(idx: number, field: 'name' | 'amount', value: string) {
    const updated = ingredients.map((ing, i) =>
      i === idx ? { ...ing, [field]: value } : ing
    );
    setIngredients(updated);
    onChange?.(updated);
  }

  function addIngredient() {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  }

  function removeIngredient(idx: number) {
    const updated = ingredients.filter((_, i) => i !== idx);
    setIngredients(updated);
    onChange?.(updated);
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Ingredients</label>
      <div className="space-y-2">
        {ingredients.map((ing, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Ingredient name"
              value={ing.name}
              onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
              required
            />
            <Input
              className="w-32"
              placeholder="Amount"
              value={ing.amount}
              onChange={e => handleIngredientChange(idx, 'amount', e.target.value)}
              required
            />
            {ingredients.length > 1 && (
              <Button
                type="button"
                variant="danger"
                onClick={() => removeIngredient(idx)}
                className="px-3"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={addIngredient}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </div>
    </div>
  );
}

async function fetchRecipes() {
  try {
    const res = await api.get('/api/recipes?dietitianId=me');
    return res.data.recipes;
  } catch (err: any) {
    throw new Error(err?.toString() || 'Failed to load recipes');
  }
}

function createRecipe(data: { name: string; description: string }) {
  return api.post('/api/recipes', data)
}

export default function RecipesPage() {
  const queryClient = useQueryClient()
  const { data: recipes, isLoading, error, refetch } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes
  })
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const mutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      setName("")
      setDescription("")
    }
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Recipes</h2>
          <p className="text-muted-foreground mt-1">Manage your recipe collection</p>
        </div>
      </div>

      {/* Add Recipe Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Add New Recipe</h3>
        <form
          className="flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            mutation.mutate({ name, description });
          }}
        >
          <Input
            placeholder="Recipe name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <IngredientsInput />
          <Button
            type="submit"
            variant="primary"
            loading={mutation.isLoading}
            disabled={mutation.isLoading}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {mutation.isLoading ? "Adding..." : "Add Recipe"}
          </Button>
        </form>
      </Card>

      {/* Recipes List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load recipes</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {error instanceof Error ? error.message : String(error) || 'Something went wrong. Please try again.'}
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      ) : recipes?.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ChefHat className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No recipes yet</h3>
            <p className="text-sm text-muted-foreground">Start by adding a recipe for your clients to enjoy!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {recipes?.map((r: any) => (
            <Card key={r.id} className="p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50">
              <h4 className="font-semibold text-foreground text-lg mb-2">{r.name}</h4>
              <p className="text-sm text-muted-foreground">{r.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
