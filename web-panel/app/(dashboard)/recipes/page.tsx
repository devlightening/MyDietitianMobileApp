"use client"
import DietitianGuard from '@/components/DietitianGuard'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'

function fetchRecipes() {
  return api.get('/api/recipes?dietitianId=me').then(res => res.data.recipes)
}

function createRecipe(data: { name: string; description: string }) {
  return api.post('/api/recipes', data)
}

export default function RecipesPage() {
  const queryClient = useQueryClient()
  const { data: recipes, isLoading } = useQuery({
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
      <div className="max-w-xl mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-4">Tarifler</h2>
        <form
          className="flex flex-col gap-2 mb-6"
          onSubmit={e => {
            e.preventDefault()
            mutation.mutate({ name, description })
          }}
        >
          <input
            className="border px-2 py-1 rounded"
            placeholder="Tarif adı"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="border px-2 py-1 rounded"
            placeholder="Açıklama"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-accent text-white rounded py-1 mt-2"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Ekleniyor..." : "Tarif Ekle"}
          </button>
        </form>
        {isLoading ? (
          <div>Yükleniyor...</div>
        ) : (
          <ul className="space-y-2">
            {recipes?.map((r: any) => (
              <li key={r.id} className="border rounded p-2 bg-white">
                <div className="font-semibold">{r.name}</div>
                <div className="text-sm text-gray-600">{r.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DietitianGuard>
  )
}
