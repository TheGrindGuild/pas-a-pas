import { Settings2 } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import ColorThemePicker from "./ColorThemePicker";
import { speak } from "./activities/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";

type Props = {
  big: boolean;
  slow: boolean;
  calm: boolean;
  voiceNote: string;
  onBigChange: () => void;
  onSlowChange: () => void;
  onCalmChange: () => void;
};

export default function Header({ big, slow, calm, voiceNote, onBigChange, onSlowChange, onCalmChange }: Props) {
  const testVoice = () => {
    speak("Bonjour ! Je m'appelle la voix française.", slow);
  };
  return (
    <header className="top">
      <div className="wrap">
        <div className="bar">
          <span className="spacer" />
          <ColorThemePicker />
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
