"use client";

import type { Theme } from "./activities/data";
import {
  ACTIVITY_NAMES,
  ActivityFrame,
  type Gender
} from "./activities/shared";
import {
  AssocieActivity,
  MemoireActivity,
  PointsActivity,
  TrieActivity
} from "./activities/SortingActivities";
import { ColorieActivity, TraceActivity } from "./activities/CreativeActivities";
import {
  EnregistreActivity,
  JacquesActivity,
  LettreActivity,
  ManqueActivity,
  PhraseActivity
} from "./activities/CommunicationActivities";
import { EcouteActivity, LisActivity, TrouveActivity } from "./activities/PracticeActivities";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const ACTIVITY_CARDS = [
  { id: "ecoute", description: "Écoute le mot. Dis-le trois fois.", uses: "thème", icon: "🔊", color: "var(--teal-soft)", ink: "var(--teal)" },
  { id: "lis", description: "Lis le mot à voix haute, puis vérifie.", uses: "thème", icon: "📖", color: "#FFF1C9", ink: "#9A6B00" },
  { id: "trouve", description: "Écoute. Touche la bonne image.", uses: "thème", icon: "🔎", color: "#E4EDFF", ink: "#2B5FD9" },
  { id: "trace", description: "Suis les lettres avec ton doigt ou la souris.", uses: "thème", icon: "✍️", color: "#F3E6FF", ink: "#6A2BC2" },
  { id: "colorie", description: "Lis le numéro, trouve la couleur.", uses: "couleurs + nombres", icon: "🎨", color: "#FFE5E8", ink: "#B3122A" },
  { id: "trie", description: "Mets chaque mot dans la bonne boîte.", uses: "thème", icon: "🗂️", color: "#E2F5EA", ink: "#1E7A4C" },
  { id: "points", description: "Compte en français et découvre l'image.", uses: "nombres", icon: "🔵", color: "#FFEEDD", ink: "#B85A00" },
  { id: "associe", description: "Relie chaque image à son mot.", uses: "thème", icon: "🔗", color: "#E0F4F7", ink: "#0F6F80" },
  { id: "memoire", description: "Retourne les cartes. Trouve les paires.", uses: "thème", icon: "🃏", color: "#F3E6FF", ink: "#7A4CC2" },
  { id: "phrase", description: "Choisis une image pour finir la phrase.", uses: "thème", icon: "💬", color: "#FFF1C9", ink: "#C2410C" },
  { id: "jacques", description: "Bouge seulement si Jacques le dit !", uses: "mouvement", icon: "🏃", color: "#E0F4F7", ink: "#0F7C7A" },
  { id: "manque", description: "Regarde les images. Laquelle est partie ?", uses: "thème", icon: "❔", color: "#E4EDFF", ink: "#2B5FD9" },
  { id: "lettre", description: "Trouve la lettre qui manque dans le mot.", uses: "thème", icon: "🔤", color: "#FFE5E8", ink: "#B3122A" },
  { id: "enregistre", description: "Dis le mot au micro. Écoute ta voix.", uses: "thème · micro", icon: "🎙️", color: "#E2F5EA", ink: "#1E7A4C" }
];

const VIDEO_LIST = [
  { title: "Français en mouvement", description: "Écoute, copie les gestes, répète.", icon: "🕺" },
  { title: "Promenades actives", description: "Une promenade virtuelle en français.", icon: "🚶" },
  { title: "Jeux actifs", description: "Quatre coins, statues, Jacques a dit.", icon: "🎲" },
  { title: "Jeux du Canada", description: "Provinces, capitales et monuments.", icon: "🍁" }
];

type Props = {
  activityId: string;
  theme: Theme;
  gender: Gender;
  slow: boolean;
  onGenderChange: (gender: Gender) => void;
};

function Home({ theme }: { theme: Theme }) {
  return (
    <>
      <div className="hello">
        <h1>Choisis une activité</h1>
        <p>Thème choisi : <span className="now">{theme.name}</span>. Change le thème en haut, quand tu veux.</p>
      </div>
      <div className="tiles">{ACTIVITY_CARDS.map(activity =>
        <a className="activity-link" href={`#${activity.id}`} key={activity.id}>
          <Card className="tile">
            <span className="ic" style={{ background: activity.color, color: activity.ink }}><span aria-hidden="true">{activity.icon}</span></span>
            <span><h3>{ACTIVITY_NAMES[activity.id]}</h3><p>{activity.description}</p><span className="uses">{activity.uses}</span></span>
          </Card>
        </a>
      )}</div>
      <section className="videos" id="videos-sec" aria-labelledby="vid-h">
        <div className="vid-top"><span className="vid-badge" aria-hidden="true">▶</span>
          <div><h2 id="vid-h">Mes vidéos</h2><p>Bouge, danse et parle en français ! Des vidéos à faire en classe, debout et en mouvement.</p></div>
        </div>
        <div className="vid-lists">{VIDEO_LIST.map(video =>
          <a className="vid-card" href="https://www.youtube.com/@Mp-churchvillep799/playlists" target="_blank" rel="noopener" key={video.title}>
            <span className="emoji" aria-hidden="true">{video.icon}</span><span><b>{video.title}</b><small>{video.description}</small></span>
          </a>
        )}</div>
        <Button asChild variant="default" className="btn vid-btn">
          <a href="https://www.youtube.com/@Mp-churchvillep799" target="_blank" rel="noopener">▶ Voir la chaîne YouTube</a>
        </Button>
      </section>
      <details className="teacher"><summary>For teachers and families</summary><div className="cols">
        <div><h4>Who it&apos;s for</h4><p>Beginner Grade 4–5 Core French learners who need extra repetition, picture support, audio, and low-pressure practice. There are no timers, scores or lives. Wrong answers get a gentle hint and another try.</p></div>
        <div><h4>Audio</h4><p>French audio clips are bundled with the app and work without a speech service or a voice installed on the device. <b>Réglages → Voix lente</b> slows them down.</p></div>
        <div><h4>Supports</h4><ul><li>Andika, a typeface designed for new readers</li><li>Texte plus grand for bigger type</li><li>Mode calme turns off motion</li><li>Everything works by tapping, so no drag-and-drop is needed</li><li><b>Enregistre-toi</b> needs microphone permission. Recordings stay in the browser and are deleted when the student leaves the activity.</li></ul></div>
      </div></details>
    </>
  );
}

export default function ActivityView({ activityId, theme, gender, slow, onGenderChange }: Props) {
  if (!activityId || activityId === "videos" || !ACTIVITY_NAMES[activityId]) {
    return <div className="wrap activity-main" id="view"><Home theme={theme} /></div>;
  }

  const props = { theme, gender, slow };
  let activity;
  switch (activityId) {
    case "ecoute": activity = <EcouteActivity {...props} />; break;
    case "lis": activity = <LisActivity {...props} />; break;
    case "trouve": activity = <TrouveActivity {...props} />; break;
    case "trace": activity = <TraceActivity {...props} />; break;
    case "colorie": activity = <ColorieActivity {...props} />; break;
    case "trie": activity = <TrieActivity key={theme.id} {...props} />; break;
    case "points": activity = <PointsActivity {...props} />; break;
    case "associe": activity = <AssocieActivity key={theme.id} {...props} />; break;
    case "memoire": activity = <MemoireActivity key={theme.id} {...props} />; break;
    case "phrase": activity = <PhraseActivity {...props} />; break;
    case "jacques": activity = <JacquesActivity {...props} />; break;
    case "manque": activity = <ManqueActivity key={theme.id} {...props} />; break;
    case "lettre": activity = <LettreActivity key={`${theme.id}-${gender}`} {...props} />; break;
    case "enregistre": activity = <EnregistreActivity key={theme.id} {...props} />; break;
    default: activity = <Home theme={theme} />;
  }

  return <div className="wrap activity-main" id="view">
    <ActivityFrame key={`${activityId}-${theme.id}-${gender}`} id={activityId} theme={theme} gender={gender} onGenderChange={onGenderChange}>{activity}</ActivityFrame>
  </div>;
}
