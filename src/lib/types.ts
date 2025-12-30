export type Node = {
  id: string;
  word: string;
  lang: string;
  definition: string;
  pos?: string;
  neighbors?: Neighbor[]; // Optional on client
};
export type Neighbor = {
  id: string;
  relation: string;
  direction: "forward" | "reverse";
};

export type SearchIndexItem = {
  id: string;
  label: string;
  lang: string;
  definition: string;
  searchText: string;
};

export type Puzzle = {
  puzzleId: string;
  pathIds: string[];
  startNode: Node;
  targetNode: Node;
  scaffold: Array<{
    index: number;
    lang?: string;
    hint: {
      lang?: string;
      definition?: string;
      pos?: string;
    };
  }>;
  totalPathLength: number;
};
