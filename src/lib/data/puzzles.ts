export type PuzzleDefinition = {
  id: string;
  name: string;
  pathIds: string[];
};

export const PUZZLE_DEFINITIONS: PuzzleDefinition[] = [
  {
    id: "1",
    name: "Muscular to Mouse (Original Long)",
    pathIds: [
      "muscular_E",
      "musculus_L",
      "mus_L",
      "*mus-_PIE",
      "*mus_PGer",
      "mus_OE",
      "mouse (n.)_E",
    ],
  },
  {
    id: "2",
    name: "Approbate chain",
    pathIds: ["approbate_E", "approbatus_L", "approbare_L"],
  },
  {
    id: "3",
    name: "Manitou (Unami) link",
    pathIds: ["manitou_E", "manet:u_Unami"],
  },
  {
    id: "4",
    name: "Chief to Capital (Adj.)",
    pathIds: ["chief (n.)_E", "chief_OF", "caput_L", "capitalis_L", "capital (adj.)_E"],
  },
  {
    id: "5",
    name: "Approbate to Prove",
    pathIds: ["approbate_E", "approbatus_L", "approbare_L", "probare_L", "prove_E"],
  },
];
