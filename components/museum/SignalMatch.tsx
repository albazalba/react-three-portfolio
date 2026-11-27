"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const PAIRS = ["React", "Next.js", "Python", "FastAPI", "Agents", "Dubai"];

type Card = { id: string; pair: number; label: string };

function deal(): Card[] {
  const cards = PAIRS.flatMap((label, index) => [
    { id: `${label}-a`, pair: index, label },
    { id: `${label}-b`, pair: index, label },
  ]);
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = cards[index];
    cards[index] = cards[swap];
    cards[swap] = current;
  }
  return cards;
}

export default function SignalMatch() {
  const [cards, setCards] = useState<Card[]>(() => deal());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const won = matched.length === PAIRS.length;

  useEffect(() => {
    return () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, []);

  const status = useMemo(() => {
    if (won) return `Cleared in ${moves} moves.`;
    if (moves === 0) return "Flip two cards. Match the pairs.";
    return `${moves} ${moves === 1 ? "move" : "moves"}`;
  }, [moves, won]);

  function restart() {
    setCards(deal());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
  }

  function flip(index: number) {
    if (lock || won) return;
    if (flipped.includes(index) || matched.includes(cards[index].pair)) return;
    const next = [...flipped, index];
    if (next.length > 2) return;
    setFlipped(next);
    if (next.length < 2) return;
    setMoves((count) => count + 1);
    const [first, second] = next;
    if (cards[first].pair === cards[second].pair) {
      setMatched((current) => [...current, cards[first].pair]);
      setFlipped([]);
      return;
    }
    setLock(true);
    hideTimer.current = window.setTimeout(() => {
      setFlipped([]);
      setLock(false);
    }, 680);
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-accent">Arcade</p>
      <h2 className="mt-3 text-3xl font-light tracking-tight">Signal Match</h2>
      <p className="mt-3 text-sm text-muted">{status}</p>
      <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((card, index) => {
          const open = flipped.includes(index) || matched.includes(card.pair);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(index)}
              disabled={open || lock || won}
              className={`flex h-20 items-center justify-center border text-sm transition-colors ${
                open
                  ? "border-accent/70 bg-accent/10 text-foreground"
                  : "border-border bg-white/[0.03] text-transparent hover:border-accent/40"
              }`}
            >
              {open ? card.label : "·"}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={restart}
        className="mt-6 text-sm text-muted transition-colors hover:text-accent"
      >
        Deal again
      </button>
    </div>
  );
}
