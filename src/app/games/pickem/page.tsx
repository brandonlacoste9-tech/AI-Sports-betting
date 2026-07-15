import type { Metadata } from "next";
import { PickemGame } from "@/components/games/pickem-game";

export const metadata: Metadata = {
  title: "Daily Pick'em",
  description: "Free daily pick'em on BetEdge AI — practice calling winners.",
};

export default function PickemPage() {
  return <PickemGame />;
}
