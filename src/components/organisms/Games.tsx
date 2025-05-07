import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import components and data
import GameCard from '../molecules/GameCard';
import MemoryMatch from '../molecules/MemoryMatch';
import ColorGuess from '../molecules/ColorGuess';
import QuickMath from '../molecules/QuickMath';
import games from '../../data/games';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

const Games: React.FC = () => {
  const [activeGame, setActiveGame] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // Animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'center center',
        toggleActions: 'play none none reverse',
      },
    });

    // Animate the title and subtitle
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(
        cardsRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out'
        },
        '-=0.2'
      );

    return () => {
      // Clean up
      if (tl) tl.kill();
    };
  }, []);

  const handlePlayGame = (id: number) => {
    setActiveGame(id);
  };

  const handleCloseGame = () => {
    setActiveGame(null);
  };

  const renderActiveGame = () => {
    switch (activeGame) {
      case 1:
        return <MemoryMatch onClose={handleCloseGame} />;
      case 2:
        return <ColorGuess onClose={handleCloseGame} />;
      case 3:
        return <QuickMath onClose={handleCloseGame} />;
      default:
        return null;
    }
  };

  return (
    <section
      id="games"
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 py-20"
    >
      {/* Enhanced background elements for glassmorphic effect */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-700/15 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full filter blur-3xl"></div>
      <div className="absolute top-2/3 left-1/2 w-72 h-72 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl"></div>

      {/* Section header with glassmorphic effect */}
      <div className="text-center mb-16 z-10 max-w-3xl">
        <div className="inline-block mb-2 backdrop-blur-sm bg-primary-800/30 px-6 py-2 rounded-full border border-primary-700/30">
          <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-primary-400 bg-clip-text text-transparent">
              Fun & Games
            </span>
          </h2>
        </div>
        <p ref={subtitleRef} className="text-lg text-gray-300 mx-auto backdrop-blur-sm bg-primary-900/20 p-4 rounded-xl">
          Take a break and enjoy some fun mini-games. Challenge yourself or just relax
          with these interactive experiences designed to showcase interactive web development.
        </p>
      </div>

      {/* Games display or active game with enhanced glassmorphic container */}
      {activeGame ? (
        <div className="w-full max-w-4xl mx-auto z-10">
          {renderActiveGame()}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto z-10">
          {games.map((game, index) => (
            <div
              key={game.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
            >
              <GameCard
                game={game}
                index={index}
                onPlay={handlePlayGame}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Games;
