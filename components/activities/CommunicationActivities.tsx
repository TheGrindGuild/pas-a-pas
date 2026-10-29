"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActivityProps } from "./shared";
import { Counter, Feedback, Navigation, pick, praise, shuffle, speak, wordText, WordPicture, type VocabularyWord } from "./shared";
import { NUMS } from "./data";
import { Button } from "../ui/button";

const SENTENCE_FRAMES: Record<string, (text: string, word: VocabularyWord) => [string, string, string]> = {
  besoins: (_text, word) => ["J'ai besoin", word.s ?? word.fr, "."],
  emotions: text => ["Je suis", text, "."],
  couleurs: (_text, word) => ["J'aime le", word.fr, "."],
  nombres: text => ["J'ai", text, "ans."],
  nourriture: text => ["J'aime", text, "."],
  canada: text => ["J'aime", text, "."],
  meteo: text => ["Aujourd'hui,", text, "."],
  jours: text => ["Aujourd'hui, c'est", text, "."],
  salut: text => ["Je dis :", `« ${text} »`, ""],
  routine: text => ["Je dis :", `« ${text} »`, ""],
  consignes: text => ["Jacques dit :", `« ${text} »`, ""]
};

export function PhraseActivity({ theme, gender, slow }: ActivityProps) {
  const words = theme.id === "nombres" ? theme.words.filter(word => word.num !== undefined && word.num >= 5 && word.num <= 12) : theme.words;
  const [chosen, setChosen] = useState<VocabularyWord | null>(null);
  const text = chosen ? wordText(chosen, gender) : wordText(words[0], gender);
  const frame = (SENTENCE_FRAMES[theme.id] ?? (value => ["Voici", value, "."]))(text, chosen ?? words[0]);
  const sentence = `${frame[0]} ${frame[1]} ${frame[2]}`.replace(/\s+/g, " ").trim();
  return (
    <>
      <div className="frame" aria-live="polite"><span>{frame[0]}</span><span className={`slot${chosen ? " filled" : ""}`}>
        {chosen ? <><span className="p"><WordPicture word={chosen} gender={gender} /></span>{frame[1]}</> : "?"}
      </span>{frame[2] && <span>{frame[2]}</span>}</div>
      <div className="btns" style={{ marginBottom: 12 }}><Button type="button" className="btn main" disabled={!chosen} onClick={() => speak(sentence, slow)}>🔊 Écoute la phrase</Button></div>
      {chosen && <SayThree />}
      <div className="pickgrid">{words.map((word, index) =>
        <Button key={index} type="button" variant="outline" className="card" aria-pressed={chosen === word} onClick={() => {
          setChosen(word);
          const parts = (SENTENCE_FRAMES[theme.id] ?? (value => ["Voici", value, "."]))(wordText(word, gender), word);
          speak(`${parts[0]} ${parts[1]} ${parts[2]}`.replace(/\s+/g, " ").trim(), slow);
        }}><span className="p"><WordPicture word={word} gender={gender} /></span><span className="w">{wordText(word, gender)}</span></Button>
      )}</div>
    </>
  );
}

function SayThree() {
  const [active, setActive] = useState<boolean[]>([false, false, false]);
  return <div className="say3" style={{ marginBottom: 18 }}><span className="lbl">Dis la phrase :</span>
    {active.map((on, index) => <Button key={index} type="button" variant="ghost" className={`dot3${on ? " on" : ""}`} aria-label={`Fois ${index + 1}`} onClick={() => setActive(active.map((value, i) => i === index ? !value : value))}>{index + 1}</Button>)}
  </div>;
}

const SIMON = [
  { fr: "touche ta tête", e: "🙆" }, { fr: "touche ton nez", e: "👃" }, { fr: "touche tes oreilles", e: "👂" },
  { fr: "lève la main", e: "✋" }, { fr: "lève les bras", e: "🙌" }, { fr: "lève le pied", e: "🦶" },
  { fr: "saute", e: "🦘" }, { fr: "tourne", e: "🔄" }, { fr: "tape des mains", e: "👏" },
  { fr: "assieds-toi", e: "🪑" }, { fr: "lève-toi", e: "🧍" }, { fr: "frotte ton ventre", e: "🫃" }
];

export function JacquesActivity({ slow }: ActivityProps) {
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [challenge, setChallenge] = useState(() => nextChallenge(-1, 0));
  function nextChallenge(previous: number, currentRound: number) {
    let index = Math.floor(Math.random() * SIMON.length);
    while (index === previous) index = Math.floor(Math.random() * SIMON.length);
    return { item: SIMON[index], says: currentRound < 2 || Math.random() < 0.6 };
  }
  const command = `${challenge.item.fr.charAt(0).toUpperCase()}${challenge.item.fr.slice(1)} !`;
  const text = challenge.says ? `Jacques a dit : ${challenge.item.fr} !` : command;
  const answer = (move: boolean) => {
    const correct = move === challenge.says;
    setFeedback(correct ? praise() : "Essaie encore !");
    if (correct) setRound(round + 1);
    setChallenge(nextChallenge(SIMON.indexOf(challenge.item), round + 1));
  };
  return <div className="flash">
    <div className="big"><span className="emoji">{challenge.item.e}</span></div>
    <div className="simon"><span className={`who${challenge.says ? "" : " gone"}`}>Jacques a dit :</span><span className="word">{challenge.says ? `${challenge.item.fr} !` : command}</span></div>
    <div className="btns"><Button type="button" variant="outline" className="btn" onClick={() => speak(text, slow)}>🔊 Encore</Button></div>
    <div className="btns"><Button type="button" className="btn main" onClick={() => answer(true)}>🏃 Je bouge</Button><Button type="button" variant="outline" className="btn" onClick={() => answer(false)}>🧊 Je ne bouge pas</Button></div>
    <Feedback>{feedback}</Feedback><Counter current={round} total={round + 1} />
  </div>;
}

export function ManqueActivity({ theme, gender, slow }: ActivityProps) {
  const [deal, setDeal] = useState(() => createMissingDeal(theme.words));
  const [feedback, setFeedback] = useState("");
  const [revealed, setRevealed] = useState(false);
  const reset = () => {
    setDeal(createMissingDeal(theme.words));
    setFeedback("");
    setRevealed(false);
  };
  const { round, missing, choices } = deal;
  return <>
    <div className="mgrid">{round.map((word, index) => <div key={index} className={`mslot${index === missing && !revealed ? " empty" : ""}`}>
      {index === missing && !revealed ? "?" : <><span className="p"><WordPicture word={word} gender={gender} /></span><span className="w">{wordText(word, gender)}</span></>}
    </div>)}</div>
    <div className="choices">{choices.map((word, index) =>
      <Button key={index} type="button" variant="outline" className={`choice${revealed && word === round[missing] ? " good" : ""}`} disabled={revealed} onClick={() => {
        const correct = word === round[missing];
        setFeedback(correct ? praise() : "Essaie encore !");
        if (correct) {
          setRevealed(true);
          speak(wordText(word, gender), slow);
        }
      }}><WordPicture word={word} gender={gender} /></Button>
    )}</div>
    <Feedback>{feedback}</Feedback>
    {revealed && <div className="btns"><Button type="button" variant="outline" className="btn" onClick={reset}>Encore →</Button></div>}
  </>;
}

function createMissingDeal(words: ActivityProps["theme"]["words"]) {
  const round = pick(words, Math.min(4, words.length));
  const missing = Math.floor(Math.random() * round.length);
  const choices = shuffle([
    round[missing],
    ...pick(words.filter(word => !round.includes(word)), Math.min(3, words.length - round.length))
  ]);
  return { round, missing, choices };
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyzàâæçéèêëîïôœùûüÿ".split("");
const normalizeLetter = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function LettreActivity({ theme, gender, slow }: ActivityProps) {
  const [order, setOrder] = useState(() => shuffle(theme.words));
  const [index, setIndex] = useState(0);
  const [holeIndex, setHoleIndex] = useState(() => 0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const word = wordText(order[index], gender);
  useEffect(() => {
    const letters = [...word].map((letter, position) => ({ letter, position })).filter(item => /\p{L}/u.test(item.letter));
    setHoleIndex(letters[Math.floor(Math.random() * letters.length)]?.position ?? 0);
    setSelected(null);
    setFeedback("");
  }, [word]);
  const correct = [...word][holeIndex]?.toLowerCase() ?? "";
  const choices = useMemo(() => shuffle([correct, ...pick(ALPHABET.filter(letter => normalizeLetter(letter) !== normalizeLetter(correct)), 2)]), [correct]);
  const next = () => {
    if (index + 1 >= order.length) {
      setOrder(shuffle(theme.words));
      setIndex(0);
    } else setIndex(index + 1);
  };
  return <div className="flash">
    <div className="big"><WordPicture word={order[index]} gender={gender} /></div>
    <div className="word spell">{[...word].map((letter, position) => position === holeIndex ?
      <span className={`gap${selected === correct ? " filled" : ""}`} key={position}>{selected === correct ? letter : "_"}</span> : <span key={position}>{letter}</span>
    )}</div>
    <div className="btns"><Button type="button" variant="outline" className="btn" onClick={() => speak(word, slow)}>🔊 Écoute</Button></div>
    <div className="letters">{choices.map(letter =>
      <Button key={letter} type="button" variant="outline" className={`lt${selected === letter ? " good" : ""}`} disabled={selected !== null && selected === correct} onClick={() => {
        if (letter === correct) {
          setSelected(letter);
          setFeedback(praise());
          speak(word, slow);
        } else setFeedback("Essaie une autre lettre !");
      }}>{letter}</Button>
    )}</div>
    <Feedback>{feedback}</Feedback>
    <Navigation current={index + 1} total={order.length} onNext={next} nextLabel="Mot suivant →" />
  </div>;
}

export function EnregistreActivity({ theme, gender, slow }: ActivityProps) {
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [available, setAvailable] = useState(true);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);
  const word = theme.words[index];
  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current !== null) window.clearTimeout(recordingTimeoutRef.current);
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);
  const startRecording = async () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setAvailable(false);
      setFeedback("Le micro n'est pas disponible ici.");
      return;
    }
    try {
      streamRef.current ??= await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(streamRef.current);
      recorderRef.current = recorder;
      recorder.ondataavailable = event => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const nextUrl = URL.createObjectURL(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
        setAudioUrl(nextUrl);
        setRecording(false);
        setFeedback("Écoute ta voix, puis le modèle.");
        void new Audio(nextUrl).play();
      };
      recorder.start();
      setRecording(true);
      setFeedback("Je t'écoute…");
      recordingTimeoutRef.current = window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 6000);
    } catch {
      setAvailable(false);
      setFeedback("Le micro n'est pas disponible ici.");
    }
  };
  const move = (offset: number) => {
    const next = (index + offset + theme.words.length) % theme.words.length;
    setIndex(next);
    setFeedback("");
    setAudioUrl(null);
    speak(wordText(theme.words[next], gender), slow);
  };
  return <div className="flash">
    <div className="big"><WordPicture word={word} gender={gender} /></div>
    <div className="word">{wordText(word, gender)}</div>
    <div className="recrow">
      <Button type="button" variant="outline" className="btn" onClick={() => speak(wordText(word, gender), slow)}>🔊 Le modèle</Button>
      <Button type="button" className={`btn main mic${recording ? " live" : ""}`} disabled={!available} aria-pressed={recording} onClick={startRecording}>{recording ? "⏹️ Arrête" : "🎙️ Enregistre"}</Button>
      <Button type="button" variant="outline" className="btn" disabled={!audioUrl} onClick={() => { if (audioUrl) void new Audio(audioUrl).play(); }}>▶️ Ma voix</Button>
    </div>
    <Feedback tone={audioUrl ? "ok" : !available ? "try" : ""}>{feedback}</Feedback>
    <Navigation current={index + 1} total={theme.words.length} onPrevious={() => move(-1)} onNext={() => move(1)} />
  </div>;
}
