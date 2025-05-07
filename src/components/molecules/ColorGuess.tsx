import React, { useState, useEffect } from 'react';

interface ColorGuessProps {
  onClose: () => void;
}

const ColorGuess: React.FC<ColorGuessProps> = ({ onClose }) => {
  const [targetColor, setTargetColor] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [message, setMessage] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const totalRounds = 10;

  // Generate a random RGB color
  const generateRandomColor = (): string => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Generate similar colors for options
  const generateSimilarColors = (color: string): string[] => {
    const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (!match) return [];

    const [_, rStr, gStr, bStr] = match;
    const r = parseInt(rStr);
    const g = parseInt(gStr);
    const b = parseInt(bStr);

    const colors = [color];

    // Generate 3 similar colors
    for (let i = 0; i < 3; i++) {
      const rOffset = Math.floor(Math.random() * 60) - 30;
      const gOffset = Math.floor(Math.random() * 60) - 30;
      const bOffset = Math.floor(Math.random() * 60) - 30;

      const newR = Math.min(255, Math.max(0, r + rOffset));
      const newG = Math.min(255, Math.max(0, g + gOffset));
      const newB = Math.min(255, Math.max(0, b + bOffset));

      colors.push(`rgb(${newR}, ${newG}, ${newB})`);
    }

    return colors.sort(() => Math.random() - 0.5);
  };

  // Start a new round
  const startNewRound = () => {
    const newColor = generateRandomColor();
    const newOptions = generateSimilarColors(newColor);
    setTargetColor(newColor);
    setOptions(newOptions);
    setMessage('');
    setIsCorrect(null);
  };

  // Initialize game
  useEffect(() => {
    startNewRound();
  }, []);

  // Handle color selection
  const handleColorSelect = (selectedColor: string) => {
    if (isCorrect !== null) return; // Prevent multiple selections in same round

    const correct = selectedColor === targetColor;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      setMessage('Correct! 🎉');
    } else {
      setMessage('Wrong! The correct color was:');
    }

    // Move to next round after delay
    setTimeout(() => {
      if (round < totalRounds) {
        setRound(prev => prev + 1);
        startNewRound();
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  // Reset game
  const resetGame = () => {
    setScore(0);
    setRound(1);
    setGameOver(false);
    startNewRound();
  };

  return (
    <div className="bg-primary-900/60 backdrop-blur-xl rounded-xl p-8 w-full max-w-2xl mx-auto shadow-xl border border-primary-700/30 relative overflow-hidden">
      {/* Glassmorphic lighting effects */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/20 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full filter blur-3xl"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-2xl font-bold text-white text-shadow">Color Guess</h2>
        <div className="flex space-x-6">
          <div className="text-white backdrop-blur-sm bg-primary-800/40 px-3 py-1 rounded-lg border border-primary-700/50">
            <span className="font-medium">Score:</span> {score}
          </div>
          <div className="text-white backdrop-blur-sm bg-primary-800/40 px-3 py-1 rounded-lg border border-primary-700/50">
            <span className="font-medium">Round:</span> {round}/{totalRounds}
          </div>
        </div>
      </div>

      {gameOver ? (
        <div className="text-center py-10 relative z-10">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-primary-400 bg-clip-text text-transparent mb-4">
            Game Over!
          </h3>
          <p className="text-white text-lg mb-8">
            Your final score: {score} out of {totalRounds}
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
          <div className="mb-8 relative z-10">
            <div className="text-center">
              <p className="text-lg text-white mb-4">Which color matches this RGB value?</p>
              <div className="bg-primary-800/70 backdrop-blur-sm p-4 rounded-lg inline-block mb-6 border border-primary-700/50 shadow-lg">
                <p className="font-mono text-xl text-white">{targetColor}</p>
              </div>
            </div>

            {message && (
              <div className={`text-center mb-6 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                <p className="text-lg">{message}</p>
                {!isCorrect && (
                  <div
                    className="w-16 h-16 mx-auto mt-3 rounded-lg border-2 border-white shadow-lg"
                    style={{ backgroundColor: targetColor }}
                  />
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-5">
              {options.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorSelect(color)}
                  disabled={isCorrect !== null}
                  className={`
                    h-28 rounded-lg transition-all duration-300 shadow-lg backdrop-blur-sm
                    ${isCorrect !== null && color === targetColor
                      ? 'border-2 border-green-400 ring-4 ring-green-400/30'
                      : 'border border-white/30 hover:border-white/80'}
                    ${isCorrect !== null ? 'cursor-default' : 'cursor-pointer hover:scale-[1.03] hover:shadow-xl'}
                  `}
                  style={{ backgroundColor: color }}
                  aria-label={`Color option ${index + 1}`}
                />
              ))}
            </div>
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

export default ColorGuess;
