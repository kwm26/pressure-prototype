// Two traits, two alleles each (0 or 1). Expressed trait = sum of alleles (0-2).

export interface Genome {
  fert: [number, number];
  aggr: [number, number];
}

export const fertility = (g: Genome) => g.fert[0] + g.fert[1];
export const aggression = (g: Genome) => g.aggr[0] + g.aggr[1];

const allele = (p: number) => (Math.random() < p ? 1 : 0);

export function randomGenome(pFert: number, pAggr: number): Genome {
  return { fert: [allele(pFert), allele(pFert)], aggr: [allele(pAggr), allele(pAggr)] };
}

export const cloneGenome = (g: Genome): Genome => ({ fert: [...g.fert], aggr: [...g.aggr] });

function inherit(a: [number, number], b: [number, number], mutationRate: number): [number, number] {
  const pick = (pair: [number, number]) => {
    const v = pair[Math.random() < 0.5 ? 0 : 1];
    return Math.random() < mutationRate ? 1 - v : v;
  };
  return [pick(a), pick(b)];
}

export function breed(a: Genome, b: Genome, mutationRate: number): Genome {
  return { fert: inherit(a.fert, b.fert, mutationRate), aggr: inherit(a.aggr, b.aggr, mutationRate) };
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface BreedingResult {
  nextPopulation: Genome[];
  breeders: number;
  offspring: number;
}

// Breeding pass: every escapee survives into next season; fertile escapees pair up
// and produce offspring in proportion to their combined fertility.
export function breedingPass(escapees: Genome[], litterSize: number, mutationRate: number): BreedingResult {
  const breeders = shuffle(escapees.filter((g) => fertility(g) > 0));
  const children: Genome[] = [];
  for (let i = 0; i + 1 < breeders.length; i += 2) {
    const a = breeders[i];
    const b = breeders[i + 1];
    const n = Math.round((litterSize * (fertility(a) + fertility(b))) / 4);
    for (let k = 0; k < n; k++) children.push(breed(a, b, mutationRate));
  }
  return {
    nextPopulation: shuffle([...escapees.map(cloneGenome), ...children]),
    breeders: breeders.length,
    offspring: children.length,
  };
}

export function averages(pop: Genome[]) {
  if (pop.length === 0) return { avgFert: 0, avgAggr: 0 };
  const sum = pop.reduce((s, g) => ({ f: s.f + fertility(g), a: s.a + aggression(g) }), { f: 0, a: 0 });
  return { avgFert: +(sum.f / pop.length).toFixed(2), avgAggr: +(sum.a / pop.length).toFixed(2) };
}
