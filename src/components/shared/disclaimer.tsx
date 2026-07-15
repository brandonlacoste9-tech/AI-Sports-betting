import { cn } from "@/lib/utils";

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted", className)}>
      For entertainment purposes only. Gambling involves risk. Past performance does not guarantee
      future results. You must be 18+/21+ (depending on jurisdiction) to use sports betting
      services. Bet responsibly.
    </p>
  );
}
