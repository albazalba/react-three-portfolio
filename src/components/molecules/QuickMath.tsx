import React, { useState, useEffect, useRef } from 'react';

interface QuickMathProps {
  onClose: () => void;
}

type Operation = '+' | '-' | '*' | '/';

interface Problem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  options: number[];
}

const QuickMath: React.FC<QuickMathProps> = ({ onClose }) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const totalRounds = 10;
  const timerRef = useRef<number | null>(null);

  // Generate a new math problem
  const generateProblem = (): Problem => {
    const operations: Operation[] = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * 3)] as Operation; // Exclude division for simplicity

    let num1: number, num2: number, answer: number;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25; // Ensure positive result
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1; // Keep multiplication simple
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      case '/':
        // Generate division problems with whole number answers
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 0;
        num2 = 0;
        answer = 0;
    }

    // Generate answer options including the correct one
    const options = [answer];

    while (options.length < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const option = answer + offset;

      if (option !== answer && !options.includes(option) && option >= 0) {
        options.push(option);
      }
    }

    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    return {
      num1,
      num2,
      operation,
      answer,
      options: shuffledOptions
    };
  };

  // Start a new round
  const startNewRound = () => {
    // Clear previous timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimeLeft(10);
    setProblem(generateProblem());
    setIsCorrect(null);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up for this round
          if (timerRef.current) clearInterval(timerRef.current);
          handleNextRound(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle answer selection
  const handleAnswerSelect = (selectedAnswer: number) => {
    if (isCorrect !== null || !problem) return;

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const correct = selectedAnswer === problem.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }

    // Move to next round after delay
    setTimeout(() => {
      handleNextRound(true);
    }, 1500);
  };

  const handleNextRound = (fromSelection: boolean) => {
    if (round < totalRounds) {
      setRound(prev => prev + 1);
      startNewRound();
    } else {
      setGameOver(true);
    }
  };

  // Reset game
  const resetGame = () => {
    setScore(0);
    setRound(1);
    setGameOver(false);
    startNewRound();
  };

  // Initialize game
  useEffect(() => {
    startNewRound();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getOperationSymbol = (op: Operation): string => {
    switch (op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      default: return op;
    }
  };

  return (
    <div className="bg-primary-900/60 backdrop-blur-xl rounded-xl p-8 w-full max-w-2xl mx-auto shadow-xl border border-primary-700/30 relative overflow-hidden">
      {/* Glassmorphic lighting effects */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full filter blur-3xl"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-2xl font-bold text-white text-shadow">Quick Math</h2>
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
          <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-4">
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
          {problem && (
            <div className="mb-8 relative z-10">
              <div className="flex justify-center items-center mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white bg-primary-800/50 backdrop-blur-sm
                  border border-primary-700/50 shadow-lg"
                  style={{
                    background: `conic-gradient(#6366f1 ${timeLeft * 36}deg, rgba(30, 41, 59, 0.4) 0deg)`,
                    transition: 'all 1s linear'
                  }}
                >
                  {timeLeft}
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center bg-primary-800/70 backdrop-blur-sm p-6 rounded-lg border border-primary-700/50 shadow-lg">
                  <span className="text-3xl font-bold text-white text-shadow-sm">
                    {problem.num1} {getOperationSymbol(problem.operation)} {problem.num2} = ?
                  </span>
                </div>

                {isCorrect !== null && (
                  <div className={`mt-4 text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect
                      ? 'Correct! 🎉'
                      : `Wrong! Correct answer: ${problem.answer}`}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                {problem.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isCorrect !== null}
                    className={`
                      py-5 rounded-lg text-xl font-bold transition-all duration-300 backdrop-blur-sm shadow-lg border
                      ${isCorrect !== null && option === problem.answer
                        ? 'bg-green-600/70 text-white border-green-400'
                        : isCorrect === false && option !== problem.answer
                          ? 'bg-primary-800/40 text-gray-400 border-primary-700/30'
                          : 'bg-primary-700/50 text-white hover:bg-primary-600/60 border-primary-600/30 hover:border-primary-500/50'
                      }
                      ${isCorrect !== null ? 'cursor-default' : 'cursor-pointer hover:scale-[1.03] hover:shadow-xl'}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

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

export default QuickMath;
