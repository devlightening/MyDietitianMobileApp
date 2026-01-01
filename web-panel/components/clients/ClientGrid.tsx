import { ClientCard, ClientCardData } from './ClientCard';

interface ClientGridProps {
  clients: ClientCardData[];
}

export function ClientGrid({ clients }: ClientGridProps) {
  if (clients.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {clients.map((client) => (
        <ClientCard key={client.clientId} client={client} />
      ))}
    </div>
  );
}

