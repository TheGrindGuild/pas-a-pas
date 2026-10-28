"use client";

import { useState } from "react";
import type { ActivityProps } from "./shared";
import { Feedback, Navigation, pick, praise, shuffle, speak, wordText, WordPicture } from "./shared";
import { Button } from "../ui/button";

export function EcouteActivity({ theme, gender, slow }: ActivityProps) {
  const [index, setIndex] = useState(0);
  const [taps, setTaps] = useState<boolean[]>([false, false, false]);
  const [message, setMessage] = useState("");
  const word = theme.words[index];
  const changeWord = (next: number) => {
    const updated = (next + theme.words.length) % theme.words.length;
    setIndex(updated);
    setTaps([false, false, false]);
    setMessage("");
    speak(wordText(theme.words[updated], gender), slow);
  };
  return (
    <div className="flash">
      <div className="big"><WordPicture word={word} gender={gender} /></div>
      <div className="word">{wordText(word, gender)}</div>
      <div className="btns"><Button type="button" className="btn main" onClick={() => speak(wordText(word, gender), slow)}>🔊 Écoute</Button></div>
      <div className="say3"><span className="lbl">Dis-le 3 fois :</span>{taps.map((active, i) =>
        <Button key={i} type="button" variant="ghost" className={`dot3${active ? " on" : ""}`} aria-label={`Fois ${i + 1}`} onClick={() => {
          const next = taps.map((value, n) => n === i ? !value : value);
          setTaps(next);
          if (next.every(Boolean)) setMessage(praise());
        }}>{i + 1}</Button>
      )}</div>
      <Navigation current={index + 1} total={theme.words.length}
        onPrevious={() => changeWord(index - 1)} onNext={() => changeWord(index + 1)} />
      <Feedback tone="ok">{message}</Feedback>
    </div>
  );
}

export function LisActivity({ theme, gender, slow }: ActivityProps) {
  const [order, setOrder] = useState(() => shuffle(theme.words));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const word = order[index];
  const next = () => {
    if (index + 1 >= order.length) {
      setOrder(shuffle(theme.words));
      setIndex(0);
    } else setIndex(index + 1);
    setRevealed(false);
  };
  return (
    <div className="flash">
      <div className="word">{wordText(word, gender)}</div>
      <div className="big reveal" aria-live="polite">{revealed && <WordPicture word={word} gender={gender} />}</div>
      <div className="btns">
        {!revealed && <Button type="button" className="btn main" onClick={() => {
          setRevealed(true);
          speak(wordText(word, gender), slow);
        }}>✔ Vérifie</Button>}
        {revealed && <Button type="button" variant="outline" className="btn" onClick={() => speak(wordText(word, gender), slow)}>🔊 Encore</Button>}
      </div>
      <Navigation current={index + 1} total={order.length} onNext={next} nextLabel="Mot suivant →" />
    </div>
  );
}

export function TrouveActivity({ theme, gender, slow }: ActivityProps) {
  const [round, setRound] = useState(() => pick(theme.words, Math.min(4, theme.words.length)));
  const [target, setTarget] = useState(() => round[Math.floor(Math.random() * round.length)]);
  const [misses, setMisses] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const [feedback, setFeedback] = useState("");
  const next = () => {
    const options = pick(theme.words, Math.min(4, theme.words.length));
    setRound(options);
    setTarget(options[Math.floor(Math.random() * options.length)]);
    setMisses([]);
    setComplete(false);
    setFeedback("");
  };
  return (
    <div className="flash">
      <div className="btns"><Button type="button" className="btn main" onClick={() => speak(wordText(target, gender), slow)}>🔊 Écoute</Button></div>
      <div className="choices">{round.map((word, index) =>
        <Button key={`${word.fr}-${index}`} type="button" variant="outline" className={`choice${complete && word === target ? " good" : ""}${misses.includes(index) ? " nope" : ""}`}
          aria-label={`Image ${index + 1}`} disabled={complete || misses.includes(index)} onClick={() => {
            if (word === target) {
              setComplete(true);
              setFeedback(`${praise()} ${wordText(word, gender)}`);
              speak(wordText(word, gender), slow);
            } else {
              setMisses([...misses, index]);
              setFeedback("Essaie encore !");
              setTimeout(() => speak(wordText(target, gender), slow), 400);
            }
          }}><WordPicture word={word} gender={gender} /></Button>
      )}</div>
      <Feedback tone={complete ? "ok" : feedback ? "try" : ""}>{feedback}</Feedback>
      <div className="btns">{complete && <Button type="button" variant="outline" className="btn" onClick={next}>Encore un →</Button>}</div>
    </div>
  );
}
