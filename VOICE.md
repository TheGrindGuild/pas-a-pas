# French voice clips

Speech uses MP3 clips bundled in `public/audio`; the site does not need a speech service, API key, or voice installed on the visitor's device. The clips are included in the static export and work on GitHub Pages.

## Add a phrase

1. Add the exact French phrase on its own line in `elevenlabs-voice-list.txt`.
2. Run `npm run generate:voice`.
3. Commit the updated phrase list, `lib/voice-assets.json`, and new MP3 files in `public/audio`.

The generator keeps existing clips, so adding a phrase only generates that clip. On a new computer, install Python 3.12+, FFmpeg, and the free Piper generator once:

```sh
python -m pip install -r scripts/requirements-voice.txt
npm run generate:voice
```

The generator downloads and caches the Piper model automatically when it needs to create a clip. The model is not included in the repository. GitHub Actions also generates missing clips during the Pages build.

## Voice attribution

The included clips use Piper's French `fr_FR-siwis-medium` model. Its training dataset is licensed CC BY 4.0; see [public/audio/ATTRIBUTION.txt](./public/audio/ATTRIBUTION.txt). This voice is standard French from France, not Canadian French.
