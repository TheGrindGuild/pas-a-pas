"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const WORDS = [
  { word: "bonjour", hint: "On le dit pour saluer.", picture: "👋" },
  { word: "merci", hint: "On le dit après avoir reçu quelque chose.", picture: "🙏" },
  { word: "chat", hint: "Cet animal dit « miaou ».", picture: "🐱" },
  { word: "chien", hint: "Cet animal dit « ouaf ».", picture: "🐶" },
  { word: "pomme", hint: "C'est un fruit souvent rouge ou vert.", picture: "🍎" },
  { word: "banane", hint: "C'est un fruit jaune.", picture: "🍌" },
  { word: "fromage", hint: "On en mange avec des craquelins.", picture: "🧀" },
  { word: "livre", hint: "On le lit pour découvrir une histoire.", picture: "📖" },
  { word: "école", hint: "On y apprend avec sa classe.", picture: "🏫" },
  { word: "neige", hint: "Elle tombe du ciel en hiver.", picture: "❄️" },
  { word: "cadeau", hint: "On en reçoit souvent pour son anniversaire.", picture: "🎁" },
  { word: "sapin", hint: "On le décore à Noël.", picture: "🎄" },
  { word: "étoile", hint: "Elle brille dans le ciel la nuit.", picture: "⭐" },
  { word: "renne", hint: "Cet animal tire le traîneau du père Noël.", picture: "🦌" },
  { word: "soleil", hint: "Il brille dans le ciel pendant la journée.", picture: "☀️" },
  { word: "famille", hint: "Ce sont les personnes qui vivent avec toi ou que tu aimes.", picture: "👨‍👩‍👧‍👦" },
  { word: "maison", hint: "C'est un endroit où l'on habite.", picture: "🏠" },
  { word: "poisson", hint: "Cet animal nage dans l'eau.", picture: "🐟" },
  { word: "lapin", hint: "Cet animal a de longues oreilles.", picture: "🐰" },
  { word: "gâteau", hint: "C'est un dessert souvent servi pour une fête.", picture: "🎂" },
  { word: "oiseau", hint: "Cet animal a des ailes et peut voler.", picture: "🐦" },
  { word: "fleur", hint: "Elle pousse dans un jardin au printemps.", picture: "🌷" },
  { word: "vélo", hint: "On le conduit avec deux roues et des pédales.", picture: "🚲" },
  { word: "ballon", hint: "On le lance ou on le frappe pour jouer.", picture: "⚽" },
  { word: "bateau", hint: "Il voyage sur l'eau.", picture: "⛵" },
  { word: "cloche", hint: "Elle sonne pour annoncer quelque chose.", picture: "🔔" }
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_ERRORS = 6;

function normalizeLetter(letter: string): string {
  return letter.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
}

function pickWord(except: number): number {
  const choices = WORDS.map((_, index) => index).filter(index => index !== except);
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function HangmanActivity() {
  const [wordIndex, setWordIndex] = useState(0);
  const [guessed, setGuessed] = useState<string[]>([]);
  const word = WORDS[wordIndex];
  const letters = word.word.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase().split("");
  const errors = guessed.filter(letter => !letters.includes(letter)).length;
  const won = letters.every(letter => guessed.includes(letter));
  const lost = errors >= MAX_ERRORS;
  const finished = won || lost;

  useEffect(() => {
    setWordIndex(Math.floor(Math.random() * WORDS.length));
  }, []);

  useEffect(() => {
    if (finished) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && (
        event.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
      )) return;
      const letter = normalizeLetter(event.key);
      if (!/^[A-Z]$/.test(letter)) return;
      setGuessed(current => current.includes(letter) ? current : [...current, letter]);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finished]);

  const startNewRound = () => {
    setWordIndex(current => pickWord(current));
    setGuessed([]);
  };

  return (
    <div className="hangman-game">
      <div className="hangman-picture">
        <svg viewBox="0 0 180 190" role="img" aria-label={`Dessin du pendu : ${errors} erreur${errors === 1 ? "" : "s"} sur ${MAX_ERRORS}`}>
          <g className="hangman-frame">
            <path d="M25 174h130M55 174V20h75v20" />
          </g>
          {errors > 0 && <circle className="hangman-part" cx="130" cy="55" r="17" />}
          {errors > 1 && <path className="hangman-part" d="M130 72v47" />}
          {errors > 2 && <path className="hangman-part" d="m130 82-25 23" />}
          {errors > 3 && <path className="hangman-part" d="m130 82 25 23" />}
          {errors > 4 && <path className="hangman-part" d="m130 119-22 31" />}
          {errors > 5 && <path className="hangman-part" d="m130 119 22 31" />}
        </svg>
        <p className="hangman-errors" aria-live="polite">Erreurs : {errors} / {MAX_ERRORS}</p>
      </div>

      <div className="hangman-play">
        <p className="hangman-hint"><b>Indice :</b> {word.hint}</p>
        <div className="hangman-word" aria-label={finished ? word.word : "Mot à deviner"}>
          {Array.from(word.word).map((character, index) => {
            const letter = normalizeLetter(character);
            if (!/^[A-Z]$/.test(letter)) {
              return <span className="hangman-punctuation" aria-hidden="true" key={`${character}-${index}`}>{character}</span>;
            }
            const revealed = guessed.includes(letter) || finished;
            return (
              <span className={`hangman-slot${revealed ? " revealed" : ""}`} aria-hidden="true" key={`${character}-${index}`}>
                {revealed ? character : ""}
              </span>
            );
          })}
        </div>
        <p className={`hangman-feedback${won ? " won" : ""}`} aria-live="polite">
          {won ? "Bravo ! Tu as trouvé le mot !" : lost ? `Le mot était « ${word.word} ». On essaie encore ?` : "Choisis une lettre pour deviner le mot."}
        </p>
        <div className="hangman-keyboard" role="group" aria-label="Choisis une lettre">
          {ALPHABET.map(letter => (
            <Button
              className="hangman-key"
              type="button"
              variant="outline"
              key={letter}
              disabled={finished || guessed.includes(letter)}
              aria-label={`Lettre ${letter}${guessed.includes(letter) ? " déjà choisie" : ""}`}
              onClick={() => setGuessed(current => current.includes(letter) ? current : [...current, letter])}
            >
              {letter}
            </Button>
          ))}
        </div>
        <p className="hangman-note">Une lettre sans accent révèle aussi les lettres accentuées, comme E pour é.</p>
        {finished && <Button className="btn main hangman-restart" type="button" onClick={startNewRound}>Nouveau mot</Button>}
      </div>
    </div>
  );
}
