import React, { useState, useEffect } from 'react';

// Card symbols
const symbols = ['🚀', '🌟', '🎮', '🎨', '🎵', '🏆', '🌈', '💻'];

interface Card {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

interface MemoryMatchProps {
  onClose: () => void;
}

const MemoryMatch: React.FC<MemoryMatchProps> = ({ onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);

  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Create pairs of cards with symbols
    const cardPairs = [...symbols, ...symbols]
      .map((symbol, index) => ({
        id: index,
        symbol,
        flipped: false,
        matched: false,
      }))
      .sort(() => Math.random() - 0.5); // Shuffle the cards

    setCards(cardPairs);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameCompleted(false);
  };

  const handleCardClick = (id: number) => {
    // Prevent clicking if two cards are already flipped or the card is already matched
    if (flippedCards.length === 2 ||
        cards.find(card => card.id === id)?.matched ||
        flippedCards.includes(id)) {
      return;
    }

    // Flip the card
    const newCards = cards.map(card =>
      card.id === id ? { ...card, flipped: true } : card
    );
    setCards(newCards);

    // Add card to flipped cards
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = newCards.find(card => card.id === firstId);
      const secondCard = newCards.find(card => card.id === secondId);

      if (firstCard?.symbol === secondCard?.symbol) {
        // Match found
        setTimeout(() => {
          const matchedCards = newCards.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, matched: true }
              : card
          );
          setCards(matchedCards);
          setFlippedCards([]);
          setMatches(prev => prev + 1);

          // Check if all matches found
          if (matches + 1 === symbols.length) {
            setGameCompleted(true);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetFlippedCards = newCards.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, flipped: false }
              : card
          );
          setCards(resetFlippedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    initializeGame();
  };

  return (
    <div className="bg-primary-900/60 backdrop-blur-xl rounded-xl p-8 w-full max-w-2xl mx-auto shadow-xl border border-primary-700/30 relative overflow-hidden">
      {/* Glassmorphic lighting effects */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-500/20 rounded-full filter blur-3xl"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-2xl font-bold text-white text-shadow">Memory Match</h2>
        <div className="flex space-x-6">
          <div className="text-white backdrop-blur-sm bg-primary-800/40 px-3 py-1 rounded-lg border border-primary-700/50">
            <span className="font-medium">Moves:</span> {moves}
          </div>
          <div className="text-white backdrop-blur-sm bg-primary-800/40 px-3 py-1 rounded-lg border border-primary-700/50">
            <span className="font-medium">Matches:</span> {matches}/{symbols.length}
          </div>
        </div>
      </div>

      {gameCompleted ? (
        <div className="text-center py-10 relative z-10">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-primary-400 bg-clip-text text-transparent mb-4">
            🎉 Congratulations! 🎉
          </h3>
          <p className="text-white text-lg mb-8">
            You completed the game in {moves} moves!
          </p>
          <div className="flex space-x-6 justify-center">
            <button
              onClick={resetGame}
              className="py-3 px-8 bg-primary-600/80 hover:bg-primary-500/90 text-white font-medium rounded-lg
              backdrop-blur-sm shadow-lg border border-primary-500/50 transition-all duration-300 hover:scale-105"
            >
              Play Again
            </button>
            <button
              onClick={onClose}
              className="py-3 px-8 bg-gray-700/50 hover:bg-gray-600/70 text-white font-medium rounded-lg
              backdrop-blur-sm border border-gray-600/50 transition-all duration-300 hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8 relative z-10">
            {cards.map(card => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl rounded-lg cursor-pointer
                transition-all duration-300 transform shadow-lg border ${
                  card.flipped || card.matched
                    ? 'bg-primary-600/70 backdrop-blur-md rotate-0 scale-100 border-primary-400/50'
                    : 'bg-primary-700/40 backdrop-blur-sm rotate-0 scale-100 hover:bg-primary-600/60 border-primary-700/30'
                } ${card.matched ? 'bg-green-600/40 border-green-400/50' : ''}`}
              >
                {(card.flipped || card.matched) && (
                  <span className="text-white text-shadow-sm">{card.symbol}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-6 relative z-10">
            <button
              onClick={resetGame}
              className="py-3 px-8 bg-primary-600/70 hover:bg-primary-500/80 text-white font-medium rounded-lg
              backdrop-blur-sm shadow-lg border border-primary-500/50 transition-all duration-300 hover:scale-105"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="py-3 px-8 bg-gray-700/50 hover:bg-gray-600/70 text-white font-medium rounded-lg
              backdrop-blur-sm border border-gray-600/50 transition-all duration-300 hover:scale-105"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MemoryMatch;
