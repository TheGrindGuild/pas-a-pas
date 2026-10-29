"use client";

import { useEffect, useState } from "react";
import type { ActivityProps } from "./shared";
import { Feedback, pick, praise, shuffle, speak, wordText, WordPicture, type VocabularyWord } from "./shared";
import { NUMS, THEMES } from "./data";
import { Button } from "../ui/button";

export function TrieActivity({ theme, gender, slow }: ActivityProps) {
  const otherThemes = THEMES.filter(candidate => candidate.id !== theme.id);
  const [other, setOther] = useState(() => otherThemes[Math.floor(Math.random() * otherThemes.length)]);
  const [cards, setCards] = useState(() => shuffle([
    ...pick(theme.words, 4).map(word => ({ word, group: theme.id })),
    ...pick(other.words, 4).map(word => ({ word, group: other.id }))
  ]));
  const [selected, setSelected] = useState<number | null>(null);
  const [placed, setPlaced] = useState<Record<string, number[]>>({ [theme.id]: [], [other.id]: [] });
  const [feedback, setFeedback] = useState("");
  const reset = () => {
    const nextOther = otherThemes[Math.floor(Math.random() * otherThemes.length)];
    setOther(nextOther);
    setCards(shuffle([
      ...pick(theme.words, 4).map(word => ({ word, group: theme.id })),
      ...pick(nextOther.words, 4).map(word => ({ word, group: nextOther.id }))
    ]));
    setSelected(null);
    setPlaced({ [theme.id]: [], [nextOther.id]: [] });
    setFeedback("");
  };
  return (
    <>
      <div className="pool">{cards.map((card, index) => placed[card.group]?.includes(index) ? null :
        <Button key={`${card.group}-${index}`} type="button" variant="outline" className="card" aria-pressed={selected === index} onClick={() => {
          setSelected(index);
          speak(wordText(card.word, gender), slow);
        }}><span className="p"><WordPicture word={card.word} gender={gender} /></span><span className="w">{wordText(card.word, gender)}</span></Button>
      )}</div>
      <div className="bins">{[theme, other].map(group =>
        <Button key={group.id} type="button" variant="outline" className="bin" onClick={() => {
          if (selected === null) return;
          const card = cards[selected];
          if (card.group === group.id) {
            setPlaced({ ...placed, [group.id]: [...(placed[group.id] ?? []), selected] });
            setFeedback(praise());
          } else setFeedback("Pas cette boîte. Essaie encore !");
          setSelected(null);
        }}>
          <h3>{group.name}</h3>
          <div className="in">{cards.map((card, index) => card.group === group.id && placed[group.id]?.includes(index) ?
            <span className="card" key={index}><span className="p"><WordPicture word={card.word} gender={gender} /></span><span className="w">{wordText(card.word, gender)}</span></span> : null
          )}</div>
        </Button>
      )}</div>
      <Feedback tone={feedback ? "ok" : ""}>{feedback}</Feedback>
      {Object.values(placed).reduce((sum, values) => sum + values.length, 0) === cards.length && <div className="bravo show">{praise()}<br /><Button type="button" variant="outline" className="btn" onClick={reset}>Encore →</Button></div>}
    </>
  );
}

const STAR_POINTS = Array.from({ length: 10 }, (_, index): [number, number] => {
  const angle = (-90 + index * 36) * Math.PI / 180;
  const radius = index % 2 ? 19 : 44;
  return [50 + radius * Math.cos(angle), 54 + radius * Math.sin(angle)];
});
const HEART_POINTS = Array.from({ length: 16 }, (_, index): [number, number] => {
  const angle = index * 2 * Math.PI / 16;
  const x = 16 * Math.pow(Math.sin(angle), 3);
  const y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
  return [50 + x * 2.6, 46 - y * 2.6];
});
const MAPLE_TOP: [number, number][] = [[50,5],[57,20],[64,16],[62,40],[78,32],[90,34],[85,50],[92,56],[70,70],[53,74]];
const DOT_SHAPES = [
  { name: "une étoile", points: STAR_POINTS, fill: "#FFD23F" },
  { name: "une maison", points: [[20,90],[20,45],[50,15],[80,45],[80,90],[60,90],[60,66],[40,66],[40,90]] as [number, number][], fill: "#FF8FC7" },
  { name: "un poisson", points: [[8,50],[22,36],[42,28],[62,31],[76,44],[93,28],[93,72],[76,56],[62,69],[42,72],[22,64]] as [number, number][], fill: "#3A86FF" },
  { name: "un cœur", points: HEART_POINTS, fill: "#E63946" },
  { name: "une feuille d'érable", points: [...MAPLE_TOP, ...MAPLE_TOP.map(([x, y]) => [100 - x, y] as [number, number]).reverse()], fill: "#E63946", stem: true }
];

export function PointsActivity({ gender, slow }: ActivityProps) {
  const [shapeIndex, setShapeIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [words, setWords] = useState(false);
  const [help, setHelp] = useState(true);
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState("");
  const shape = DOT_SHAPES[shapeIndex];
  const positions = shape.points;
  const center = positions.reduce(([sumX, sumY], [x, y]) => [sumX + x, sumY + y], [0, 0]).map(value => value / positions.length);
  const labelPosition = ([x, y]: [number, number]) => {
    const dx = x - center[0], dy = y - center[1], distance = Math.hypot(dx, dy) || 1;
    const offset = words ? 7 : 5;
    return [x + dx / distance * offset, y + dy / distance * offset + 1.3];
  };
  const reset = (index: number) => {
    setShapeIndex(index);
    setCount(0);
    setMisses(0);
    setFeedback("");
  };
  const connect = (index: number) => {
    if (count >= positions.length) return;
    if (index !== count) {
      const next = count + 1;
      setMisses(misses + 1);
      setFeedback(`Cherche le ${NUMS[next]} (${next})`);
      speak(NUMS[next], slow);
      if (misses + 1 >= 2 && !help) setHelp(true);
      return;
    }

    const nextCount = count + 1;
    setCount(nextCount);
    setMisses(0);
    setFeedback(NUMS[nextCount]);
    speak(NUMS[nextCount], slow);
    if (nextCount === positions.length) {
      window.setTimeout(() => speak(`Bravo ! C'est ${shape.name} !`, slow), 700);
      setFeedback(`Bravo ! C'est ${shape.name} !`);
    }
  };
  const complete = count === positions.length;
  return (
    <>
      <div className="picker" role="group" aria-label="Choisir une image">
        {DOT_SHAPES.map((item, index) =>
          <Button key={item.name} type="button" variant={shapeIndex === index ? "secondary" : "outline"} className="iconbtn" aria-pressed={shapeIndex === index} onClick={() => reset(index)}>Image {index + 1}</Button>
        )}
        <Button type="button" variant={words ? "secondary" : "outline"} className="iconbtn" aria-pressed={words} onClick={() => setWords(!words)}>Nombres en lettres</Button>
        <Button type="button" variant={help ? "secondary" : "outline"} className="iconbtn" aria-pressed={help} onClick={() => setHelp(!help)}>Aide</Button>
      </div>
      <div className="dots-sheet sheet">
        <svg viewBox="-6 -6 112 112" role="img" aria-label={`Relie les points pour découvrir ${shape.name}`}>
          <polygon points={positions.map(point => point.join(",")).join(" ")} fill={shape.fill} opacity={complete ? "0.85" : "0"} />
          {shape.stem && <path d="M50 74 L50 96" stroke="#1D2A3A" strokeWidth="2.4" strokeLinecap="round" opacity={complete ? "1" : "0"} />}
          <polyline points={positions.slice(0, count).concat(complete ? [positions[0]] : []).map(point => point.join(",")).join(" ")}
            fill="none" stroke="var(--teal)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          {positions.map(([x, y], index) => {
            const [labelX, labelY] = labelPosition([x, y]);
            return <g key={`${x}-${y}`}>
              <circle className="hit" cx={x} cy={y} r="5" role="button" tabIndex={complete ? -1 : 0}
                aria-label={`Point ${index + 1}`} aria-disabled={complete} onClick={() => connect(index)}
                onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    connect(index);
                  }
                }} />
              <circle className="dot" cx={x} cy={y} r="1.9" fill={index < count ? "var(--teal)" : "#1D2A3A"} />
              <text className="dlab" x={labelX} y={labelY} textAnchor="middle" fontSize={words ? "3.2" : "4"}>
                {words ? NUMS[index + 1] : index + 1}
              </text>
            </g>;
          })}
          {help && !complete && <circle className="dot-hint" cx={positions[count][0]} cy={positions[count][1]} r="3.6" />}
        </svg>
      </div>
      <Feedback tone={complete ? "ok" : feedback ? feedback.startsWith("Cherche") ? "try" : "ok" : ""}>
        {complete ? `Bravo ! C'est ${shape.name} !` : feedback || `Touche le point ${count + 1}, puis le suivant.`}
      </Feedback>
      {complete && <div className="btns"><Button type="button" variant="outline" className="btn" onClick={() => reset((shapeIndex + 1) % DOT_SHAPES.length)}>Une autre image →</Button></div>}
    </>
  );
}

export function AssocieActivity({ theme, gender, slow }: ActivityProps) {
  const [set, setSet] = useState(() => pick(theme.words, Math.min(5, theme.words.length)));
  const [left, setLeft] = useState(() => shuffle(set));
  const [right, setRight] = useState(() => shuffle(set));
  const [first, setFirst] = useState<number | null>(null);
  const [second, setSecond] = useState<number | null>(null);
  const [paired, setPaired] = useState<VocabularyWord[]>([]);
  const [feedback, setFeedback] = useState("");
  const reset = () => {
    const next = pick(theme.words, Math.min(5, theme.words.length));
    setSet(next);
    setLeft(shuffle(next));
    setRight(shuffle(next));
    setPaired([]);
    setFeedback("");
  };
  useEffect(() => {
    if (first === null || second === null) return;
    if (left[first] === right[second]) {
      setPaired([...paired, left[first]]);
      setFeedback(praise());
      speak(wordText(left[first], gender), slow);
    } else setFeedback("Pas tout à fait. Essaie encore !");
    setFirst(null);
    setSecond(null);
  }, [first, second]);
  return (
    <>
      <div className="match">
        <div className="col">{left.map((word, index) =>
          <Button key={index} type="button" variant="outline" className={`mitem pic${paired.includes(word) ? " paired" : ""}`} aria-pressed={first === index} disabled={paired.includes(word)} onClick={() => setFirst(index)}>
            <WordPicture word={word} gender={gender} />
          </Button>
        )}</div>
        <div className="col">{right.map((word, index) =>
          <Button key={index} type="button" variant="outline" className={`mitem wd${paired.includes(word) ? " paired" : ""}`} aria-pressed={second === index} disabled={paired.includes(word)} onClick={() => {
            setSecond(index);
            speak(wordText(word, gender), slow);
          }}>{wordText(word, gender)}</Button>
        )}</div>
      </div>
      <Feedback tone={paired.length ? "ok" : feedback ? "try" : ""}>{feedback}</Feedback>
      {paired.length === set.length && <div className="bravo show">{praise()} Toutes les paires !<br /><Button type="button" variant="outline" className="btn" onClick={reset}>Encore →</Button></div>}
    </>
  );
}

export function MemoireActivity({ theme, gender, slow }: ActivityProps) {
  const [cards, setCards] = useState(() => {
    const pair = pick(theme.words, Math.min(6, theme.words.length));
    return shuffle(pair.flatMap((word, id) => [{ word, id }, { word, id }]));
  });
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState("");
  const reset = () => {
    const pair = pick(theme.words, Math.min(6, theme.words.length));
    setCards(shuffle(pair.flatMap((word, id) => [{ word, id }, { word, id }])));
    setOpen([]);
    setFound([]);
    setLocked(false);
    setFeedback("");
  };
  useEffect(() => {
    if (open.length !== 2) return;
    if (cards[open[0]].id === cards[open[1]].id) {
      setFound([...found, cards[open[0]].id]);
      setFeedback(praise());
      setOpen([]);
    } else {
      setLocked(true);
      setFeedback("Pas une paire. Essaie encore !");
      const timeout = setTimeout(() => {
        setOpen([]);
        setLocked(false);
      }, 1300);
      return () => clearTimeout(timeout);
    }
  }, [open]);
  return (
    <>
      <div className="mem">{cards.map((card, index) => {
        const isOpen = open.includes(index) || found.includes(card.id);
        return <Button key={index} type="button" variant="outline" className={`mcard${isOpen ? " up" : ""}${found.includes(card.id) ? " found" : ""}`}
          aria-label={`Carte ${index + 1}`} disabled={locked || found.includes(card.id)} onClick={() => {
            setOpen([...open, index]);
            speak(wordText(card.word, gender), slow);
          }}>
          {!isOpen && <span className="mback" aria-hidden="true">?</span>}
          {isOpen && <span className="face"><span className="p"><WordPicture word={card.word} gender={gender} /></span><span className="w">{wordText(card.word, gender)}</span></span>}
        </Button>;
      })}</div>
      <Feedback tone={found.length ? "ok" : feedback ? "try" : ""}>{feedback}</Feedback>
      {found.length === cards.length / 2 && <div className="bravo show">{praise()} Toutes les paires !<br /><Button type="button" variant="outline" className="btn" onClick={reset}>Encore →</Button></div>}
    </>
  );
}
