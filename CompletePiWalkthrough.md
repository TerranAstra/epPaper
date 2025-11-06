

Here’s an A–Z, Pi-only setup for a fresh Raspberry Pi OS Trixie install, optimized for disconnected operation. Commands include expected outputs, whether they’re one-time, and how to retest/skip next time.

References:
- Repo with these pieces: epPaper `https://github.com/TerranAstra/epPaper`
- OS baseline: Raspberry Pi OS Trixie `https://www.raspberrypi.com/news/trixie-the-new-version-of-raspberry-pi-os/`

### 0) Verify 64‑bit OS and update (one-time per image)
- Why: Azure SQL Edge requires 64‑bit (aarch64). If armv7l, reimage with 64‑bit Trixie.
- Command:
```bash
uname -m
# Expected: aarch64
sudo apt update && sudo apt full-upgrade -y
sudo reboot
```
- Retest later: run `uname -m` again; if `aarch64`, you’re fine. Upgrades are periodic, not every run.

### 1) Install Docker Engine + Compose plugin (one-time)
- Why: You hit “permission denied” on Docker socket previously; this fixes it and adds your user to the docker group.
- Command:
```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
docker info | grep -i 'server version'
docker compose version
docker run --rm hello-world
```
- Expected:
  - `docker info` shows server version.
  - `docker compose version` prints a version string.
  - `hello-world` prints the hello banner then exits.
- Retest later: if `docker run --rm hello-world` succeeds, skip reinstall.

### 2) Clone the repo (repeat when updating)
- Command:
```bash
cd ~
git clone https://github.com/TerranAstra/epPaper
cd epPaper
git pull
```
- Expected: repo checked out to `~/epPaper`.
- Retest later: `git pull` shows “Already up to date.” if nothing new.

### 3) Bring up local SQL on Pi (Azure SQL Edge) (background service, repeat only after reboots if needed)
- Why: Acts as the Pi’s local “cache holder” DB while offline.
- Command:
```bash
cd ~/epPaper
# Start Azure SQL Edge on Pi
docker compose -f docker-compose.mssql.yml --profile pi up -d
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```
- Expected:
  - A container named `frank-azure-sql-edge` (or similar) with Status “Up …”.
- Common errors:
  - “permission denied while trying to connect to the Docker daemon socket”: rerun with `sudo` once or re-check Step 1 (group membership and newgrp).
  - “no matching manifest” or similar: you’re likely not on aarch64; reimage with 64‑bit OS.
- Retest later:
  - `docker ps` shows the container up.
  - If down after a reboot, bring it back: `docker compose -f docker-compose.mssql.yml --profile pi up -d`.

### 4) Install .NET SDK (Arm64) (one-time)
- Why: Run the Events API locally (Pi cache writer).
- Command:
```bash
cd ~
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
# Install .NET 9 (works on Arm64)
./dotnet-install.sh -Channel 9.0 -InstallDir $HOME/dotnet
echo 'export PATH="$HOME/dotnet:$PATH"' >> ~/.bashrc
source ~/.bashrc
dotnet --info | head -n 5
```
- Expected:
  - `dotnet --info` prints runtime info (Arm64, Linux).
- Retest later:
  - `dotnet --info` still prints; no need to reinstall.

### 5) Run the Events API (Pi cache service) (repeat when you want it running)
- Why: Accepts POSTed ping/pong events and writes to local SQL Edge. Auto-creates DB and table.
- Command:
```bash
cd ~/epPaper
export SQL_CONNECTION_STRING="Server=localhost,1433;User ID=sa;Password=Your_strong_password123;TrustServerCertificate=True;Encrypt=False;Database=FrankEvents;"
dotnet run --project Frank.Events/Frank.Events.Api --urls http://0.0.0.0:5000
```
- Expected:
  - Process starts and listens on port 5000.
  - Health check:
    ```bash
    curl -s http://localhost:5000/health
    # Expected: {"ok":true,"service":"Frank.Events.Api"}
    ```
- Retest later:
  - If the process isn’t running, run the `dotnet run` command again (or we can service-ize it later).

### 6) Quick DB write test (repeatable)
- Why: Validates the API writes to SQL Edge. Uses the schema with source metadata stubs.
- Command (new terminal/session so the API keeps running in its window):
```bash
# one-off event post
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Content-Type: application/json" \
  -H "X-Source-Node-Id: pi01" \
  -d '{
    "EventId":"00000000-0000-0000-0000-000000000001",
    "SessionId":"sess-local-1",
    "AppId":"geminiStreaming",
    "Role":"system",
    "Text":"Pi test event",
    "IsFinal":true,
    "Timestamp":"'"$(date -Iseconds)"'",
    "Model":"gemini-2.5",
    "Voice":"Achird",
    "GroundingJson":null,
    "MetaJson":"{\"note\":\"smoke test\"}",
    "ProposedSavePath":"/data/audioStream/YYYYMMDD/AppNameYYYYMMDDHHMMSS.AiSYNOPSIS.type",
    "SourceNodeId":"pi01"
  }' \
  http://localhost:5000/events
```
- Expected:
  - HTTP 202.
- Optional DB verification (using FreeTDS `tsql`, Arm64-compatible):
```bash
sudo apt install -y freetds-bin
tsql -H 127.0.0.1 -p 1433 -U sa -P 'Your_strong_password123'
# At the tsql prompt:
# 1> use FrankEvents
# 2> go
# 1> select top 5 EventId, Role, left(Text,60), SourceNodeId from dbo.PingPongEvents order by IngestedAt desc;
# 2> go
# Expect: the test row appears
# 1> quit
```
- Retest later: Re-run the `curl` and the `select`.

### 7) Configure the streaming app to log locally (optional now)
- Why: If you want geminiStreaming on the Pi to POST finalized turns while offline.
- Command:
```bash
cd ~/epPaper/gemini/geminiStreaming
echo "VITE_EVENTS_API_BASE=http://localhost:5000" > .env.local
echo "VITE_DEVICE_ID=pi01" >> .env.local
npm ci
npm run dev
# Open http://<pi-ip>:5173 and talk through the console; finalized turns 202 Accepted to /events
``]
- Expected: finalized turns POST to the API; you should see 202s in the browser network tab.
- Retest later: ensure `.env.local` is set; re-run `npm run dev`.

### 8) Optional: mount a Windows share for future handoff (one-time + persistent)
- Why: When you want the Pi to write out files to a central share, but for disconnected mode you can skip this.
- Command:
```bash
sudo apt install -y cifs-utils smbclient
sudo mkdir -p /data/audioStream
sudo bash -c 'cat >/etc/samba/creds.audio <<EOF
username=pi-share
password=RiverCoffeeSky!42
domain=WORKGROUP
EOF'
sudo chmod 600 /etc/samba/creds.audio
sudo mount -t cifs //WIN_IP/AudioStream /data/audioStream \
  -o credentials=/etc/samba/creds.audio,vers=3.0,rw,uid=$(id -u),gid=$(id -g),file_mode=0664,dir_mode=0775,noperm
echo "//WIN_IP/AudioStream /data/audioStream cifs credentials=/etc/samba/creds.audio,vers=3.0,rw,uid=1000,gid=1000,file_mode=0664,dir_mode=0775,noperm 0 0" | sudo tee -a /etc/fstab
```
- Expected: `ls /data/audioStream` lists the shared content.
- Retest later: `mount | grep /data/audioStream` shows the CIFS mount. If not mounted after reboot: `sudo mount -a`.

### 9) Common problems and corrected outcomes
- “permission denied while trying to connect to the Docker daemon socket”
  - Fix: Step 1 (enable service, add user to `docker` group, `newgrp docker`). Re-run commands without `sudo`.
- “version is obsolete” warning in compose
  - Harmless. You can remove the `version:` line from `docker-compose.mssql.yml` to silence it; not required.
- Not aarch64
  - Reflash with 64‑bit Raspberry Pi OS Trixie, per Raspberry Pi OS announcement `https://www.raspberrypi.com/news/trixie-the-new-version-of-raspberry-pi-os/`.

### 10) One-shot “do-everything” script (preview)
- Later we’ll bundle Steps 1–6 into a single script:
  - Detect 64‑bit, install Docker, add group, pull up SQL Edge, install .NET SDK, export connection string, run Events API as a service.
- For now, use the sequences above so any error from last time is “baked-in” corrected next time.

### 11) Deploy the ePaper uploader (optional)
- Why: Serve the 5.65" Waveshare panel locally with image/text uploads and debugging output.
- Command (first time on the Pi):
  ```bash
  cd ~/epPaper
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  python scripts/vendor_waveshare.py
  EPAPER_DEBUG=1 python run_server.py
  ```
- Expected:
  - Server listens on port 8000 (`http://<pi-ip>:8000`).
  - `/api/status` returns `driver: hardware` when the Waveshare driver loads.
- Retest later:
  - Activate the venv (`source .venv/bin/activate`) and rerun `python run_server.py`.
  - Set `EPAPER_ORIENTATION=portrait` if the panel is mounted vertically; the app auto-rotates content.
  - If `/api/status` shows `simulation`, rerun `python scripts/vendor_waveshare.py`, confirm SPI is enabled, and review the debug logs printed to the console.

If you want, I can turn Steps 1–6 into a single `setup_pi.sh` that you run once (idempotent) and a `start_services.sh` to bring the API/DB up on each boot.