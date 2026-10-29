"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";

type ThemeColors = {
  paper: string;
  card: string;
  ink: string;
  teal: string;
};

type ThemeColorModes = {
  light: ThemeColors;
  dark: ThemeColors;
};

type ColorTheme = {
  id: string;
  name: string;
  colors: ThemeColorModes;
  custom?: boolean;
};

type ColorMode = "system" | "light" | "dark";

const SYSTEM_THEME_ID = "system";
const SYSTEM_PREVIEW: ThemeColors = {
  paper: "#F3F6F9",
  card: "#FFFFFF",
  ink: "#1D2A3A",
  teal: "#0F7C7A"
};
const SYSTEM_DARK: ThemeColors = {
  paper: "#10161E",
  card: "#18222D",
  ink: "#E5ECF4",
  teal: "#43C2BE"
};
const PRESET_THEMES: ColorTheme[] = [
  { id: SYSTEM_THEME_ID, name: "Par défaut", colors: { light: SYSTEM_PREVIEW, dark: SYSTEM_DARK } },
  { id: "classic", name: "Classique", colors: { light: SYSTEM_PREVIEW, dark: SYSTEM_DARK } },
  {
    id: "ocean",
    name: "Océan",
    colors: {
      light: { paper: "#EAF6FA", card: "#FFFFFF", ink: "#143647", teal: "#087E8B" },
      dark: { paper: "#101D27", card: "#192B38", ink: "#E3F3FA", teal: "#49C7D0" }
    }
  },
  {
    id: "forest",
    name: "Forêt",
    colors: {
      light: { paper: "#EDF5ED", card: "#FFFFFF", ink: "#20372B", teal: "#39824A" },
      dark: { paper: "#121E18", card: "#1D2D23", ink: "#E6F2E9", teal: "#73C987" }
    }
  },
  {
    id: "lavender",
    name: "Lavande",
    colors: {
      light: { paper: "#F5F0FA", card: "#FFFFFF", ink: "#342747", teal: "#8055B6" },
      dark: { paper: "#1B1524", card: "#292035", ink: "#F0E9FA", teal: "#B995E8" }
    }
  },
  {
    id: "midnight",
    name: "Minuit",
    colors: {
      light: { paper: "#F0F3F8", card: "#FFFFFF", ink: "#243148", teal: "#526EB5" },
      dark: { paper: "#111827", card: "#1B2635", ink: "#ECF2F9", teal: "#65C3C0" }
    }
  },
  {
    id: "halloween",
    name: "l'Halloween",
    colors: {
      light: { paper: "#FFF8F0", card: "#FFFFFF", ink: "#3D1E00", teal: "#D97706" },
      dark: { paper: "#3a1c04", card: "#1d1201", ink: "#FFE6C2", teal: "#FBBF24" }
    }
  }
];

const COLOR_FIELDS: { key: keyof ThemeColors; label: string }[] = [
  { key: "paper", label: "Arrière-plan" },
  { key: "card", label: "Cartes" },
  { key: "ink", label: "Texte" },
  { key: "teal", label: "Couleur principale" }
];

export default function ColorThemePicker() {
  const [customThemes, setCustomThemes] = useState<ColorTheme[]>([]);
  const [selectedId, setSelectedId] = useState(SYSTEM_THEME_ID);
  const [colorMode, setColorMode] = useState<ColorMode>("system");
  const [systemDark, setSystemDark] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColors, setDraftColors] = useState<ThemeColorModes>({
    light: SYSTEM_PREVIEW,
    dark: SYSTEM_DARK
  });
  const [draftMode, setDraftMode] = useState<"light" | "dark">("light");
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeThemeRef = useRef<ColorTheme>(PRESET_THEMES[0]);
  const colorModeRef = useRef<ColorMode>("system");
  const systemDarkRef = useRef(false);
  const themes = [...PRESET_THEMES, ...customThemes];
  const selectedTheme = themes.find(theme => theme.id === selectedId) ?? PRESET_THEMES[0];

  useEffect(() => {
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemMode = () => {
      systemDarkRef.current = colorScheme.matches;
      setSystemDark(colorScheme.matches);
      applyTheme(activeThemeRef.current, colorModeRef.current, colorScheme.matches);
    };
    colorScheme.addEventListener("change", updateSystemMode);
    systemDarkRef.current = colorScheme.matches;
    setSystemDark(colorScheme.matches);

    try {
      const savedThemes = readCustomThemes();
      const savedId = localStorage.getItem("pap-color-theme") ?? SYSTEM_THEME_ID;
      const savedTheme = [...PRESET_THEMES, ...savedThemes].find(theme => theme.id === savedId)
        ?? PRESET_THEMES[0];
      const savedMode = readColorMode(localStorage.getItem("pap-color-mode"));
      setCustomThemes(savedThemes);
      setSelectedId(savedTheme.id);
      setColorMode(savedMode);
      colorModeRef.current = savedMode;
      activeThemeRef.current = savedTheme;
      applyTheme(savedTheme, savedMode, colorScheme.matches);
    } catch (loadError) {
      console.error("Could not load saved color themes", loadError);
      setError("Impossible de charger les thèmes enregistrés.");
      applyTheme(PRESET_THEMES[0], "system", colorScheme.matches);
    }
    return () => colorScheme.removeEventListener("change", updateSystemMode);
  }, []);

  const selectTheme = (theme: ColorTheme) => {
    setSelectedId(theme.id);
    activeThemeRef.current = theme;
    applyTheme(theme, colorModeRef.current, systemDarkRef.current);
    try {
      localStorage.setItem("pap-color-theme", theme.id);
      setError("");
    } catch (saveError) {
      console.error("Could not save selected color theme", saveError);
      setError("Le thème est appliqué, mais n'a pas pu être enregistré.");
    }
  };

  const selectColorMode = (mode: ColorMode) => {
    setColorMode(mode);
    colorModeRef.current = mode;
    applyTheme(selectedTheme, mode, systemDark);
    try {
      localStorage.setItem("pap-color-mode", mode);
      setError("");
    } catch (saveError) {
      console.error("Could not save color mode", saveError);
      setError("Le mode est appliqué, mais n'a pas pu être enregistré.");
    }
  };

  const openEditor = () => {
    setDraftName("");
    setDraftColors(selectedTheme.colors);
    setDraftMode("light");
    dialogRef.current?.showModal();
  };

  const updateDraftColor = (key: keyof ThemeColors, value: string) => {
    const nextColors = { ...draftColors[draftMode], [key]: value };
    const nextModes = { ...draftColors, [draftMode]: nextColors };
    setDraftColors(nextModes);
    applyTheme({ id: "preview", name: "Aperçu", colors: nextModes }, draftMode, systemDarkRef.current);
  };

  const selectDraftMode = (mode: "light" | "dark") => {
    setDraftMode(mode);
    applyTheme({ id: "preview", name: "Aperçu", colors: draftColors }, mode, systemDarkRef.current);
  };

  const saveCustomTheme = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) {
      setError("Donne un nom à ton thème avant de l'enregistrer.");
      return;
    }

    const theme: ColorTheme = {
      id: `custom-${crypto.randomUUID()}`,
      name: name.slice(0, 32),
      colors: { light: draftColors.light, dark: draftColors.dark },
      custom: true
    };
    const nextThemes = [...customThemes, theme];
    setCustomThemes(nextThemes);
    setSelectedId(theme.id);
    activeThemeRef.current = theme;
    applyTheme(theme, colorModeRef.current, systemDarkRef.current);
    dialogRef.current?.close();
    try {
      localStorage.setItem("pap-custom-color-themes", JSON.stringify(nextThemes));
      localStorage.setItem("pap-color-theme", theme.id);
      setError("");
    } catch (saveError) {
      console.error("Could not save custom color theme", saveError);
      setError("Le thème est appliqué, mais n'a pas pu être enregistré.");
    }
  };

  const deleteSelectedTheme = () => {
    if (!selectedTheme.custom) return;
    const nextThemes = customThemes.filter(theme => theme.id !== selectedTheme.id);
    try {
      localStorage.setItem("pap-custom-color-themes", JSON.stringify(nextThemes));
      setCustomThemes(nextThemes);
      selectTheme(PRESET_THEMES[0]);
    } catch (saveError) {
      console.error("Could not delete custom color theme", saveError);
      setError("Impossible de supprimer ce thème enregistré.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="iconbtn color-theme-trigger">
          <Palette aria-hidden="true" />
          <span>Couleurs</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="color-theme-menu">
        <section className="color-theme-picker" aria-labelledby="color-theme-label">
          <h3 id="color-theme-label">Thèmes de couleurs</h3>
          <div className="color-mode-picker" role="group" aria-label="Mode clair ou sombre">
            {([
              ["system", "Appareil"],
              ["light", "Clair"],
              ["dark", "Sombre"]
            ] as const).map(([mode, label]) => (
              <button
                type="button"
                key={mode}
                aria-pressed={colorMode === mode}
                onClick={() => selectColorMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="color-theme-options" role="group" aria-label="Choisir un thème de couleurs">
            {themes.map(theme => (
              <button
                type="button"
                className="color-theme-option"
                key={theme.id}
                aria-pressed={selectedId === theme.id}
                onClick={() => selectTheme(theme)}
              >
                <Palette aria-hidden="true" className="theme-palette-icon" />
                <span className="theme-color-swatches" aria-hidden="true">
                  <span style={{ backgroundColor: theme.colors.light.paper }} />
                  <span style={{ backgroundColor: theme.colors.dark.paper }} />
                  <span style={{ backgroundColor: theme.colors.light.teal }} />
                </span>
                <span className="theme-option-name">{theme.name}</span>
                {selectedId === theme.id && <Check aria-label="Sélectionné" className="theme-selected-icon" />}
              </button>
            ))}
          </div>
          <Button variant="outline" className="create-color-theme" onClick={openEditor}>
            <Palette aria-hidden="true" />
            Créer un thème
          </Button>
          {selectedTheme.custom && (
            <Button variant="ghost" className="delete-color-theme" onClick={deleteSelectedTheme}>
              <Trash2 aria-hidden="true" />
              Supprimer « {selectedTheme.name} »
            </Button>
          )}
          {error && <p className="color-theme-error" role="status" aria-live="polite">{error}</p>}
          <dialog
            ref={dialogRef}
            className="color-theme-dialog"
            aria-labelledby="color-theme-dialog-title"
            onClose={() => applyTheme(activeThemeRef.current, colorModeRef.current, systemDarkRef.current)}
          >
            <form className="color-theme-form" onSubmit={saveCustomTheme}>
              <h2 id="color-theme-dialog-title">Créer un thème de couleurs</h2>
              <label className="color-theme-name">
                Nom du thème
                <input
                  autoFocus
                  maxLength={32}
                  required
                  value={draftName}
                  onChange={event => setDraftName(event.target.value)}
                  placeholder="Ex. Mon océan"
                />
              </label>
              <div className="color-theme-mode-tabs" role="group" aria-label="Palette à personnaliser">
                <button type="button" aria-pressed={draftMode === "light"} onClick={() => selectDraftMode("light")}>
                  Couleurs claires
                </button>
                <button type="button" aria-pressed={draftMode === "dark"} onClick={() => selectDraftMode("dark")}>
                  Couleurs sombres
                </button>
              </div>
              <div className="color-theme-fields">
                {COLOR_FIELDS.map(field => (
                  <label className="color-theme-field" key={field.key}>
                    <span>{field.label}</span>
                    <input
                      type="color"
                      value={draftColors[draftMode][field.key]}
                      onChange={event => updateDraftColor(field.key, event.target.value)}
                    />
                  </label>
                ))}
              </div>
              <p className="color-theme-hint">Choisis les couleurs claires et sombres. Le mode Appareil suit les préférences de l’appareil.</p>
              <div className="color-theme-actions">
                <Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer le thème</Button>
              </div>
            </form>
          </dialog>
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function readCustomThemes(): ColorTheme[] {
  const stored = localStorage.getItem("pap-custom-color-themes");
  if (stored === null) return [];
  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) {
    throw new Error("Saved color themes have an invalid format.");
  }
  return parsed.map(theme => {
    if (isColorTheme(theme)) return theme;
    if (isLegacyColorTheme(theme)) {
      return {
        id: theme.id,
        name: theme.name,
        custom: true,
        colors: luminance(theme.colors.paper) < 0.35
          ? { light: createLightVariant(theme.colors), dark: theme.colors }
          : { light: theme.colors, dark: createDarkVariant(theme.colors) }
      };
    }
    throw new Error("Saved color themes have an invalid format.");
  });
}

function isColorTheme(value: unknown): value is ColorTheme {
  if (!value || typeof value !== "object") return false;
  const theme = value as Partial<ColorTheme>;
  return theme.custom === true
    && typeof theme.id === "string"
    && theme.id.startsWith("custom-")
    && typeof theme.name === "string"
    && theme.name.length > 0
    && isThemeColorModes(theme.colors);
}

function isLegacyColorTheme(value: unknown): value is { id: string; name: string; custom: true; colors: ThemeColors } {
  if (!value || typeof value !== "object") return false;
  const theme = value as Partial<{ id: string; name: string; custom: true; colors: ThemeColors }>;
  return theme.custom === true
    && typeof theme.id === "string"
    && theme.id.startsWith("custom-")
    && typeof theme.name === "string"
    && theme.name.length > 0
    && isThemeColors(theme.colors);
}

function isThemeColorModes(value: unknown): value is ThemeColorModes {
  if (!value || typeof value !== "object") return false;
  const modes = value as Partial<ThemeColorModes>;
  return isThemeColors(modes.light) && isThemeColors(modes.dark);
}

function isThemeColors(value: unknown): value is ThemeColors {
  if (!value || typeof value !== "object") return false;
  const colors = value as Partial<ThemeColors>;
  return COLOR_FIELDS.every(field =>
    typeof colors[field.key] === "string" && /^#[\da-f]{6}$/i.test(colors[field.key] ?? "")
  );
}

function readColorMode(value: string | null): ColorMode {
  return value === "light" || value === "dark" ? value : "system";
}

function createDarkVariant(colors: ThemeColors): ThemeColors {
  return {
    paper: "#10161E",
    card: "#18222D",
    ink: "#E5ECF4",
    teal: mixHex(colors.teal, "#FFFFFF", 0.35)
  };
}

function createLightVariant(colors: ThemeColors): ThemeColors {
  return {
    paper: "#F3F6F9",
    card: "#FFFFFF",
    ink: "#1D2A3A",
    teal: mixHex(colors.teal, "#000000", 0.2)
  };
}

function applyTheme(theme: ColorTheme, mode: ColorMode, systemDark: boolean) {
  const root = document.documentElement;
  const isDark = mode === "dark" || (mode === "system" && systemDark);
  const { paper, card, ink, teal } = theme.colors[isDark ? "dark" : "light"];
  root.style.setProperty("--paper", paper);
  root.style.setProperty("--card", card);
  root.style.setProperty("--ink", ink);
  root.style.setProperty("--teal", teal);
  root.style.setProperty("--teal-soft", `color-mix(in srgb, ${teal} 15%, ${card})`);
  root.style.setProperty("--muted", `color-mix(in srgb, ${ink} 65%, ${card})`);
  root.style.setProperty("--line", `color-mix(in srgb, ${ink} 16%, ${card})`);
  root.style.setProperty("--focus", teal);
  root.style.setProperty("--accent", isDark ? "#FF7586" : "#C8102E");
  root.style.setProperty("--sun", isDark ? "#F5C842" : "#F2B705");
  root.style.setProperty("--ok", isDark ? "#4CC38A" : "#23885A");
  root.style.setProperty("--ok-soft", `color-mix(in srgb, var(--ok) 18%, ${card})`);
  root.style.setProperty("--warn-soft", `color-mix(in srgb, var(--accent) 15%, ${card})`);
  root.style.setProperty("--guide", `color-mix(in srgb, ${ink} 24%, ${card})`);
  root.style.setProperty("--sheet", card);
  root.style.setProperty("--sheet-ink", ink);
  root.style.setProperty("--shadow", isDark
    ? "0 1px 2px rgba(0,0,0,.3), 0 8px 22px rgba(0,0,0,.25)"
    : "0 1px 2px rgba(29,42,58,.06), 0 6px 18px rgba(29,42,58,.06)");
  root.style.colorScheme = isDark ? "dark" : "light";
}

function mixHex(color: string, mix: string, amount: number): string {
  const channels = color.slice(1).match(/.{2}/g)?.map(channel => Number.parseInt(channel, 16)) ?? [0, 0, 0];
  const mixChannels = mix.slice(1).match(/.{2}/g)?.map(channel => Number.parseInt(channel, 16)) ?? [0, 0, 0];
  return `#${channels.map((channel, index) =>
    Math.round(channel + (mixChannels[index] - channel) * amount).toString(16).padStart(2, "0")
  ).join("")}`;
}

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)?.map(channel => Number.parseInt(channel, 16) / 255) ?? [1, 1, 1];
  const [red, green, blue] = channels.map(channel =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
