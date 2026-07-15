import type { Metadata } from "next";
import { BankrollRunGame } from "@/components/games/bankroll-run-game";

export const metadata: Metadata = {
  title: "Bankroll Run",
  description: "Paper bankroll challenge — free play only on BetEdge AI.",
};

export default function BankrollRunPage() {
  return <BankrollRunGame />;
}
