# French voice clips

Speech uses MP3 clips bundled in `public/audio`, so playback works on GitHub Pages without any API, voice service, or software installed on the learner's device. New clips are generated locally with Kokoro-82M's `ff_siwis` French voice (France French).

## Set up local generation

Use Python 3.12 (Kokoro does not yet support Python 3.14) and install FFmpeg so the `ffmpeg` command is available on your PATH. On Windows, install FFmpeg first with `winget install Gyan.Dev.FFmpeg` (or another FFmpeg package that adds `ffmpeg.exe` to PATH).

On Windows PowerShell, create and activate a virtual environment, then install the generator dependencies:

```powershell
py -3.12 -m venv .venv-voice
.\.venv-voice\Scripts\Activate.ps1
python -m pip install -r scripts/requirements-voice.txt
```

On macOS or Linux:

```sh
python3.12 -m venv .venv-voice
source .venv-voice/bin/activate
python -m pip install -r scripts/requirements-voice.txt
```

If creating the virtual environment reports that `ensurepip` is missing on Ubuntu, install `python3.12-venv` first:

```sh
sudo apt-get install python3.12-venv
```

Then run `npm run generate:voice`. The first generation downloads the quantized model and French voice files (about 87 MB total) to a cache under your home folder. These files stay outside the repository and aren't included in the static site. Speech generation is local and has no API key, quotas, or per-request cost.

## Add a phrase

1. Add the exact French phrase on its own line in `word-list.txt`.
2. Run `npm run generate:voice` to generate missing clips, or `npm run generate:voice -- --force` to regenerate every clip.
3. Commit the updated phrase list, `lib/voice-assets.json`, `lib/voice-assets-provider.json`, and generated MP3 files in `public/audio`.

The generator keeps existing clips when the voice settings have not changed. It automatically regenerates existing clips after switching providers or model settings. GitHub Actions can generate missing clips during the Pages build without secrets.

```sh
npm run generate:voice
```

## Voice attribution

The Kokoro model is Apache 2.0 licensed. The French `ff_siwis` voice uses SIWIS dataset material licensed CC BY 4.0. See [public/audio/ATTRIBUTION.txt](./public/audio/ATTRIBUTION.txt).
