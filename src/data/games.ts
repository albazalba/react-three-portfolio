interface Game {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const games: Game[] = [
  {
    id: 1,
    name: 'Memory Match',
    description: 'Test your memory by matching pairs of cards.',
    difficulty: 'easy',
  },
  {
    id: 2,
    name: 'Color Guess',
    description: 'Guess the correct color from the RGB value.',
    difficulty: 'medium',
  },
  {
    id: 3,
    name: 'Quick Math',
    description: 'Solve math problems as quickly as possible.',
    difficulty: 'medium',
  }
];

export default games;
