# PostgreSQL Connection String Configuration

## Port Configuration

- **Port 5432**: Local PostgreSQL installation (default PostgreSQL port)
  - Use this when running PostgreSQL directly on your machine
  - Current configuration uses port 5432

- **Port 5433**: Docker container mapping
  - See `docker-compose.yml` ports: `"5433:5432"`
  - If using Docker, change `Port=5432` to `Port=5433` in `appsettings.Development.json`

## Connection String Location

The connection string is configured in:
- `appsettings.Development.json` (for Development environment)
- `appsettings.json` (for Production - add if needed)

## Current Configuration

```
Host=localhost;Port=5432;Database=mydietitian_dev;Username=postgres;Password=postgres;Timeout=30;Command Timeout=30
```

## Troubleshooting

If you see connection errors:
1. Ensure PostgreSQL is running on the configured port
2. Verify the database `mydietitian_dev` exists
3. Check username and password match your PostgreSQL setup
4. If using Docker, ensure the container is running and port mapping is correct

