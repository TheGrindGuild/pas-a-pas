"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import type { ActivityProps } from "./shared";
import { Counter, Feedback, praise, speak, wordText, WordPicture } from "./shared";
import { COLORS, FEM_COL, NUMS } from "./data";
import { Button } from "../ui/button";

export function TraceActivity({ theme, gender, slow }: ActivityProps) {
  const [index, setIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<number[][][]>([]);
  const activeStrokeRef = useRef<number[][] | null>(null);
  const redrawRef = useRef<() => void>(() => {});
  const word = theme.words[index];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = bounds.width * ratio;
      canvas.height = 220 * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, bounds.width, 220);
      const text = wordText(word, gender);
      let fontSize = 120;
      context.font = `700 ${fontSize}px Andika, sans-serif`;
      while (context.measureText(text).width > bounds.width * 0.88 && fontSize > 24) {
        fontSize -= 4;
        context.font = `700 ${fontSize}px Andika, sans-serif`;
      }
      context.textAlign = "center";
      context.fillStyle = "#E3E9F0";
      context.fillText(text, bounds.width / 2, 145);
      context.setLineDash([6, 7]);
      context.lineWidth = 2.5;
      context.strokeStyle = "#7D8FA3";
      context.strokeText(text, bounds.width / 2, 145);
      context.setLineDash([]);
      context.lineWidth = 10;
      context.lineCap = "round";
      context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--teal");
      strokesRef.current.forEach(stroke => {
        context.beginPath();
        stroke.forEach(([x, y], i) => i ? context.lineTo(x, y) : context.moveTo(x, y));
        context.stroke();
      });
    };
    redrawRef.current = draw;
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [word, gender]);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return [event.clientX - bounds.left, event.clientY - bounds.top];
  };
  const go = (step: number) => {
    setIndex((index + step + theme.words.length) % theme.words.length);
    strokesRef.current = [];
    speak(wordText(theme.words[(index + step + theme.words.length) % theme.words.length], gender), slow);
  };
  return (
    <>
      <div className="trace-top"><span className="pic"><WordPicture word={word} gender={gender} /></span>
        <span className="word" style={{ fontSize: "2rem" }}>{wordText(word, gender)}</span>
        <Button type="button" variant="outline" className="btn" onClick={() => speak(wordText(word, gender), slow)}>🔊 Écoute</Button>
      </div>
      <div className="canvas-wrap"><canvas ref={canvasRef} aria-label="Zone pour tracer le mot" style={{ height: 220 }}
        onPointerDown={event => {
          event.currentTarget.setPointerCapture(event.pointerId);
          activeStrokeRef.current = [point(event)];
          strokesRef.current.push(activeStrokeRef.current);
          redrawRef.current();
        }}
        onPointerMove={event => {
          if (!activeStrokeRef.current) return;
          activeStrokeRef.current.push(point(event));
          redrawRef.current();
        }}
        onPointerUp={() => { activeStrokeRef.current = null; }}
        onPointerCancel={() => { activeStrokeRef.current = null; }} />
      </div>
      <div className="btns" style={{ marginTop: 14 }}>
        <Button type="button" variant="outline" className="btn" onClick={() => go(-1)}>← Avant</Button>
        <Button type="button" variant="outline" className="btn" onClick={() => { strokesRef.current = []; redrawRef.current(); }}>Efface</Button>
        <Counter current={index + 1} total={theme.words.length} />
        <Button type="button" className="btn main" onClick={() => go(1)}>Mot suivant →</Button>
      </div>
    </>
  );
}

const COLOR_NAMES = Object.keys(COLORS);

export function ColorieActivity({ gender, slow }: ActivityProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [colors, setColors] = useState<(string | null)[]>(Array(12).fill(null));
  const [feedback, setFeedback] = useState("");
  const cells = Array.from({ length: 12 }, (_, index) => index);
  const colorAt = (index: number) => COLOR_NAMES[(index * 3 + 2) % COLOR_NAMES.length];
  const colorName = (color: string) => gender === "f" ? FEM_COL[color] ?? color : color;
  const reset = () => {
    setColors(Array(12).fill(null));
    setFeedback("");
  };
  const chooseColor = (color: string) => {
    setSelected(color);
    speak(colorName(color), slow);
  };
  return (
    <div className="cbn">
      <div className="sheet">
        <div className="coloring-board">{cells.map(index =>
          <Button key={index} type="button" variant="outline" aria-label={`Région ${index + 1}, numéro ${index % 5 + 1}`}
            onClick={() => {
              const correct = colorAt(index);
              if (!selected) {
                setFeedback("Choisis une couleur d'abord.");
              } else if (selected === correct) {
                const next = colors.slice();
                next[index] = selected;
                setColors(next);
                setFeedback(praise());
                speak(`${NUMS[index % 5 + 1]}, ${colorName(selected)}`, slow);
              } else {
                setFeedback(`Numéro ${NUMS[index % 5 + 1]} : ${colorName(correct)}`);
                speak(`Numéro ${NUMS[index % 5 + 1]} : ${colorName(correct)}`, slow);
              }
            }}
            style={{ backgroundColor: colors[index] ? COLORS[colors[index]!] : "#fff" }}>{index % 5 + 1}</Button>
        )}</div>
      </div>
      <div className="side">
        <div className="legend">{[1, 2, 3, 4, 5].map(number =>
          <div key={number}><span className="n">{number}</span>{NUMS[number]} → <b className="word">{colorName(colorAt(number - 1))}</b></div>
        )}</div>
        <div className="palette">{COLOR_NAMES.map(color =>
          <Button key={color} type="button" variant="outline" className="pal" aria-pressed={selected === color} onClick={() => chooseColor(color)}>
            <span className="swatch" style={{ "--sw": COLORS[color] } as CSSProperties} />
            <span>{colorName(color)}</span>
          </Button>
        )}</div>
        <Feedback tone={feedback ? "try" : ""}>{feedback}</Feedback>
      </div>
      {colors.every(Boolean) && <div className="bravo show">Bravo ! Tu as terminé !<br /><Button type="button" variant="outline" className="btn" onClick={reset}>Un autre dessin →</Button></div>}
    </div>
  );
}
