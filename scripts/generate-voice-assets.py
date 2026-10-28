#!/usr/bin/env python3
"""Generate static MP3 speech assets from the bundled French phrase list."""

import argparse
import hashlib
import json
import re
import subprocess
import tempfile
import urllib.request
import unicodedata
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHRASES = ROOT / "elevenlabs-voice-list.txt"
OUTPUT = ROOT / "public" / "audio"
MANIFEST = ROOT / "lib" / "voice-assets.json"
MODEL_BASE_URL = (
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/"
    "fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx"
)
CACHE = Path.home() / ".cache" / "pas-a-pas" / "voice"


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    text = " ".join(text.split())
    return re.sub(r"\s+([!?.,;:])", r"\1", text).strip()


def ensure_model() -> tuple[Path, Path]:
    CACHE.mkdir(parents=True, exist_ok=True)
    model = CACHE / "fr_FR-siwis-medium.onnx"
    config = CACHE / "fr_FR-siwis-medium.onnx.json"
    for path in (model, config):
        if not path.exists():
            print(f"Downloading {path.name} to {CACHE}")
            urllib.request.urlretrieve(f"{MODEL_BASE_URL}{'.json' if path == config else ''}", path)
    return model, config


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", type=Path, help="Piper ONNX model file")
    parser.add_argument("--config", type=Path, help="Piper model JSON config (defaults to MODEL.json)")
    args = parser.parse_args()

    phrases = [normalize(line) for line in PHRASES.read_text(encoding="utf-8").splitlines() if line.strip()]
    unique_phrases = list(dict.fromkeys(phrases))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    asset_map: dict[str, str] = {}
    missing: list[tuple[str, Path]] = []

    for phrase in unique_phrases:
        asset_id = hashlib.sha256(phrase.encode("utf-8")).hexdigest()[:16]
        target = OUTPUT / f"{asset_id}.mp3"
        asset_map[phrase] = asset_id
        if not target.exists():
            missing.append((phrase, target))

    if missing:
        if args.model:
            model = args.model
            config = args.config or Path(f"{model}.json")
        else:
            model, config = ensure_model()
        from piper import PiperVoice

        voice = PiperVoice.load(model, config_path=config)
    else:
        voice = None

    for index, phrase in enumerate(unique_phrases, start=1):
        target = OUTPUT / f"{asset_map[phrase]}.mp3"
        if target.exists():
            print(f"[{index}/{len(unique_phrases)}] exists: {phrase}")
            continue

        if voice is None:
            raise RuntimeError(f"Voice model was not loaded for missing phrase: {phrase}")
        with tempfile.NamedTemporaryFile(suffix=".wav") as wav_file:
            with wave.open(wav_file.name, "wb") as wav_output:
                voice.synthesize_wav(phrase, wav_output)
            subprocess.run(
                [
                    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-i", wav_file.name, "-ac", "1", "-ar", "22050",
                    "-c:a", "libmp3lame", "-b:a", "48k", str(target),
                ],
                check=True,
            )
        print(f"[{index}/{len(unique_phrases)}] generated: {phrase}")

    MANIFEST.write_text(
        json.dumps(asset_map, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(asset_map)} phrase mappings to {MANIFEST}")


if __name__ == "__main__":
    main()
