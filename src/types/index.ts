export interface Fighter {
  id: string;
  slug: string;
  name: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  division: string;
  status: string;
  isActive: boolean;
  championStatus: string;
  recordWins: number;
  recordLosses: number;
  recordDraws: number;
  recordNoContest: number | null;
  recordText: string;
  country: string | null;
  placeOfBirth: string | null;
  trainsAt: string | null;
  fightingStyle: string | null;
  age: number | null;
  heightInches: string | null;
  weightLbs: string | null;
  reachInches: string | null;
  legReachInches: string | null;
  stance: string | null;
  imageUrl: string | null;
  headshotUrl: string | null;
  record: {
    wins: number;
    losses: number;
    draws: number;
    noContest: number | null;
    text: string;
  };
}

export interface FighterStats {
  fighterSlug: string;
  significantStrikesLanded: number;
  significantStrikesAttempted: number;
  strikingAccuracy: number | string;
  takedownsLanded: number;
  takedownsAttempted: number;
  takedownAccuracy: number | string;
  sigStrikesLandedPerMin: number | string;
  sigStrikesAbsorbedPerMin: number | string;
  takedownAvgPer15Min: number | string;
  submissionAvgPer15Min: number | string;
  sigStrikeDefense: number | string;
  takedownDefense: number | string;
  knockdownAvg: number | string;
  averageFightTimeSeconds: number;
  sigStrikesByPosition: {
    standing?: { raw: string; count: number; label: string; percent: number };
    clinch?: { raw: string; count: number; label: string; percent: number };
    ground?: { raw: string; count: number; label: string; percent: number };
  };
  sigStrikesByTarget: {
    head?: { raw: string; count: number; label: string; percent: number };
    body?: { raw: string; count: number; label: string; percent: number };
    leg?: { raw: string; count: number; label: string; percent: number };
  };
  winsByMethod: {
    dec?: { raw: string; count: number; label: string; percent: number };
    sub?: { raw: string; count: number; label: string; percent: number };
    'ko-tko'?: { raw: string; count: number; label: string; percent: number };
  };
}

export interface Fight {
  fighterSlug: string;
  fighterName: string;
  championStatus: string;
  corner: string;
  outcome: string;
  opponent: {
    slug: string;
    name: string;
    championStatus: string;
    corner: string;
  };
  event: {
    id: string;
    slug: string;
    title: string;
    startsAt: string;
    eventDate: string;
    eventDateLabel: string;
    locationText: string;
  };
  bout: {
    id: string;
    dataId: string;
    weightClass: string;
    cardSection: string;
    titleBout: boolean;
    method: string;
    resultRound: number;
    resultTime: string;
    hasStats: boolean;
  };
}

export interface Ranking {
  id: string;
  system: string;
  division: string;
  normalizedDivision: string;
  rank: number | null;
  rankText: string;
  rankChange: number | null;
  isChampion: boolean;
  fighterSlug: string;
  fighterName: string;
  imageUrl: string | null;
  fighter?: {
    slug: string;
    name: string;
    nickname: string | null;
    country: string | null;
    imageUrl: string | null;
    division: string;
    record: {
      wins: number;
      losses: number;
      draws: number;
      noContest: number | null;
      text: string;
    };
    isActive: boolean;
  };
  movement?: {
    direction: string;
    icon: string;
    amount: number;
    label: string;
  };
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  venue: string;
  imageUrl: string;
  fightCount: number;
}
