/** Free-to-play engagement games (no real-money wagering on BetEdge). */

export type GameId = "pickem" | "odds-quiz" | "bankroll-run";

export type GameMeta = {
  id: GameId;
  href: string;
  title: string;
  blurb: string;
  eta: string;
  badge: string;
};

export const GAMES: GameMeta[] = [
  {
    id: "pickem",
    href: "/games/pickem",
    title: "Daily Pick'em",
    blurb: "Call the winner on today's board. Build a streak. Free play only.",
    eta: "2–5 min",
    badge: "Daily",
  },
  {
    id: "odds-quiz",
    href: "/games/odds-quiz",
    title: "Odds IQ",
    blurb: "Is this line a dog or a chalk? Train your eye on American odds.",
    eta: "3 min",
    badge: "Skill",
  },
  {
    id: "bankroll-run",
    href: "/games/bankroll-run",
    title: "Bankroll Run",
    blurb: "Paper-trade a $1,000 bankroll through 10 simulated bets. Survive.",
    eta: "5 min",
    badge: "Challenge",
  },
];

/** Fallback matchups when DB has no upcoming events. */
export type PickemMatch = {
  id: string;
  sport: string;
  league: string;
  home: string;
  away: string;
  /** Seed for deterministic "result" reveal in free play */
  seed: number;
};

export const FALLBACK_PICKEM: PickemMatch[] = [
  {
    id: "fb-1",
    sport: "NFL",
    league: "NFL",
    home: "Kansas City Chiefs",
    away: "Buffalo Bills",
    seed: 7,
  },
  {
    id: "fb-2",
    sport: "NBA",
    league: "NBA",
    home: "Boston Celtics",
    away: "Dallas Mavericks",
    seed: 3,
  },
  {
    id: "fb-3",
    sport: "MLB",
    league: "MLB",
    home: "New York Yankees",
    away: "Los Angeles Dodgers",
    seed: 11,
  },
  {
    id: "fb-4",
    sport: "NHL",
    league: "NHL",
    home: "Florida Panthers",
    away: "Edmonton Oilers",
    seed: 5,
  },
  {
    id: "fb-5",
    sport: "UFC",
    league: "UFC",
    home: "Fighter A",
    away: "Fighter B",
    seed: 9,
  },
  {
    id: "fb-6",
    sport: "SOCCER",
    league: "EPL",
    home: "Arsenal",
    away: "Liverpool",
    seed: 2,
  },
  {
    id: "fb-7",
    sport: "NFL",
    league: "NFL",
    home: "Philadelphia Eagles",
    away: "San Francisco 49ers",
    seed: 13,
  },
  {
    id: "fb-8",
    sport: "NBA",
    league: "NBA",
    home: "Denver Nuggets",
    away: "Minnesota Timberwolves",
    seed: 4,
  },
];

export type OddsQuizItem = {
  id: string;
  prompt: string;
  /** American odds shown */
  odds: number;
  /** true if favorite (negative or shorter price conceptually) */
  isFavorite: boolean;
  explain: string;
};

export const ODDS_QUIZ: OddsQuizItem[] = [
  {
    id: "q1",
    prompt: "Chiefs moneyline",
    odds: -180,
    isFavorite: true,
    explain: "Negative American odds = favorite. −180 means risk $180 to win $100.",
  },
  {
    id: "q2",
    prompt: "Underdog ML",
    odds: +240,
    isFavorite: false,
    explain: "Positive odds = underdog. +240 pays $240 profit on a $100 risk.",
  },
  {
    id: "q3",
    prompt: "Near pick'em",
    odds: -105,
    isFavorite: true,
    explain: "−105 is a slight favorite (almost even money).",
  },
  {
    id: "q4",
    prompt: "Heavy dog",
    odds: +450,
    isFavorite: false,
    explain: "+450 is a longshot underdog — big payout, low implied win rate.",
  },
  {
    id: "q5",
    prompt: "Chalk side",
    odds: -320,
    isFavorite: true,
    explain: "−320 is strong chalk. You risk a lot relative to the win.",
  },
  {
    id: "q6",
    prompt: "Plus money",
    odds: +115,
    isFavorite: false,
    explain: "Any plus number is the dog (or at least the plus-money side).",
  },
  {
    id: "q7",
    prompt: "Juice favorite",
    odds: -110,
    isFavorite: true,
    explain: "Standard −110 is the favorite side of a pick'em / key number line.",
  },
  {
    id: "q8",
    prompt: "Live dog",
    odds: +175,
    isFavorite: false,
    explain: "+175 underdog — market thinks the other side wins more often.",
  },
];

export type BankrollBet = {
  id: string;
  label: string;
  odds: number;
  /** win probability used by the sim (not true edge) */
  winProb: number;
};

export const BANKROLL_BETS: BankrollBet[] = [
  { id: "b1", label: "NFL ML favorite −150", odds: -150, winProb: 0.58 },
  { id: "b2", label: "NBA spread −110", odds: -110, winProb: 0.5 },
  { id: "b3", label: "UFC dog +180", odds: 180, winProb: 0.34 },
  { id: "b4", label: "Soccer draw +240", odds: 240, winProb: 0.28 },
  { id: "b5", label: "NHL puckline +145", odds: 145, winProb: 0.4 },
  { id: "b6", label: "MLB total Over −105", odds: -105, winProb: 0.49 },
  { id: "b7", label: "Parlay leg +100", odds: 100, winProb: 0.48 },
  { id: "b8", label: "Heavy chalk −280", odds: -280, winProb: 0.7 },
  { id: "b9", label: "Live dog +260", odds: 260, winProb: 0.26 },
  { id: "b10", label: "Prop +130", odds: 130, winProb: 0.42 },
];
