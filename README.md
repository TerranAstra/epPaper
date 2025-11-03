# ePaper Uploader (Waveshare 5.65")

Lightweight web UI + API + CLI to upload images and text to the Waveshare 5.65" 7‑color e‑Paper (600×448). Runs on Raspberry Pi; simulates on other machines.

## Quick start
1) Create and activate a virtual environment
   - Windows (PowerShell):
     ```powershell
     cd C:\GitHub\TerranAstra\epPaper
     py -3 -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - Raspberry Pi (bash):
     ```bash
     cd ~/epPaper
     python3 -m venv .venv
     source .venv/bin/activate
     ```
2) Install dependencies
   ```bash
   pip install -r requirements.txt
   ```
3) Vendor the Waveshare driver (self‑contained)
   ```bash
   python scripts/vendor_waveshare.py
   ```
   - Alternatively: clone their repo into `vendor/waveshare`, or set `WAVESHARE_LIB_PATH` to its `python/lib`.
4) Run the server
   ```bash
   python run_server.py
   ```
   Open `http://<device-ip>:8000`.

## API (brief)
- `GET /api/status`
- `POST /api/clear`
- `POST /api/display/image` (multipart form: `file`, `mode`, `dither`, `rotate`, `mirror`)
- `POST /api/display/text` (JSON/form: `text`, `font_size`, `align`, `valign`, `wrap`, `font_path`)

## CLI
```bash
python -m epaper_server.cli image ./my.jpg --mode fit --rotate 0 --dither 1
python -m epaper_server.cli text "Hello e‑Paper!" --font_size 36 --align center
```

## Configuration
- `WAVESHARE_DISPLAY_MODEL` (default `5in65f`)
- `WAVESHARE_LIB_PATH` (path to Waveshare `python/lib`)
- `EPAPER_BIND_HOST` (default `0.0.0.0`)
- `EPAPER_PORT` (default `8000`)
- `EPAPER_ORIENTATION` (`portrait` or `landscape`)

## Driver setup
Automatically imports `waveshare_epd.epd5in65f` from `vendor/waveshare/RaspberryPi_JetsonNano/python/lib` or `WAVESHARE_LIB_PATH`. On non‑Pi or without hardware, falls back to simulation and writes `out/last_output.png`.

## References
- Waveshare e‑Paper repo: [waveshareteam/e‑Paper](https://github.com/waveshareteam/e-Paper)
- Python examples (Raspberry Pi / Jetson Nano): [RaspberryPi_JetsonNano/python](https://github.com/waveshareteam/e-Paper/tree/master/RaspberryPi_JetsonNano/python)

