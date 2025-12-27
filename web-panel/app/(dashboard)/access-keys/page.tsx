"use client"
import DietitianGuard from '@/components/DietitianGuard'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'

function fetchAccessKeys() {
  return api.get('/api/access-keys?dietitianId=me').then(res => res.data.accessKeys)
}

function createAccessKey(data: { clientId: string; startDate: string; endDate: string }) {
  return api.post('/api/access-keys', data)
}

export default function AccessKeysPage() {
  const queryClient = useQueryClient()
  const { data: accessKeys, isLoading } = useQuery({
    queryKey: ['accessKeys'],
    queryFn: fetchAccessKeys
  })
  const [clientId, setClientId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const mutation = useMutation({
    mutationFn: createAccessKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessKeys'] })
      setClientId("")
      setStartDate("")
      setEndDate("")
    }
  })

  return (
    <DietitianGuard>
      <div className="max-w-xl mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-4">Erişim Anahtarları</h2>
        <form
          className="flex flex-col gap-2 mb-6"
          onSubmit={e => {
            e.preventDefault()
            mutation.mutate({ clientId, startDate, endDate })
          }}
        >
          <input
            className="border px-2 py-1 rounded"
            placeholder="Danışan ID"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            required
          />
          <input
            className="border px-2 py-1 rounded"
            placeholder="Başlangıç Tarihi (YYYY-MM-DD)"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />
          <input
            className="border px-2 py-1 rounded"
            placeholder="Bitiş Tarihi (YYYY-MM-DD)"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-accent text-white rounded py-1 mt-2"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Ekleniyor..." : "Anahtar Oluştur"}
          </button>
        </form>
        {isLoading ? (
          <div>Yükleniyor...</div>
        ) : (
          <ul className="space-y-2">
            {accessKeys?.map((k: any) => (
              <li key={k.id} className="border rounded p-2 bg-white">
                <div className="font-semibold">{k.key}</div>
                <div className="text-sm text-gray-600">{k.startDate} - {k.endDate}</div>
                <div className="text-xs text-gray-400">Danışan ID: {k.clientId}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DietitianGuard>
  )
}
