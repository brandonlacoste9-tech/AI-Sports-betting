import type { Metadata } from "next";
import { OddsQuizGame } from "@/components/games/odds-quiz-game";

export const metadata: Metadata = {
  title: "Odds IQ",
  description: "Train favorite vs underdog recognition with American odds.",
};

export default function OddsQuizPage() {
  return <OddsQuizGame />;
}
