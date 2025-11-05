I'll add source metadata support to the events API and telemetry: new columns (SourceNodeId, ExportBatchId, SourceSequence identity, IngestedAt), accept optional headers on the API, include SourceNodeId from env in the client, and provide Docker run steps for Windows and Pi.

[3 tools called]

Here’s a clean, disconnected-mode setup for both Windows and Pi, with the “stubbed early” source metadata now supported end-to-end.

### A) Windows: local SQL Server in Docker (central absorber)
- Bring up SQL Server with a persistent volume:
```powershell
# In repo root
docker compose -f docker-compose.mssql.yml --profile x64 up -d
```
- Connection string (adjust password if you changed it):
```powershell
$env:SQL_CONNECTION_STRING = "Server=localhost,1433;User ID=sa;Password=Your_strong_password123;TrustServerCertificate=True;Encrypt=False;Database=FrankEvents;"
```
- Run the Events API (central absorber):
```powershell
dotnet run --project Frank.Events/Frank.Events.Api --urls http://0.0.0.0:5000
```

### B) Raspberry Pi: local Azure SQL Edge in Docker (cache holder)
- Bring up Azure SQL Edge with a persistent volume:
```bash
# In repo root copied to the Pi
docker compose -f docker-compose.mssql.yml --profile pi up -d
```
- Connection string for the Pi’s Events API:
```bash
export SQL_CONNECTION_STRING="Server=localhost,1433;User ID=sa;Password=Your_strong_password123;TrustServerCertificate=True;Encrypt=False;Database=FrankEvents;"
```
- Run the Events API on the Pi:
```bash
dotnet run --project Frank.Events/Frank.Events.Api --urls http://0.0.0.0:5000
```

### C) Stream app config (both)
- On Windows (point to central):
```bash
# gemini/geminiStreaming/.env.local
VITE_EVENTS_API_BASE=http://localhost:5000
# optional for dev box identity, but most useful on Pi:
VITE_DEVICE_ID=win01
```
- On Pi (disconnected cache mode):
```bash
# gemini/geminiStreaming/.env.local
VITE_EVENTS_API_BASE=http://localhost:5000
VITE_DEVICE_ID=pi01
```
- Run the app:
```bash
cd gemini/geminiStreaming
npm ci
npm run dev
```

What’s already stubbed for multi-node merging
- The Events API now accepts optional source info and stores it in the same table:
  - Columns: `SourceNodeId`, `ExportBatchId`, `SourceSequence` (IDENTITY), `IngestedAt`.
  - The client automatically includes `SourceNodeId` (from `VITE_DEVICE_ID`) in the request body and sets header `X-Source-Node-Id` when using fetch.
- The table and columns are auto-created/added if missing when the API first receives data.
- Idempotency for merges: use `EventId` as the unique key; central can upsert by `EventId`.

Suggested “absorber” flow (later)
- Leave Pis fully offline: each Pi writes to its own local SQL Edge via its own Events API.
- When the Windows host is ready to absorb:
  - Option 1: the Pi pushes to the Windows API when connected (POST /events, many times). No extra API needed.
  - Option 2: a Windows job connects directly to each Pi’s SQL Edge (port 1433) and MERGEs into central by `EventId` (and can stamp `SourceNodeId`, `SourceSequence`, `IngestedAt`).
- Because the schema is uniform and includes `SourceNodeId` and a monotonic `SourceSequence` per source, ordering and dedupe at the absorber are straightforward.

Sanity checks
- After sending a few turns on the Pi:
```sql
-- On Pi DB
SELECT TOP 5 EventId, Role, LEFT([Text],120) AS Text, SourceNodeId, SourceSequence
FROM dbo.PingPongEvents
ORDER BY SourceSequence DESC;
```
- On Windows central (after you start absorbing):
```sql
-- On central DB
SELECT TOP 5 EventId, Role, SourceNodeId, SourceSequence, IngestedAt
FROM dbo.PingPongEvents
ORDER BY IngestedAt DESC;
```

Notes
- Use the same memorable password for SQL containers on both machines unless you prefer different ones.
- If fetch fails in the browser, the client falls back to sendBeacon (headers won’t be present there, but `SourceNodeId` is still in the JSON body).
- Firewall: open TCP 5000 (API) and 1433 (SQL) only if you need cross-machine access.

- I added source metadata columns and header handling to the Events API, and included `VITE_DEVICE_ID` in the client POSTs. You can now run SQL Server locally on Windows and Azure SQL Edge on each Pi for fully disconnected caching, then absorb later on Windows by upserting on `EventId`.