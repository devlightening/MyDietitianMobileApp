"use client"
import DietitianGuard from '@/components/DietitianGuard'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

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
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <h2 className="text-3xl font-bold text-foreground">Access Keys</h2>
        <form
          className="bg-card border border-border rounded-lg shadow-sm p-6 flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            mutation.mutate({ clientId, startDate, endDate });
          }}
        >
          <input
            className="border border-input px-3 py-2 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            placeholder="Client ID"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            required
          />
          <input
            className="border border-input px-3 py-2 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />
          <input
            className="border border-input px-3 py-2 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-md py-2 mt-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Creating..." : "Create Key"}
          </button>
        </form>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-card flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/4 mt-1" />
                </div>
                <Skeleton className="h-9 w-24 mt-2 md:mt-0" />
              </div>
            ))}
          </div>
        ) : accessKeys?.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground flex flex-col items-center">
            <span className="text-5xl mb-4">🔑</span>
            <div className="font-semibold mb-2 text-lg text-card-foreground">No access keys yet</div>
            <div className="text-sm">Generate an access key for your next client!</div>
          </div>
        ) : (
          <ul className="space-y-3">
            {accessKeys?.map((k: any) => (
              <li key={k.id} className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-card-foreground text-lg">{k.key}</div>
                  <div className="text-sm text-muted-foreground mt-1">{k.startDate} - {k.endDate}</div>
                  <div className="text-xs text-muted-foreground mt-1">Client ID: {k.clientId}</div>
                </div>
                <button
                  className="mt-3 md:mt-0 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                  onClick={() => alert('Activate key (mocked)')}
                >
                  Activate
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DietitianGuard>
  )
}
