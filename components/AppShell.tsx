"use client";

import { useEffect, useRef, useState } from "react";
import ActivityView from "./ActivityView";
import AppSidebar from "./AppSidebar";
import Header from "./Header";
import { THEMES } from "./activities/data";
import type { Gender } from "./activities/shared";
import type { Theme } from "./activities/data";
import voiceAssets from "@/lib/voice-assets.json";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const VOICE_SAMPLE = "Bonjour ! Je m'appelle la voix française.";

function normalizeSpeechText(text: string): string {
  return text.normalize("NFC").replace(/\s+([!?.,;:])/g, "$1").replace(/\s+/g, " ").trim();
}

export default function AppShell() {
  const [theme, setTheme] = useState<Theme>(THEMES.find(item => item.id === "animaux") ?? THEMES[0]);
  const [gender, setGender] = useState<Gender>("m");
  const [activityId, setActivityId] = useState("");
  const [big, setBig] = useState(false);
  const [slow, setSlow] = useState(false);
  const [calm, setCalm] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const activeAudio = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef(new Map<string, HTMLAudioElement>());

  useEffect(() => {
    const storedTheme = readStored("theme", "animaux");
    const stored = THEMES.find(item => item.id === storedTheme);
    if (stored) setTheme(stored);
    setGender(readStored<Gender>("gender", "m") === "f" ? "f" : "m");
    setBig(readStored("big", false));
    setSlow(readStored("slow", false));
    setCalm(readStored("calm", false));
    const syncRoute = () => setActivityId(window.location.hash.slice(1));
    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    const sampleId = voiceAssets[normalizeSpeechText(VOICE_SAMPLE)];
    if (!sampleId) {
      setSpeechError("Le fichier de test vocal manque. Regénère les fichiers audio du projet.");
      return;
    }
    const audio = new Audio(`${BASE_PATH}/audio/${sampleId}.mp3`);
    audio.preload = "auto";
    audio.load();
    return () => audio.pause();
  }, []);

  useEffect(() => {
    const handleSpeechRequest = (event: WindowEventMap["pas-a-pas:speech"]) => {
      const text = normalizeSpeechText(event.detail.text);
      const assetId = voiceAssets[text];
      if (!assetId) {
        console.error("Missing bundled French audio for phrase", event.detail.text);
        setSpeechError("L'audio de cette phrase n'est pas encore inclus dans l'application.");
        return;
      }

      setSpeechError("");
      activeAudio.current?.pause();
      const source = `${BASE_PATH}/audio/${assetId}.mp3`;
      let audio = audioCache.current.get(assetId);
      if (!audio) {
        audio = new Audio(source);
        audio.preload = "auto";
        audio.onerror = () => {
          console.error("Could not load bundled French audio", source);
          setSpeechError("Impossible de charger l'audio français. Vérifie ta connexion puis réessaie.");
        };
        audioCache.current.set(assetId, audio);
      }
      audio.currentTime = 0;
      audio.playbackRate = event.detail.slow ? 0.75 : 1;
      audio.preservesPitch = true;
      activeAudio.current = audio;
      void audio.play().catch(error => {
        console.error("Could not play bundled French audio", error);
        setSpeechError("Impossible de lire l'audio français sur cet appareil.");
      });
    };
    window.addEventListener("pas-a-pas:speech", handleSpeechRequest);
    return () => {
      window.removeEventListener("pas-a-pas:speech", handleSpeechRequest);
      activeAudio.current?.pause();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("big", big);
    document.documentElement.classList.toggle("calm", calm);
  }, [big, calm]);

  useEffect(() => {
    activeAudio.current?.pause();
    activeAudio.current = null;
    if (!activityId) return;
    if (activityId === "videos") {
      document.getElementById("videos-sec")?.scrollIntoView({ block: "start" });
    } else window.scrollTo(0, 0);
  }, [activityId]);

  const updateSetting = (key: "big" | "slow" | "calm", value: boolean, update: (next: boolean) => void) => {
    update(value);
    localStorage.setItem(`pap-${key}`, JSON.stringify(value));
  };
  const changeTheme = (next: Theme) => {
    setTheme(next);
    localStorage.setItem("pap-theme", JSON.stringify(next.id));
  };
  const changeGender = (next: Gender) => {
    setGender(next);
    localStorage.setItem("pap-gender", JSON.stringify(next));
  };

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar activityId={activityId} theme={theme} themes={THEMES} gender={gender} onThemeChange={changeTheme} />
      <SidebarInset>
        <Header
          big={big}
          slow={slow}
          calm={calm}
          voiceNote={speechError || "Voix française intégrée prête · sans API ni voix système."}
          onBigChange={() => updateSetting("big", !big, setBig)}
          onSlowChange={() => updateSetting("slow", !slow, setSlow)}
          onCalmChange={() => updateSetting("calm", !calm, setCalm)}
        />
        {speechError && <p className="voice-notice" role="status" aria-live="polite">{speechError}</p>}
        <ActivityView activityId={activityId} theme={theme} gender={gender} slow={slow} onGenderChange={changeGender} />
      </SidebarInset>
    </SidebarProvider>
  );
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`pap-${key}`);
    return value === null ? fallback : JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
