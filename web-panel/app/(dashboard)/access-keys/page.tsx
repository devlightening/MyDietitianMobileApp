"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Key, Plus, AlertCircle, Check } from 'lucide-react'

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Access Keys</h2>
        <p className="text-muted-foreground mt-1">
          Generate access keys for your clients to access their meal plans and recipes.
        </p>
      </div>

      {/* Generate Key Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Generate New Access Key</h3>
        <form
          className="flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            mutation.mutate({ clientId, startDate, endDate });
          }}
        >
          <Input
            label="Client ID"
            placeholder="Enter client identifier"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={mutation.isLoading}
            disabled={mutation.isLoading}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {mutation.isLoading ? "Creating..." : "Generate Key"}
          </Button>
        </form>
      </Card>

      {/* Access Keys List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : accessKeys?.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Key className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No access keys yet</h3>
            <p className="text-sm text-muted-foreground">Generate an access key for your next client!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {accessKeys?.map((k: any) => (
            <Card key={k.id} className="p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5 text-primary" />
                    <code className="font-mono font-semibold text-foreground text-lg">{k.key}</code>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Valid from <span className="font-medium text-foreground">{k.startDate}</span> to <span className="font-medium text-foreground">{k.endDate}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Client ID: <span className="font-mono">{k.clientId}</span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={() => alert('Activate key (mocked)')}
                  className="w-full md:w-auto"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
