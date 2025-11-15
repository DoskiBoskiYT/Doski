
import React from 'react';
import type { CountryInfo } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface CountryInfoPanelProps {
  countryInfo: CountryInfo | null;
  selectedCountryName: string | null;
  isLoading: boolean;
  error: string | null;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{value}</dd>
  </div>
);

const CountryInfoPanel: React.FC<CountryInfoPanelProps> = ({
  countryInfo,
  selectedCountryName,
  isLoading,
  error,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400 p-8">
          <h3 className="text-lg font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      );
    }
    
    if (!selectedCountryName) {
      return (
        <div className="text-center text-gray-400 p-8 flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-300">Select a Country</h3>
            <p className="mt-1 text-sm">Click on the map to discover more about a nation.</p>
        </div>
      )
    }

    if (!countryInfo) {
         return (
        <div className="text-center text-gray-400 p-8">
          <p>No information available for {selectedCountryName}.</p>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-2xl font-bold leading-6 text-cyan-400 flex items-center">
          <span className="text-4xl mr-3" role="img" aria-label={`Flag of ${selectedCountryName}`}>{countryInfo.flagEmoji}</span>
          {selectedCountryName}
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-gray-300">{countryInfo.description}</p>
        <div className="mt-5 border-t border-gray-700">
          <dl className="divide-y divide-gray-700">
            <InfoRow label="Capital" value={countryInfo.capital} />
            <InfoRow label="Population" value={countryInfo.population.toLocaleString()} />
            <InfoRow label="GDP (USD)" value={`$${countryInfo.gdp.toLocaleString()}`} />
            <InfoRow label="Primary Language(s)" value={countryInfo.language} />
            <InfoRow label="Interesting Fact" value={
                <p className="italic text-gray-300">"{countryInfo.fact}"</p>
            }/>
          </dl>
        </div>
        {countryInfo.states && countryInfo.states.length > 0 && (
          <div className="mt-5 border-t border-gray-700 pt-5">
            <details>
              <summary className="text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors focus:outline-none">
                States/Provinces ({countryInfo.states.length})
              </summary>
              <div className="mt-3 pl-4 max-h-40 overflow-y-auto border-l-2 border-gray-600">
                <ul className="space-y-1">
                  {countryInfo.states.map((state) => (
                    <li key={state.name} className="text-sm text-gray-300">{state.name}</li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700 overflow-hidden h-full">
      <div className="px-4 py-5 sm:p-6 h-full overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default CountryInfoPanel;
