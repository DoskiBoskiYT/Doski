import React from 'react';

type ActiveView = 'info' | 'guessTheCapital' | 'guessTheFlag';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
  const baseButtonClass = "w-full text-left p-3 rounded-md transition-colors duration-200 text-sm font-medium flex items-center gap-3";
  const activeButtonClass = "bg-cyan-500 text-white";
  const inactiveButtonClass = "bg-gray-700 hover:bg-gray-600 text-gray-300";

  return (
    <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex-grow p-3">
        <div className="flex items-center justify-between mb-4">
          {isOpen && <h2 className="text-lg font-semibold text-white">Menu</h2>}
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
             {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
             )}
          </button>
        </div>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveView('info')}
            className={`${baseButtonClass} ${activeView === 'info' ? activeButtonClass : inactiveButtonClass}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {isOpen && <span>Country Info</span>}
          </button>
          
          <div className="pt-4 mt-4 border-t border-gray-700">
             {isOpen && <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Minigames</h3>}
          </div>

          <button
            onClick={() => setActiveView('guessTheCapital')}
            className={`${baseButtonClass} ${activeView === 'guessTheCapital' ? activeButtonClass : inactiveButtonClass}`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {isOpen && <span>Guess the Capital</span>}
          </button>

          <button
            onClick={() => setActiveView('guessTheFlag')}
            className={`${baseButtonClass} ${activeView === 'guessTheFlag' ? activeButtonClass : inactiveButtonClass}`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
            {isOpen && <span>Guess the Flag</span>}
          </button>

        </nav>
      </div>
    </div>
  );
};

export default Sidebar;