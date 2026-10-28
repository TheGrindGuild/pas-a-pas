import type { Theme } from "./activities/data";
import { Settings2, Video } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { speak, WordPicture } from "./activities/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";

type Props = {
  theme: Theme;
  themes: Theme[];
  big: boolean;
  slow: boolean;
  calm: boolean;
  voiceNote: string;
  onThemeChange: (theme: Theme) => void;
  onBigChange: () => void;
  onSlowChange: () => void;
  onCalmChange: () => void;
};

export default function Header({ theme, themes, big, slow, calm, voiceNote, onThemeChange, onBigChange, onSlowChange, onCalmChange }: Props) {
  const testVoice = () => {
    speak("Bonjour ! Je m'appelle la voix française.", slow);
  };
  return (
    <header className="top">
      <div className="wrap">
        <div className="bar">
          <a className="brand" href="#" aria-label="Pas à pas — accueil">
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
              <rect x="1" y="1" width="38" height="38" rx="11" fill="var(--teal)" />
              <ellipse cx="14" cy="24" rx="5" ry="7.5" fill="#fff" />
              <circle cx="11.5" cy="14" r="1.8" fill="#fff" />
              <circle cx="15.5" cy="13.5" r="1.6" fill="#fff" />
              <ellipse cx="26.5" cy="18" rx="5" ry="7.5" fill="var(--sun)" />
              <circle cx="24" cy="8" r="1.8" fill="var(--sun)" />
              <circle cx="28" cy="7.5" r="1.6" fill="var(--sun)" />
            </svg>
            <span>
              <b>Pas à pas</b>
              <small>
                Français de base · 4<sup>e</sup>–5<sup>e</sup> année
              </small>
            </span>
          </a>
          <span className="spacer" />
          <Button asChild variant="outline" className="iconbtn vidlink">
            <a href="#videos"><Video aria-hidden="true" /><span className="lbl">Vidéos</span></a>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="iconbtn settings-trigger"><Settings2 aria-hidden="true" /><span className="lbl">Réglages</span></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="settings-menu">
              <DropdownMenuLabel>Réglages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <SettingToggle label="Texte plus grand" checked={big} onChange={onBigChange} />
              <SettingToggle label="Voix lente" checked={slow} onChange={onSlowChange} />
              <SettingToggle label="Mode calme" checked={calm} onChange={onCalmChange} />
              <DropdownMenuSeparator />
              <div className="settings-note">{voiceNote}</div>
              <Button variant="secondary" className="settings-test" onClick={testVoice}>Tester la voix</Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="themes" id="themes" role="group" aria-label="Thèmes">
          {themes.map(item => (
            <Button key={item.id} type="button" variant={theme.id === item.id ? "secondary" : "outline"} className="chip" aria-pressed={theme.id === item.id} onClick={() => onThemeChange(item)}>
              <span className="mini" aria-hidden="true"><WordPicture word={item.words[item.id === "nombres" ? 5 : 0]} gender="m" /></span>{item.name}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}

function SettingToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="setting-toggle">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}
