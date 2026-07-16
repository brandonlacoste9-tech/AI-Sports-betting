import type { Metadata } from "next";
import { StakeGamesHub } from "@/components/games/stake-games-hub";
import { getStakeGamesForHub } from "@/lib/games/stake-games";

export const metadata: Metadata = {
  title: "Slots & Casino — Stake",
  description:
    "Play Stake slots and casino games via BetEdge — Diamonds, Bars, Cases, Plinko, Blackjack and more. Affiliate partner.",
};

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const data = await getStakeGamesForHub();
  return (
    <StakeGamesHub
      slots={data.slots}
      table={data.table}
      instant={data.instant}
      sportsHref={data.sportsHref}
      slotsHref={data.slotsHref}
      casinoHref={data.casinoHref}
      source={data.source}
    />
  );
}
