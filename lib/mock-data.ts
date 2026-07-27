import { MatchCardData } from "@/components/MatchCard";

export const mockMatches: MatchCardData[] = [
  {
    id: "1",
    competition: "Ligue 1 Tchadienne",
    homeTeam: "AS PSI",
    awayTeam: "AS Santé",
    homeScore: 2,
    awayScore: 1,
    status: "live",
    minute: "67'",
  },
  {
    id: "2",
    competition: "Ligue 1 Tchadienne",
    homeTeam: "Club Sportif de la Capitale",
    awayTeam: "Étoile du Chari",
    homeScore: 0,
    awayScore: 0,
    status: "scheduled",
    kickoff: "18h00",
  },
  {
    id: "3",
    competition: "Coupe du Tchad",
    homeTeam: "Renaissance FC",
    awayTeam: "Foullah Édifice",
    homeScore: 3,
    awayScore: 1,
    status: "finished",
  },
];

export const mockStandings = [
  { rank: 1, team: "AS PSI", played: 12, wins: 9, draws: 2, losses: 1, points: 29 },
  { rank: 2, team: "AS Santé", played: 12, wins: 8, draws: 3, losses: 1, points: 27 },
  { rank: 3, team: "Renaissance FC", played: 12, wins: 7, draws: 2, losses: 3, points: 23 },
  {
    rank: 4,
    team: "Club Sportif de la Capitale",
    played: 12,
    wins: 5,
    draws: 4,
    losses: 3,
    points: 19,
  },
  { rank: 5, team: "Étoile du Chari", played: 12, wins: 4, draws: 3, losses: 5, points: 15 },
];

export const mockArticles = [
  {
    id: "1",
    slug: "ouverture-saison-championnat",
    title: "La Ligue 1 tchadienne fait son retour",
    excerpt:
      "Le championnat national reprend avec un format inédit sur six mois et douze clubs, après deux ans d'interruption.",
    author: "Rédaction",
    publishedAt: "2026-07-25",
  },
  {
    id: "2",
    slug: "coupe-du-tchad-quarts",
    title: "Coupe du Tchad : le tableau des quarts de finale dévoilé",
    excerpt:
      "Huit équipes s'affronteront pour une place en demi-finale du tournoi le plus suivi du pays.",
    author: "Rédaction",
    publishedAt: "2026-07-22",
  },
  {
    id: "3",
    slug: "equipe-nationale-preparation",
    title: "Les Sao intensifient leur préparation",
    excerpt:
      "L'équipe nationale enchaîne les entraînements avant les prochaines échéances continentales.",
    author: "Rédaction",
    publishedAt: "2026-07-20",
  },
];