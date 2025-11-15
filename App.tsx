import React, { useState, useCallback, useEffect } from 'react';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import WorldMap from './components/WorldMap';
import CountryInfoPanel from './components/CountryInfoPanel';
import Sidebar from './components/Sidebar';
import GuessTheCapitalGame from './components/GuessTheCapitalGame';
import GuessTheFlagGame from './components/GuessTheFlagGame';
import { getCountryInfo, getCapitalList } from './services/geminiService';
import type { CountryInfo } from './types';

const MAP_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type ActiveView = 'info' | 'guessTheCapital' | 'guessTheFlag';

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; id: string } | null>(null);
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('info');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  const [geographies, setGeographies] = useState<Feature[]>([]);
  const [capitalList, setCapitalList] = useState<string[]>([]);

  useEffect(() => {
    fetch(MAP_URL)
      .then(response => response.json())
      .then(data => {
        const countries = feature(data, data.objects.countries) as FeatureCollection<Geometry, { name: string }>;
        setGeographies(countries.features);
      })
      .catch(err => console.error("Could not load map data:", err));

    getCapitalList()
      .then(capitals => {
        if (capitals) {
          setCapitalList(capitals);
        }
      })
      .catch(err => console.error("Could not load capital list:", err));
  }, []);
  
  const handleCountryClick = useCallback(async (countryName: string, countryId: string) => {
    if (activeView !== 'info' || selectedCountry?.id === countryId) {
        return; 
    }
    
    setSelectedCountry({ name: countryName, id: countryId });
    setIsLoading(true);
    setError(null);
    setCountryInfo(null);
    
    try {
      const info = await getCountryInfo(countryName);
      if (info) {
        setCountryInfo(info);
      } else {
        setError(`Could not retrieve information for ${countryName}.`);
      }
    } catch (e) {
      setError('An unexpected error occurred while fetching data.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCountry, activeView]);

  const handleSetView = (view: ActiveView) => {
    setActiveView(view);
    // Reset selection when switching views
    setSelectedCountry(null); 
    setCountryInfo(null);
    setError(null);
  }

  const renderRightPanel = () => {
    switch(activeView) {
      case 'guessTheCapital':
        return <GuessTheCapitalGame geographies={geographies} capitalList={capitalList} />;
      case 'guessTheFlag':
        return <GuessTheFlagGame geographies={geographies} />;
      case 'info':
      default:
        return (
          <CountryInfoPanel 
              selectedCountryName={selectedCountry?.name || null}
              countryInfo={countryInfo}
              isLoading={isLoading}
              error={error}
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                International Map Station
            </span>
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          {activeView === 'info' ? 'Click a country to learn more with Gemini' : 'Play a minigame!'}
        </p>
      </header>
      
      <main className="flex-grow flex gap-6 lg:gap-8 h-[calc(100vh-150px)]">
        <Sidebar 
          activeView={activeView} 
          setActiveView={handleSetView} 
          isOpen={isSidebarOpen} 
          setIsOpen={setSidebarOpen} 
        />
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 h-full">
            <div className="lg:col-span-2 h-full min-h-[400px] lg:min-h-0">
                <WorldMap 
                  onCountryClick={handleCountryClick} 
                  selectedCountryId={selectedCountry?.id || null}
                  geographies={geographies}
                  isInteractive={activeView === 'info'}
                />
            </div>
            <div className="h-full">
                {renderRightPanel()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;