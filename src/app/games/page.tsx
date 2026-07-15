import type { Metadata } from "next";
import { StakeGamesHub } from "@/components/games/stake-games-hub";
import { getStakeGamesForHub } from "@/lib/games/stake-games";

export const metadata: Metadata = {
  title: "Stake Games",
  description:
    "Play Stake Originals via BetEdge — Dice, Crash, Plinko, Mines and more. Affiliate partner links.",
};

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const { games, sportsHref, source } = await getStakeGamesForHub();
  return (
    <StakeGamesHub games={games} sportsHref={sportsHref} source={source} />
  );
}
