"use client";

import { type DragEvent, useMemo, useState } from "react";
import type { ActivityProps } from "./shared";
import { Button } from "../ui/button";
import { Feedback, praise, shuffle, speak } from "./shared";

type SentencePuzzle = {
  sentence: string;
  distractors: string[];
};

function sentenceTiles(sentence: string): string[] {
  return sentence.split(" ").reduce<string[]>((tiles, word) => {
    if (/^[!?.,;:]+$/.test(word) && tiles.length) {
      tiles[tiles.length - 1] += ` ${word}`;
    } else {
      tiles.push(word);
    }
    return tiles;
  }, []);
}

const SENTENCES: Record<string, SentencePuzzle[]> = {
  salut: [
    { sentence: "Bonjour !", distractors: ["Merci", "Salut", "Non"] },
    { sentence: "Je dis merci.", distractors: ["Tu", "bonjour", "rouge"] },
    { sentence: "Bonne nuit !", distractors: ["au", "revoir", "bonjour"] }
  ],
  couleurs: [
    { sentence: "Le ciel est bleu.", distractors: ["la", "rouge", "vert."] },
    { sentence: "J'aime le rouge.", distractors: ["la", "bleue", "suis"] },
    { sentence: "Le soleil est jaune.", distractors: ["une", "noir", "gris."] }
  ],
  nombres: [
    { sentence: "J'ai trois pommes.", distractors: ["deux", "cinq", "livres."] },
    { sentence: "J'ai deux ans.", distractors: ["un", "quatre", "jours."] },
    { sentence: "Il y a cinq livres.", distractors: ["trois", "un", "pommes."] }
  ],
  classe: [
    { sentence: "Voici le crayon.", distractors: ["la", "stylo", "mange."] },
    { sentence: "J'ai un stylo.", distractors: ["une", "crayon", "bleu."] },
    { sentence: "Où est la règle ?", distractors: ["le", "chaise", "Bonjour"] }
  ],
  animaux: [
    { sentence: "Je vois le chat.", distractors: ["la", "chien", "mange."] },
    { sentence: "Le chien court.", distractors: ["la", "chat", "bleu."] },
    { sentence: "L'oiseau chante.", distractors: ["le", "poisson", "dort."] }
  ],
  famille: [
    { sentence: "Voici ma mère.", distractors: ["mon", "frère", "bleu."] },
    { sentence: "Mon frère joue.", distractors: ["ma", "sœur", "mange."] },
    { sentence: "J'aime mon père.", distractors: ["ma", "tante", "court."] }
  ],
  nourriture: [
    { sentence: "J'aime la pomme.", distractors: ["le", "pain", "bleu."] },
    { sentence: "Je mange du pain.", distractors: ["bois", "lait", "rouge."] },
    { sentence: "Je bois du lait.", distractors: ["mange", "pomme", "vert."] }
  ],
  vetements: [
    { sentence: "Je porte le chandail.", distractors: ["la", "robe", "mange."] },
    { sentence: "La robe est rouge.", distractors: ["le", "bottes", "bleu."] },
    { sentence: "Mes bottes sont noires.", distractors: ["mon", "robe", "jaune."] }
  ],
  corps: [
    { sentence: "J'ai deux yeux.", distractors: ["trois", "nez", "bleu."] },
    { sentence: "Mon nez est petit.", distractors: ["ma", "main", "rouge."] },
    { sentence: "Je lève la main.", distractors: ["le", "pied", "mange."] }
  ],
  meteo: [
    { sentence: "Aujourd'hui, il fait froid.", distractors: ["Demain,", "chaud", "soleil."] },
    { sentence: "Il pleut aujourd'hui.", distractors: ["neige", "soleil", "demain."] },
    { sentence: "Il y a des nuages.", distractors: ["un", "soleil", "neige."] }
  ],
  jours: [
    { sentence: "Aujourd'hui, c'est lundi.", distractors: ["Demain,", "mardi", "dimanche."] },
    { sentence: "Demain, c'est mardi.", distractors: ["Hier,", "lundi", "samedi."] },
    { sentence: "Samedi, je joue.", distractors: ["Mardi,", "dors", "lundi."] }
  ],
  besoins: [
    { sentence: "J'ai besoin d'eau.", distractors: ["Je", "aide", "rouge."] },
    { sentence: "J'ai besoin d'aide.", distractors: ["Je", "eau", "bleu."] },
    { sentence: "J'ai besoin d'une pause.", distractors: ["Je", "crayon", "bonjour."] }
  ],
  emotions: [
    { sentence: "Je suis triste.", distractors: ["Tu", "content", "lève."] },
    { sentence: "Elle est contente.", distractors: ["Il", "triste", "bleu."] },
    { sentence: "Il est fatigué.", distractors: ["Elle", "calme", "mange."] }
  ],
  consignes: [
    { sentence: "Jacques dit : écoute !", distractors: ["Je", "regarde", "bonjour."] },
    { sentence: "Regarde le tableau.", distractors: ["Écoute", "la", "rouge."] },
    { sentence: "Lève la main !", distractors: ["le", "nez", "bonjour."] }
  ],
  ecole: [
    { sentence: "Je vais à l'école.", distractors: ["Tu", "classe", "rouge."] },
    { sentence: "La classe est grande.", distractors: ["Le", "petite", "bleu."] },
    { sentence: "L'autobus arrive.", distractors: ["le", "bibliothèque", "mange."] }
  ],
  routine: [
    { sentence: "Quelle est la date ?", distractors: ["Comment", "temps", "bonjour."] },
    { sentence: "Comment ça va ?", distractors: ["Quelle", "date", "rouge."] },
    { sentence: "Je m'appelle Alex.", distractors: ["Tu", "présent", "mange."] }
  ],
  halloween: [
    { sentence: "C'est l'Halloween !", distractors: ["Il", "est", "fantôme."] },
    { sentence: "Le fantôme arrive.", distractors: ["La", "citrouille", "mange."] },
    { sentence: "La citrouille est orange.", distractors: ["Le", "fantôme", "noir."] }
  ],
  hiver: [
    { sentence: "Il neige en hiver.", distractors: ["Elle", "soleil", "chaud."] },
    { sentence: "Le bonhomme de neige est grand.", distractors: ["La", "glace", "petit."] },
    { sentence: "J'aime le chocolat chaud.", distractors: ["Je", "neige", "froid."] }
  ],
  noel: [
    { sentence: "Le père Noël arrive.", distractors: ["La", "cadeau", "mange."] },
    { sentence: "Le sapin est vert.", distractors: ["La", "rouge", "neige."] },
    { sentence: "J'aime les cadeaux.", distractors: ["Je", "sapin", "arrive."] }
  ],
  canada: [
    { sentence: "J'aime le Canada.", distractors: ["Je", "poutine", "bleu."] },
    { sentence: "Le castor nage.", distractors: ["La", "hockey", "rouge."] },
    { sentence: "La poutine est bonne.", distractors: ["Le", "sirop", "bleu."] }
  ]
};

export function ConstruisActivity({ theme, slow }: ActivityProps) {
  const [rounds, setRounds] = useState(() => shuffle(SENTENCES[theme.id]));
  const [roundIndex, setRoundIndex] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);
  const [spoken, setSpoken] = useState<boolean[]>([false, false]);
  const [finished, setFinished] = useState(false);
  const puzzle = rounds[roundIndex];
  const tiles = useMemo(() => {
    if (!puzzle) return [];
    return shuffle([...sentenceTiles(puzzle.sentence), ...puzzle.distractors]);
  }, [puzzle]);

  const addTile = (id: number) => {
    if (solved) return;
    setPlaced(current => current.includes(id) ? current : [...current, id]);
    setFeedback("");
  };
  const removeTile = (id: number) => {
    if (solved) return;
    setPlaced(current => current.filter(tileId => tileId !== id));
    setFeedback("");
  };
  const dropTile = (event: DragEvent<HTMLDivElement>, target: "answer" | "bank") => {
    event.preventDefault();
    const id = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isInteger(id) || id < 0 || id >= tiles.length) return;
    if (target === "answer") addTile(id);
    else removeTile(id);
  };
  const checkAnswer = () => {
    if (placed.map(id => tiles[id]).join(" ") === puzzle.sentence) {
      setSolved(true);
      setFeedback(praise());
    } else {
      setFeedback("Pas tout à fait. Essaie encore !");
    }
  };
  const nextRound = () => {
    if (roundIndex + 1 === rounds.length) {
      setFinished(true);
      return;
    }
    setRoundIndex(index => index + 1);
    setPlaced([]);
    setSolved(false);
    setSpoken([false, false]);
    setFeedback("");
  };
  const restart = () => {
    setRounds(shuffle(SENTENCES[theme.id]));
    setRoundIndex(0);
    setPlaced([]);
    setSolved(false);
    setSpoken([false, false]);
    setFinished(false);
    setFeedback("");
  };

  if (finished) {
    return <div className="sentence-finished">
      <p>Bravo ! Tu as construit toutes les phrases.</p>
      <Button type="button" className="btn main" onClick={restart}>Encore →</Button>
    </div>;
  }

  return <div className="sentence-builder">
    <div className="say3" role="group" aria-label="Écouter et répéter la phrase">
      <Button type="button" className="btn main" onClick={() => speak(puzzle.sentence, slow)}>🔊 Parle la phrase</Button>
      {solved && <>
        <span className="lbl">Dis la phrase à voix haute 2 fois :</span>
        {spoken.map((done, index) =>
          <Button key={index} type="button" variant="ghost" className={`dot3${done ? " on" : ""}`}
            aria-label={done ? `Annuler la répétition ${index + 1}` : `Marquer la répétition ${index + 1} comme dite`}
            aria-pressed={done}
            onClick={() => setSpoken(current => current.map((value, i) => i === index ? !value : value))}>
            {index + 1}
          </Button>
        )}
      </>}
    </div>
    <p className="sentence-prompt">Mets les mots dans le bon ordre.</p>
    <div className="sentence-answer" aria-label="Phrase à construire"
      onDragOver={event => event.preventDefault()} onDrop={event => dropTile(event, "answer")}>
      {placed.length ? placed.map(id =>
        <Button key={id} type="button" variant="outline" className="sentence-tile placed"
          draggable={!solved} disabled={solved} aria-label={`Enlever ${tiles[id]}`} onClick={() => removeTile(id)}
          onDragStart={event => event.dataTransfer.setData("text/plain", String(id))}>{tiles[id]}</Button>
      ) : <span className="sentence-placeholder">Glisse les mots ici ou touche-les</span>}
    </div>
    <div className="sentence-bank" aria-label="Options de mots"
      onDragOver={event => event.preventDefault()} onDrop={event => dropTile(event, "bank")}>
      {tiles.map((tile, id) => placed.includes(id) ? null :
        <Button key={id} type="button" variant="outline" className="sentence-tile" draggable={!solved}
          disabled={solved} aria-pressed={placed.includes(id)} onClick={() => addTile(id)}
          onDragStart={event => event.dataTransfer.setData("text/plain", String(id))}>{tile}</Button>
      )}
    </div>
    <div className="btns">
      {!solved
        ? <Button type="button" className="btn main" disabled={!placed.length} onClick={checkAnswer}>Vérifie</Button>
        : <Button type="button" className="btn main" disabled={!spoken.every(Boolean)} onClick={nextRound}>{roundIndex + 1 === rounds.length ? "Terminé →" : "Phrase suivante →"}</Button>}
      <span className="counter">{roundIndex + 1} / {rounds.length}</span>
    </div>
    <Feedback tone={solved ? "ok" : feedback ? "try" : ""}>{feedback}</Feedback>
  </div>;
}
