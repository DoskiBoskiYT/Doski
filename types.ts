
export interface StateInfo {
  name: string;
}

export interface CountryInfo {
  capital: string;
  population: number;
  language: string;
  fact: string;
  description: string;
  gdp: number;
  flagEmoji: string;
  states: StateInfo[];
}
