"use client"
import DietitianGuard from '@/components/DietitianGuard'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

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
      <div className="font-medium text-card-foreground">Ingredients</div>
      {ingredients.map((ing, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            className="border border-input px-3 py-2 rounded-md flex-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            placeholder="Name"
            value={ing.name}
            onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
            required
          />
          <input
            className="border border-input px-3 py-2 rounded-md w-32 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            placeholder="Amount"
            value={ing.amount}
            onChange={e => handleIngredientChange(idx, 'amount', e.target.value)}
            required
          />
          {ingredients.length > 1 && (
            <button type="button" onClick={() => removeIngredient(idx)} className="text-danger hover:underline px-3 font-medium">Remove</button>
          )}
        </div>
      ))}
      <button type="button" onClick={addIngredient} className="text-primary hover:underline text-sm mt-1 font-medium">+ Add Ingredient</button>
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
    <DietitianGuard>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <h2 className="text-3xl font-bold text-foreground">Recipes</h2>
        <form
          className="bg-card border border-border rounded-lg shadow-sm p-6 flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            mutation.mutate({ name, description });
          }}
        >
          <input
            className="border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            placeholder="Recipe name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          {/* Ingredients UI */}
          <IngredientsInput />
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-md py-2 mt-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Adding..." : "Add Recipe"}
          </button>
        </form>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-card">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-danger/10 border border-danger/20 rounded-lg p-8 text-center text-danger flex flex-col items-center">
            <span className="text-5xl mb-4">⚠️</span>
            <div className="font-semibold mb-2 text-lg">Failed to load recipes</div>
            <div className="text-sm mb-4 text-muted-foreground">{error instanceof Error ? error.message : String(error) || 'Something went wrong. Please try again.'}</div>
            <button onClick={() => refetch()} className="text-primary hover:underline font-medium">Retry</button>
          </div>
        ) : recipes?.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground flex flex-col items-center">
            <span className="text-5xl mb-4">🍲</span>
            <div className="font-semibold mb-2 text-lg text-card-foreground">No recipes yet</div>
            <div className="text-sm">Start by adding a recipe for your clients to enjoy!</div>
          </div>
        ) : (
          <ul className="space-y-3">
            {recipes?.map((r: any) => (
              <li key={r.id} className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
                <div className="font-semibold text-card-foreground text-lg">{r.name}</div>
                <div className="text-sm text-muted-foreground mt-1">{r.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DietitianGuard>
  )
}
