import React, { useState, useCallback } from 'react';
import type { Feature } from 'geojson';
import { getCountryInfo } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface GameProps {
  geographies: Feature[];
}

type GameState = 'idle' | 'loading' | 'playing' | 'answered';

interface Question {
  flagEmoji: string;
  options: string[];
  correctAnswer: string;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const GuessTheFlagGame: React.FC<GameProps> = ({ geographies }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQuestion = useCallback(async () => {
    if (geographies.length === 0) return;

    setGameState('loading');
    setSelectedAnswer(null);
    setError(null);

    let countryData = null;
    let attempts = 0;
    while (!countryData && attempts < 10) {
        const randomCountry = geographies[Math.floor(Math.random() * geographies.length)];
        const countryName = (randomCountry.properties as { name: string }).name;
        
        try {
            const info = await getCountryInfo(countryName);
            // Ensure we get a valid flag emoji
            if (info && info.flagEmoji) {
                countryData = { name: countryName, flagEmoji: info.flagEmoji };
            }
        } catch (e) {
            console.error(`Failed to fetch info for ${countryName}`, e);
        }
        attempts++;
    }

    if (!countryData) {
        setError("Could not generate a new question. Please try again later.");
        setGameState('idle');
        return;
    }

    const correctAnswer = countryData.name;
    const distractors = new Set<string>();
    while (distractors.size < 3) {
      const randomCountry = geographies[Math.floor(Math.random() * geographies.length)];
      const randomCountryName = (randomCountry.properties as { name: string }).name;
      if (randomCountryName.toLowerCase() !== correctAnswer.toLowerCase()) {
        distractors.add(randomCountryName);
      }
    }
    
    const options = shuffleArray([correctAnswer, ...distractors]);

    setQuestion({ flagEmoji: countryData.flagEmoji, options, correctAnswer });
    setGameState('playing');
  }, [geographies]);

  const handleStartGame = () => {
    setScore(0);
    setQuestionsAsked(0);
    generateQuestion();
  };

  const handleAnswer = (answer: string) => {
    if (gameState !== 'playing') return;
    
    setSelectedAnswer(answer);
    if (answer === question?.correctAnswer) {
      setScore(prev => prev + 1);
    }
    setQuestionsAsked(prev => prev + 1);
    setGameState('answered');
  };
  
  const getButtonClass = (option: string) => {
    if (gameState === 'answered') {
      if (option === question?.correctAnswer) {
        return 'bg-green-500 hover:bg-green-500';
      }
      if (option === selectedAnswer) {
        return 'bg-red-500 hover:bg-red-500';
      }
    }
    return 'bg-gray-700 hover:bg-gray-600';
  }


  const renderContent = () => {
    if (gameState === 'idle') {
      return (
        <div className="text-center">
            <h3 className="text-xl font-bold text-cyan-400 mb-2">Guess the Flag!</h3>
            <p className="text-gray-300 mb-6">Test your vexillology knowledge.</p>
            <button onClick={handleStartGame} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors">
                Start Game
            </button>
             {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      );
    }

    if (gameState === 'loading') {
        return <LoadingSpinner />;
    }

    if (question) {
        return (
            <div>
                <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-lg font-semibold text-cyan-400">Question {questionsAsked + 1}</h3>
                    <p className="text-lg font-bold">Score: {score}/{questionsAsked}</p>
                </div>
                <div className="text-center mb-6">
                    <p className="text-xl font-medium mb-2">
                        Which country does this flag belong to?
                    </p>
                    <span className="text-8xl" role="img" aria-label="Country flag">{question.flagEmoji}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.options.map(option => (
                        <button 
                            key={option}
                            onClick={() => handleAnswer(option)}
                            disabled={gameState === 'answered'}
                            className={`p-4 rounded-lg text-white font-semibold transition-colors duration-200 ${getButtonClass(option)} disabled:opacity-75 disabled:cursor-not-allowed`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                {gameState === 'answered' && (
                     <div className="mt-6 text-center">
                         <button onClick={generateQuestion} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
                             Next Question
                         </button>
                     </div>
                )}
            </div>
        );
    }
    return null;
  }

  return (
    <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700 overflow-hidden h-full">
      <div className="px-4 py-5 sm:p-6 h-full overflow-y-auto flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default GuessTheFlagGame;