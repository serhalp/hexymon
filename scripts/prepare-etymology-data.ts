import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type ChainLink = { source: string; target: string };
type WordEntry = { word: string; word_root?: string; etymology_chain: ChainLink[] };
type InputFile = { words: WordEntry[] };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.resolve(__dirname, "../data/etymologies.json");
const OUTPUT_DIR = path.resolve(__dirname, "../src/lib/data");
const FALLBACK_DEFINITION = "Definition not provided (EtymoLink dataset).";

const LANGUAGE_NAMES: Record<string, string> = {
  PIE: "Proto-Indo-European",
  F: "French",
  ONF: "Old North French",
  AF: "Anglo-French",
  MF: "Middle French",
  OF: "Old French",
  ASpan: "American Spanish",
  L: "Latin",
  MediL: "Medieval Latin",
  ModL: "Modern Latin",
  LateL: "Late Latin",
  VL: "Vulgar Latin",
  OE: "Old English",
  PGer: "Proto-Germanic",
  H: "Hebrew",
  Avest: "Avestan",
  IndoIr: "Indo-Iranian",
  San: "Sanskrit",
  G: "Greek",
  GE: "Greenland Eskimo",
  I: "Italian",
  A: "Arabic",
  Sy: "Syriac",
  Per: "Persian",
  Ira: "Iranian",
  Por: "Portuguese",
  OHGer: "Old High German",
  Adut: "Afrikaans Dutch",
  Ger: "German",
  AL: "Anglo-Latin",
  Cel: "Celtic",
  Tur: "Turkish",
  ModG: "Modern Greek",
  ChuL: "Church Latin",
  EG: "Ecclesiastical Greek",
  OL: "Old Latin",
  PI: "Proto-Italic",
  Nor: "Norse",
  ONor: "Old Norse",
  Dan: "Danish",
  FCan: "French-Canadian",
  Fran: "Frankish",
  Gae: "Gaelic",
  Scot: "Scottish",
  Hin: "Hindi",
  Yid: "Yiddish",
  Rus: "Russian",
  ORus: "Old Russian",
  OPro: "Old Provençal",
  LGer: "Low German",
  WGer: "West Germanic",
  Ir: "Irish",
  Nah: "Nahuatl (Aztecan)",
  Mal: "Malay",
  Ch: "Chinese",
  Scan: "Scandinavian",
  Wel: "Welsh",
  Sem: "Semitic",
  Norw: "Norwegian",
  Swe: "Swedish",
  Sla: "Slavonic",
  Jap: "Japanese",
  Ber: "Berrichon",
  Afr: "African",
  SerCro: "Serbo-Croatian",
  Aram: "Aramaic",
  Gas: "Gascon",
  Egy: "Egyptian",
  Tup: "Tupi",
  Jav: "Javanese",
  Ben: "Bengali",
  Fin: "Finnish",
  Kut: "Kutchin",
  Guugu: "Yimidhirr",
  Sio: "Siouan",
  Nepa: "Nepalese",
  Dra: "Dravidian",
  Pol: "Polish",
  OFri: "Old Frisian",
  Canto: "Cantonese",
  Esto: "Estonian",
  Lith: "Lithuanian",
  GaRo: "Gallo-Roman",
  CuSpan: "Cuban Spanish",
  Araw: "Arawakan",
  Maori: "Maori",
  NEAl: "Southern New England Algonquian",
  Nar: "Narragansett",
  Flem: "Flemish",
  Aztec: "Aztec",
  ByG: "Byzantine Greek",
  Que: "Quechua",
  Afrika: "Afrikaans",
  Ojib: "Ojibwa",
  Algo: "Algonquian",
  preL: "Pre-Latin",
  Serb: "Serbian",
  Aben: "Abenaki",
  Hun: "Hungarian",
  Lush: "Lushootseed",
  Dako: "Dakota",
  Cro: "Croatian",
  EL: "Extinct Language",
  E: "English",
};

type Node = {
  id: string;
  word: string;
  lang: string;
  definition: string;
  pos?: string;
  neighbors?: Neighbor[];
};

type Neighbor = {
  id: string;
  relation: string;
  direction: "forward" | "reverse";
};

type Edge = { source: string; target: string; relation: string };

function splitForms(raw: string): string[] {
  return raw
    .split("/")
    .map((p) => p.replace(/^\/|\/$/g, "").trim())
    .filter(Boolean);
}

function canonicalizeId(raw: string): string {
  const forms = splitForms(raw);
  if (forms.length === 0) return raw.trim();

  // Sometimes language code is separated as its own form (e.g., "/manet:u/_Unami").
  const last = forms[forms.length - 1];
  if (forms.length >= 2 && last.startsWith("_") && !forms[0].includes("_")) {
    const langCode = last.replace(/^_/, "");
    return `${forms[0]}_${langCode}`;
  }

  return forms[0];
}

function extractLangCode(id: string): string {
  const match = id.match(/_([^_]+)$/);
  return match ? match[1] : "UNK";
}

function stripLangCode(id: string): string {
  const match = id.match(/^(.+)_([^_]+)$/);
  return match ? match[1] : id;
}

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

if (!fs.existsSync(INPUT_PATH)) {
  console.error(`Missing input file at ${INPUT_PATH}. Please place etymologies.json there first.`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(INPUT_PATH, "utf8")) as InputFile;
const nodes: Record<string, Node> = {};
const edges: Edge[] = [];
const edgeSet = new Set<string>();

function ensureNode(id: string, wordRoot?: string) {
  if (nodes[id]) return;

  const langCode = extractLangCode(id);
  const langName = LANGUAGE_NAMES[langCode] || langCode;
  const base = wordRoot || stripLangCode(id);

  nodes[id] = {
    id,
    word: base,
    lang: langName,
    definition: FALLBACK_DEFINITION,
  };
}

raw.words.forEach((entry) => {
  const canonicalWordId = canonicalizeId(entry.word);
  ensureNode(canonicalWordId, entry.word_root);

  entry.etymology_chain.forEach((link) => {
    const sourceId = canonicalizeId(link.source);
    const targetId = canonicalizeId(link.target);

    ensureNode(sourceId);
    ensureNode(targetId);

    const key = `${sourceId}->${targetId}`;
    if (!edgeSet.has(key)) {
      edges.push({ source: sourceId, target: targetId, relation: "derived_from" });
      edgeSet.add(key);
    }
  });
});

const graphData: Record<string, Node> = {};

Object.values(nodes).forEach((node) => {
  graphData[node.id] = {
    ...node,
    neighbors: [],
  };
});

edges.forEach((edge) => {
  const sourceNode = graphData[edge.source];
  const targetNode = graphData[edge.target];
  if (!sourceNode || !targetNode) return;

  sourceNode.neighbors?.push({
    id: edge.target,
    relation: edge.relation,
    direction: "forward",
  });
  targetNode.neighbors?.push({
    id: edge.source,
    relation: edge.relation,
    direction: "reverse",
  });
});

const searchIndex = Object.values(graphData).map((node) => ({
  id: node.id,
  label: node.word,
  lang: node.lang,
  definition: node.definition,
  searchText: normalizeText(`${node.word} ${node.lang}`),
}));

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

fs.writeFileSync(path.join(OUTPUT_DIR, "graph.json"), JSON.stringify(graphData, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, "search_index.json"), JSON.stringify(searchIndex, null, 2));

console.log(
  `Generated ${Object.keys(graphData).length} nodes and ${edges.length} edges from EtymoLink.`,
);
console.log("Files written to src/lib/data/");
