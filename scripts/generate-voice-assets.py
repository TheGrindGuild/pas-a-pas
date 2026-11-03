#!/usr/bin/env python3
"""Generate static MP3 speech assets with the local Kokoro French voice."""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHRASES = ROOT / "word-list.txt"
OUTPUT = ROOT / "public" / "audio"
MANIFEST = ROOT / "lib" / "voice-assets.json"
GENERATOR_METADATA = ROOT / "lib" / "voice-assets-provider.json"
MODEL_REPOSITORY = "onnx-community/Kokoro-82M-v1.0-ONNX"
MODEL_REVISION = "1939ad2a8e416c0acfeecc08a694d14ef25f2231"
MODEL_FILE = "onnx/model_q8f16.onnx"
VOICE_NAME = "ff_siwis"
VOICE_FILE = f"voices/{VOICE_NAME}.bin"
MODEL_BASE_URL = (
    f"https://huggingface.co/{MODEL_REPOSITORY}/resolve/{MODEL_REVISION}"
)
CACHE = Path.home() / ".cache" / "pas-a-pas" / "kokoro"
GENERATION_ID = (
    f"kokoro-onnx:0.6.1:{MODEL_REPOSITORY}@{MODEL_REVISION}:"
    f"{MODEL_FILE}:{VOICE_NAME}:fr-fr:mp3-24000-48"
)


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    text = " ".join(text.split())
    return re.sub(r"\s+([!?.,;:])", r"\1", text).strip()


def download_file(url: str, target: Path) -> None:
    if target.exists():
        return

    target.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = target.with_name(f"{target.name}.part")
    print(f"Downloading {target.name} to {CACHE}")
    request = urllib.request.Request(url, headers={"User-Agent": "pas-a-pas-voice-generator"})
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            with temporary_path.open("wb") as downloaded:
                shutil.copyfileobj(response, downloaded)
        if temporary_path.stat().st_size == 0:
            raise RuntimeError(f"Downloaded an empty model file from {url}")
        temporary_path.replace(target)
    except Exception:
        temporary_path.unlink(missing_ok=True)
        raise


def ensure_model() -> tuple[Path, Path]:
    import numpy as np

    model_path = CACHE / "model_q8f16.onnx"
    raw_voice_path = CACHE / f"{VOICE_NAME}.bin"
    voices_path = CACHE / f"{VOICE_NAME}.npz"
    download_file(f"{MODEL_BASE_URL}/{MODEL_FILE}", model_path)
    download_file(f"{MODEL_BASE_URL}/{VOICE_FILE}", raw_voice_path)

    if not voices_path.exists():
        voice = np.fromfile(raw_voice_path, dtype=np.float32)
        if voice.size % 256:
            raise RuntimeError(f"Unexpected Kokoro voice embedding size: {voice.size}")
        with tempfile.NamedTemporaryFile(
            mode="wb", suffix=".npz", dir=CACHE, delete=False
        ) as voice_file:
            temporary_voices_path = Path(voice_file.name)
        try:
            with temporary_voices_path.open("wb") as voice_file:
                np.savez(voice_file, **{VOICE_NAME: voice.reshape(-1, 1, 256)})
            temporary_voices_path.replace(voices_path)
        except Exception:
            temporary_voices_path.unlink(missing_ok=True)
            raise

    return model_path, voices_path


def resolve_ffmpeg() -> str:
    env_path = os.environ.get("PAS_A_PAS_FFMPEG_PATH")
    if env_path:
        candidate = Path(env_path).expanduser()
        if candidate.exists() and candidate.is_file():
            return str(candidate)
        raise RuntimeError(
            f"PAS_A_PAS_FFMPEG_PATH points to a missing file: {candidate}"
        )

    path = shutil.which("ffmpeg") or shutil.which("ffmpeg.exe")
    if path:
        return path

    if sys.platform.startswith("win"):
        candidates = [
            Path(r"C:\\ffmpeg\\bin\\ffmpeg.exe"),
            Path(r"C:\\ffmpeg\\ffmpeg.exe"),
            Path(r"C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe"),
            Path(r"C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe"),
        ]
        for candidate in candidates:
            if candidate.exists():
                return str(candidate)

    raise RuntimeError(
        "FFmpeg was not found. Install it and ensure the `ffmpeg` command is on PATH, "
        "or set PAS_A_PAS_FFMPEG_PATH to the ffmpeg executable. On Windows, try: "
        "winget install Gyan.Dev.FFmpeg"
    )


def generate_audio(tts, text: str, target: Path) -> None:
    import soundfile as sf

    samples, sample_rate = tts.create(
        text,
        voice=VOICE_NAME,
        speed=1.0,
        lang="fr-fr",
    )
    ffmpeg_path = resolve_ffmpeg()
    with tempfile.TemporaryDirectory(dir=OUTPUT) as temporary_directory:
        temporary_path = Path(temporary_directory)
        wav_path = temporary_path / "clip.wav"
        mp3_path = temporary_path / "clip.mp3"
        sf.write(wav_path, samples, sample_rate)
        subprocess.run(
            [
                ffmpeg_path, "-hide_banner", "-loglevel", "error", "-y",
                "-i", str(wav_path), "-ac", "1", "-ar", "24000",
                "-c:a", "libmp3lame", "-b:a", "48k", str(mp3_path),
            ],
            check=True,
        )
        if mp3_path.stat().st_size == 0:
            raise RuntimeError(f"Generated an empty audio file for: {text}")
        shutil.copyfile(mp3_path, target.with_suffix(".mp3.tmp"))
        target.with_suffix(".mp3.tmp").replace(target)


def main() -> None:
    if sys.version_info < (3, 10) or sys.version_info >= (3, 14):
        raise RuntimeError(
            "Kokoro requires Python 3.10–3.13. Set up Python 3.12 and activate "
            "the .venv-voice environment before running this command."
        )

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--force",
        action="store_true",
        help="regenerate every clip, even when it already exists",
    )
    args = parser.parse_args()

    phrases = [
        normalize(line)
        for line in PHRASES.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    unique_phrases = list(dict.fromkeys(phrases))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)

    asset_map: dict[str, str] = {}
    targets: dict[str, Path] = {}
    for phrase in unique_phrases:
        asset_id = hashlib.sha256(phrase.encode("utf-8")).hexdigest()[:16]
        asset_map[phrase] = asset_id
        targets[phrase] = OUTPUT / f"{asset_id}.mp3"

    previous_generator = None
    if GENERATOR_METADATA.exists():
        previous_generator = json.loads(GENERATOR_METADATA.read_text(encoding="utf-8"))
    regenerate_all = args.force or previous_generator != {"generation": GENERATION_ID}
    phrases_to_generate = [
        phrase
        for phrase in unique_phrases
        if regenerate_all or not targets[phrase].exists()
    ]

    if phrases_to_generate:
        from kokoro_onnx import Kokoro

        model_path, voices_path = ensure_model()
        tts = Kokoro(str(model_path), str(voices_path))
        for index, phrase in enumerate(unique_phrases, start=1):
            target = targets[phrase]
            if phrase not in phrases_to_generate:
                print(f"[{index}/{len(unique_phrases)}] exists: {phrase}")
                continue
            generate_audio(tts, phrase, target)
            print(f"[{index}/{len(unique_phrases)}] generated: {phrase}")

    MANIFEST.write_text(
        json.dumps(asset_map, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    GENERATOR_METADATA.write_text(
        json.dumps({"generation": GENERATION_ID}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(asset_map)} phrase mappings to {MANIFEST}")


if __name__ == "__main__":
    main()
