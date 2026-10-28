"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Theme, VocabularyWord } from "./data";
export type { VocabularyWord } from "./data";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export type Gender = "m" | "f";
export type SpeechRequest = { text: string; slow: boolean };

declare global {
  interface WindowEventMap {
    "pas-a-pas:speech": CustomEvent<SpeechRequest>;
  }
}

export function wordText(word: VocabularyWord, gender: Gender): string {
  return gender === "f" && word.f ? word.f : word.fr;
}

export function WordPicture({ word, gender }: { word: VocabularyWord; gender: Gender }) {
  if (word.color) {
    return <span className="swatch" style={{ "--sw": word.color } as CSSProperties} aria-hidden="true" />;
  }
  if (word.num !== undefined) {
    return <span className="numeral" aria-hidden="true">{word.num}</span>;
  }
  if (word.day !== undefined) {
    return (
      <span className="week" aria-hidden="true">
        {"LMMJVSD".split("").map((day, index) => <span className={index === word.day ? "on" : ""} key={index}>{day}</span>)}
      </span>
    );
  }
  return <span className="emoji" aria-hidden="true">{gender === "f" && word.ef ? word.ef : word.e}</span>;
}

export function shuffle<T>(values: T[]): T[] {
  const result = values.slice();
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function pick<T>(values: T[], count: number): T[] {
  return shuffle(values).slice(0, Math.min(count, values.length));
}

export function praise(): string {
  const choices = ["Bravo !", "Super !", "Excellent !", "Oui !", "Fantastique !"];
  return choices[Math.floor(Math.random() * choices.length)];
}

export function speak(text: string, slow = false): void {
  window.dispatchEvent(new CustomEvent<SpeechRequest>("pas-a-pas:speech", {
    detail: { text, slow }
  }));
}

export const ACTIVITY_GUIDANCE: Record<string, string> = {
  ecoute: "Touche le haut-parleur. Écoute. Dis le mot à voix haute et touche un rond chaque fois.",
  lis: "Lis le mot à voix haute. Ensuite, touche « Vérifie » pour voir l'image et entendre le mot.",
  trouve: "Écoute le mot. Touche la bonne image. Tu peux réécouter autant de fois que tu veux.",
  trace: "Suis les lettres grises avec ton doigt ou la souris. Dis le mot pendant que tu écris.",
  colorie: "Choisis une couleur, puis touche une partie du dessin avec ce numéro.",
  trie: "Touche une carte, puis touche la boîte où elle va.",
  points: "Compte en français et touche les points dans l'ordre.",
  associe: "Touche une image, puis touche son mot. Les paires prennent la même couleur.",
  memoire: "Touche deux cartes. Si c'est la même image, c'est une paire !",
  phrase: "Choisis une image. Elle finit la phrase. Écoute la phrase, puis dis-la à voix haute.",
  jacques: "Écoute l'ordre. Bouge seulement si Jacques a dit !",
  manque: "Regarde les images. Laquelle est partie ?",
  lettre: "Regarde l'image et écoute le mot. Quelle lettre manque ?",
  enregistre: "Écoute le mot. Touche le micro et dis le mot."
};

export const ACTIVITY_NAMES: Record<string, string> = {
  ecoute: "Écoute et répète",
  lis: "Lis et répète",
  trouve: "Écoute et trouve",
  trace: "Trace le mot",
  colorie: "Colorie par numéro",
  trie: "Trie les mots",
  points: "Relie les points",
  associe: "Associe",
  memoire: "Mémoire",
  phrase: "Bâtis la phrase",
  jacques: "Jacques a dit",
  manque: "Qu'est-ce qui manque ?",
  lettre: "La lettre manquante",
  enregistre: "Enregistre-toi"
};

export type ActivityProps = {
  theme: Theme;
  gender: Gender;
  slow: boolean;
};

export function ActivityFrame({
  id,
  theme,
  gender,
  onGenderChange,
  children
}: {
  id: string;
  theme: Theme;
  gender: Gender;
  onGenderChange: (gender: Gender) => void;
  children: ReactNode;
}) {
  const gendered = theme.words.some(word => word.f);
  return (
    <>
      <div className="act-head">
        <a className="back" href="#"><span aria-hidden="true">←</span> Activités</a>
        <h1>{ACTIVITY_NAMES[id]}</h1>
        <Badge variant="outline" className="chip" aria-hidden="true">
          <span className="mini"><WordPicture word={theme.words[theme.id === "nombres" ? 5 : 0]} gender={gender} /></span>
          {theme.name}
        </Badge>
        {gendered && (
          <div className="gseg" role="group" aria-label="Masculin ou féminin">
            <Button type="button" variant="ghost" className="gender-choice" aria-pressed={gender === "m"} onClick={() => onGenderChange("m")}><b>le</b> masculin</Button>
            <Button type="button" variant="ghost" className="gender-choice" aria-pressed={gender === "f"} onClick={() => onGenderChange("f")}><b>la</b> féminin</Button>
          </div>
        )}
        <p className="how">{ACTIVITY_GUIDANCE[id]}</p>
      </div>
      <Card className="panel">{children}</Card>
    </>
  );
}

export function Feedback({ children, tone = "" }: { children: ReactNode; tone?: "ok" | "try" | "" }) {
  return <div className={`feedback${tone ? ` ${tone}` : ""}`} aria-live="polite">{children}</div>;
}

export function Counter({ current, total }: { current: number; total: number }) {
  return <span className="counter">{current} / {total}</span>;
}

export function Navigation({ current, total, onPrevious, onNext, nextLabel = "Après →" }: {
  current: number;
  total: number;
  onPrevious?: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="btns">
      {onPrevious && <Button type="button" variant="outline" className="btn" onClick={onPrevious}>← Avant</Button>}
      <Counter current={current} total={total} />
      <Button type="button" variant="outline" className="btn" onClick={onNext}>{nextLabel}</Button>
    </div>
  );
}
