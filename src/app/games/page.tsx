import type { Metadata } from "next";
import { GamesHub } from "@/components/games/games-hub";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Free skill games on BetEdge AI — pick'em, odds IQ, and bankroll run. No real-money wagering on site.",
};

export default function GamesPage() {
  return <GamesHub />;
}
