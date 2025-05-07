import React, { useState } from 'react';

interface GameProps {
  game: {
    id: number;
    name: string;
    description: string;
    difficulty: string;
  };
  index: number;
  onPlay: (id: number) => void;
}

const GameCard: React.FC<GameProps> = ({ game, index, onPlay }) => {
  const [isHovered, setIsHovered] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-500/70',
    medium: 'bg-yellow-500/70',
    hard: 'bg-red-500/70',
  };

  const difficultyColor = difficultyColors[game.difficulty as keyof typeof difficultyColors] || 'bg-blue-500/70';

  return (
    <div
      className="bg-primary-800/40 backdrop-blur-lg rounded-xl p-6 h-full border border-primary-700/40
      transition-all duration-300 hover:border-primary-500/70 hover:shadow-lg hover:shadow-primary-500/20
      relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glassmorphic lighting effect */}
      <div className="absolute -top-32 -right-16 w-40 h-40 bg-primary-500/10 rounded-full filter blur-3xl
        group-hover:bg-primary-400/20 transition-all duration-500"></div>

      <div className="flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white text-shadow">{game.name}</h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${difficultyColor}
            shadow-sm backdrop-blur-sm border border-white/20`}>
            {game.difficulty}
          </span>
        </div>

        <p className="text-gray-300 mb-6 flex-grow">{game.description}</p>

        <button
          onClick={() => onPlay(game.id)}
          className="w-full py-3 px-4 bg-primary-600/80 hover:bg-primary-500/90
          text-white font-medium rounded-lg transition-all duration-300 backdrop-blur-sm
          transform hover:scale-[1.02] active:scale-[0.98] shadow-md
          border border-primary-500/50 hover:border-primary-400/70 hover:shadow-lg"
        >
          Play Now
        </button>
      </div>
    </div>
  );
};

export default GameCard;
