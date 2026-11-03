export interface VocabularyWord {
  fr: string;
  f?: string;
  e?: string;
  ef?: string;
  color?: string;
  num?: number;
  day?: number;
  s?: string;
}

export interface Theme {
  id: string;
  name: string;
  words: VocabularyWord[];
}

export const NUMS = ["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf","vingt"];
export const COLORS: Record<string, string> = {
  rouge: "#E63946", bleu: "#3A86FF", jaune: "#FFD23F", vert: "#2DC653", orange: "#FB8500",
  violet: "#8338EC", rose: "#FF8FC7", noir: "#22223B", blanc: "#FFFFFF", brun: "#8B5A2B", gris: "#9AA5B1"
};
export const FEM_COL: Record<string, string> = {bleu:"bleue", vert:"verte", violet:"violette", noir:"noire", blanc:"blanche", brun:"brune", gris:"grise"};
const DAYS = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"];

export const THEMES: Theme[] = [
  { id: "salut", name: "Les salutations", words: [
    {fr:"bonjour", e:"🙋"}, {fr:"salut", e:"👋"}, {fr:"au revoir", e:"🚶"}, {fr:"merci", e:"🙏"},
    {fr:"oui", e:"👍"}, {fr:"non", e:"👎"}, {fr:"ça va bien", e:"😀"}, {fr:"ça va mal", e:"😞"},
    {fr:"comme ci, comme ça", e:"😐"}, {fr:"bonne nuit", e:"🌙"} ] },
  { id: "couleurs", name: "Les couleurs", words: Object.keys(COLORS).map(k => ({fr:k, f:FEM_COL[k], color:COLORS[k]})) },
  { id: "nombres", name: "Les nombres", words: NUMS.map((w, i) => (i === 1 ? {fr:w, f:"une", num:i} : {fr:w, num:i})) },
  { id: "classe", name: "La salle de classe", words: [
    {fr:"le crayon", e:"✏️"}, {fr:"le stylo", e:"🖊️"}, {fr:"le livre", e:"📕"}, {fr:"le cahier", e:"📓"},
    {fr:"la règle", e:"📏"}, {fr:"les ciseaux", e:"✂️"}, {fr:"le sac à dos", e:"🎒"}, {fr:"la chaise", e:"🪑"},
    {fr:"l'ordinateur", e:"💻"}, {fr:"l'horloge", e:"🕒"} ] },
  { id: "animaux", name: "Les animaux", words: [
    {fr:"le chat", e:"🐱"}, {fr:"le chien", e:"🐶"}, {fr:"l'oiseau", e:"🐦"}, {fr:"le poisson", e:"🐟"},
    {fr:"le lapin", f:"la lapine", e:"🐰"}, {fr:"le taureau", f:"la vache", e:"🐂", ef:"🐮"}, {fr:"le cheval", f:"la jument", e:"🐴"}, {fr:"le cochon", f:"la truie", e:"🐷"},
    {fr:"l'ours", f:"l'ourse", e:"🐻"}, {fr:"le castor", e:"🦫"}, {fr:"la souris", e:"🐭"}, {fr:"la grenouille", e:"🐸"} ] },
  { id: "famille", name: "La famille", words: [
    {fr:"le père", f:"la mère", e:"👨", ef:"👩"}, {fr:"le frère", f:"la sœur", e:"👦", ef:"👧"},
    {fr:"le grand-père", f:"la grand-mère", e:"👴", ef:"👵"}, {fr:"l'oncle", f:"la tante", e:"🧔", ef:"👩‍🦰"},
    {fr:"le cousin", f:"la cousine", e:"🧒", ef:"👱‍♀️"}, {fr:"le bébé", e:"👶"} ] },
  { id: "nourriture", name: "La nourriture", words: [
    {fr:"la pomme", e:"🍎"}, {fr:"la banane", e:"🍌"}, {fr:"le pain", e:"🍞"}, {fr:"le fromage", e:"🧀"},
    {fr:"le lait", e:"🥛"}, {fr:"la pizza", e:"🍕"}, {fr:"la carotte", e:"🥕"}, {fr:"le gâteau", e:"🎂"},
    {fr:"l'œuf", e:"🥚"}, {fr:"la soupe", e:"🍲"}, {fr:"les fraises", e:"🍓"}, {fr:"le jus", e:"🧃"} ] },
  { id: "vetements", name: "Les vêtements", words: [
    {fr:"le chandail", e:"👕"}, {fr:"le pantalon", e:"👖"}, {fr:"la robe", e:"👗"}, {fr:"la casquette", e:"🧢"},
    {fr:"les bottes", e:"🥾"}, {fr:"le manteau", e:"🧥"}, {fr:"les mitaines", e:"🧤"}, {fr:"le foulard", e:"🧣"},
    {fr:"les bas", e:"🧦"}, {fr:"les souliers", e:"👟"} ] },
  { id: "corps", name: "Le corps", words: [
    {fr:"les yeux", e:"👀"}, {fr:"le nez", e:"👃"}, {fr:"la bouche", e:"👄"}, {fr:"l'oreille", e:"👂"},
    {fr:"la main", e:"✋"}, {fr:"le pied", e:"🦶"}, {fr:"le bras", e:"💪"}, {fr:"la jambe", e:"🦵"}, {fr:"les dents", e:"🦷"} ] },
  { id: "meteo", name: "La météo", words: [
    {fr:"il fait soleil", e:"☀️"}, {fr:"il pleut", e:"🌧️"}, {fr:"il neige", e:"❄️"}, {fr:"il fait du vent", e:"💨"},
    {fr:"il fait chaud", e:"🥵"}, {fr:"il fait froid", e:"🥶"}, {fr:"il y a des nuages", e:"☁️"}, {fr:"il y a un orage", e:"⛈️"} ] },
  { id: "jours", name: "Les jours", words: DAYS.map((d, i) => ({fr:d, day:i})) },
  { id: "besoins", name: "J'ai besoin de…", words: [
    {fr:"les toilettes", s:"d'aller aux toilettes", e:"🚻"}, {fr:"l'eau", s:"d'eau", e:"💧"}, {fr:"l'aide", s:"d'aide", e:"🙋"},
    {fr:"une pause", s:"d'une pause", e:"⏸️"}, {fr:"un crayon", s:"d'un crayon", e:"✏️"}, {fr:"un mouchoir", s:"d'un mouchoir", e:"🤧"},
    {fr:"bouger", s:"de bouger", e:"🏃"}, {fr:"une collation", s:"d'une collation", e:"🥪"} ] },
  { id: "emotions", name: "Les émotions", words: [
    {fr:"content", f:"contente", e:"😀"}, {fr:"triste", e:"😢"}, {fr:"fâché", f:"fâchée", e:"😠"}, {fr:"fatigué", f:"fatiguée", e:"😴"},
    {fr:"calme", e:"😌"}, {fr:"nerveux", f:"nerveuse", e:"😬"}, {fr:"surpris", f:"surprise", e:"😮"}, {fr:"malade", e:"🤒"} ] },
  { id: "consignes", name: "Les consignes", words: [
    {fr:"écoute", e:"👂"}, {fr:"regarde", e:"👀"}, {fr:"assieds-toi", e:"🪑"}, {fr:"lève-toi", e:"🧍"},
    {fr:"lève la main", e:"✋"}, {fr:"range tes affaires", e:"🧺"}, {fr:"aligne-toi", e:"🚶"}, {fr:"chut !", e:"🤫"},
    {fr:"lis", e:"📖"}, {fr:"écris", e:"✍️"} ] },
  { id: "ecole", name: "L'école", words: [
    {fr:"la classe", e:"🏫"}, {fr:"le gymnase", e:"🏀"}, {fr:"la bibliothèque", e:"📚"}, {fr:"le bureau", e:"🗂️"},
    {fr:"la cour", e:"🛝"}, {fr:"l'autobus", e:"🚌"}, {fr:"l'enseignant", f:"l'enseignante", e:"🧑‍🏫"},
    {fr:"l'ami", f:"l'amie", e:"🧑‍🤝‍🧑"}, {fr:"la récréation", e:"⚽"} ] },
  { id: "routine", name: "La routine du matin", words: [
    {fr:"Quelle est la date ?", e:"📅"}, {fr:"Quel temps fait-il ?", e:"🌤️"}, {fr:"Comment ça va ?", e:"🙂"},
    {fr:"présent", f:"présente", e:"🙋"}, {fr:"Je m'appelle…", e:"📛"}, {fr:"Bonne journée !", e:"🌞"} ] },
  { id: "halloween", name: "L'Halloween", words: [
    {fr:"la citrouille", e:"🎃"}, {fr:"le fantôme", e:"👻"}, {fr:"le sorcier", f:"la sorcière", e:"🧙‍♂️", ef:"🧙‍♀️"}, {fr:"la chauve-souris", e:"🦇"},
    {fr:"l'araignée", e:"🕷️"}, {fr:"les bonbons", e:"🍬"}, {fr:"le costume", e:"🎭"}, {fr:"la lune", e:"🌕"}, {fr:"le squelette", e:"💀"} ] },
  { id: "hiver", name: "L'hiver", words: [
    {fr:"la neige", e:"🌨️"}, {fr:"le bonhomme de neige", e:"⛄"}, {fr:"le traîneau", e:"🛷"}, {fr:"les patins", e:"⛸️"},
    {fr:"la glace", e:"🧊"}, {fr:"le chocolat chaud", e:"☕"}, {fr:"le ski", e:"🎿"}, {fr:"le pingouin", e:"🐧"} ] },
  { id: "noel", name: "Noël", words: [
    {fr:"le père Noël", f:"la mère Noël", e:"🎅", ef:"🤶"}, {fr:"le cadeau", e:"🎁"}, {fr:"le sapin", e:"🎄"}, {fr:"l'étoile", e:"⭐"},
    {fr:"la cloche", e:"🔔"}, {fr:"le renne", e:"🦌"}, {fr:"la chandelle", e:"🕯️"}, {fr:"le biscuit", e:"🍪"} ] },
  { id: "canada", name: "Le Canada", words: [
    {fr:"le hockey", e:"🏒"}, {fr:"la feuille d'érable", e:"🍁"}, {fr:"le sirop d'érable", e:"🥞"}, {fr:"le castor", e:"🦫"},
    {fr:"l'orignal", e:"🫎"}, {fr:"le canot", e:"🛶"}, {fr:"la poutine", e:"🍟"}, {fr:"l'ours polaire", e:"🐻‍❄️"}, {fr:"le lac", e:"🏞️"} ] }
];
