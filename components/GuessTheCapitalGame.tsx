import React, { useState, useEffect, useCallback } from 'react';
import type { Feature } from 'geojson';
import { getCountryInfo } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface GameProps {
  geographies: Feature[];
  capitalList: string[];
}

type GameState = 'idle' | 'loading' | 'playing' | 'answered';

interface Question {
  countryName: string;
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

const GuessTheCapitalGame: React.FC<GameProps> = ({ geographies, capitalList }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQuestion = useCallback(async () => {
    if (geographies.length === 0 || capitalList.length < 3) return;

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
            // Ensure we get a valid capital
            if (info && info.capital && info.capital !== 'N/A') {
                countryData = { name: countryName, capital: info.capital };
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

    const correctAnswer = countryData.capital;
    const distractors = new Set<string>();
    while (distractors.size < 3) {
      const randomCapital = capitalList[Math.floor(Math.random() * capitalList.length)];
      if (randomCapital.toLowerCase() !== correctAnswer.toLowerCase()) {
        distractors.add(randomCapital);
      }
    }
    
    const options = shuffleArray([correctAnswer, ...distractors]);

    setQuestion({ countryName: countryData.name, options, correctAnswer });
    setGameState('playing');
  }, [geographies, capitalList]);

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
            <h3 className="text-xl font-bold text-cyan-400 mb-2">Guess the Capital!</h3>
            <p className="text-gray-300 mb-6">Test your geography knowledge.</p>
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
                <p className="text-xl text-center font-medium mb-6">
                    What is the capital of <span className="font-bold text-white">{question.countryName}</span>?
                </p>
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

export default GuessTheCapitalGame;
