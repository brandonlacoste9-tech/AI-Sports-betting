import type { Metadata } from "next";
import { StakeGamesHub } from "@/components/games/stake-games-hub";
import {
  stakeCasinoUrl,
  stakeSlotsUrl,
  stakeSportsUrl,
} from "@/lib/affiliates";

export const metadata: Metadata = {
  title: "Slots & Casino — Stake",
  description:
    "Slots and casino on Stake via BetEdge — full slots lobby, casino home, and sportsbook. Affiliate partner.",
};

export default function GamesPage() {
  return (
    <StakeGamesHub
      sportsHref={stakeSportsUrl()}
      slotsHref={stakeSlotsUrl()}
      casinoHref={stakeCasinoUrl()}
    />
  );
}
