import { GoogleGenAI, Type } from "@google/genai";
import type { CountryInfo } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const countryInfoSchema = {
  type: Type.OBJECT,
  properties: {
    capital: {
      type: Type.STRING,
      description: "The capital city of the country.",
    },
    population: {
      type: Type.NUMBER,
      description: "The estimated total population of the country.",
    },
    language: {
      type: Type.STRING,
      description: "The primary official or most widely spoken language(s).",
    },
    fact: {
      type: Type.STRING,
      description: "A brief, interesting, and unique fact about the country.",
    },
    description: {
      type: Type.STRING,
      description: "A short, one-paragraph overview of the country, highlighting its geography, culture, or history."
    },
    gdp: {
      type: Type.NUMBER,
      description: "The Gross Domestic Product (GDP) of the country in USD.",
    },
    flagEmoji: {
      type: Type.STRING,
      description: "A single emoji character representing the country's flag.",
    },
    states: {
      type: Type.ARRAY,
      description: "A list of the country's states, provinces, or major administrative divisions. If the country doesn't have states, this should be an empty array.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The name of the state or administrative division."
          }
        },
        required: ['name']
      }
    }
  },
  required: ['capital', 'population', 'language', 'fact', 'description', 'gdp', 'flagEmoji', 'states'],
};

const capitalListSchema = {
  type: Type.OBJECT,
  properties: {
    capitals: {
      type: Type.ARRAY,
      description: "A list of world capital cities.",
      items: {
        type: Type.STRING,
        description: "The name of a capital city."
      }
    }
  },
  required: ['capitals']
};


export async function getCountryInfo(countryName: string): Promise<CountryInfo | null> {
  try {
    let prompt: string;

    if (countryName.toLowerCase() === 'antarctica') {
      prompt = `Provide a summary for Antarctica. For its "states", please list the countries with territorial claims. Since it has no official capital, permanent population, or national GDP, use "N/A" for the capital and 0 for population and GDP. For the language, list the official languages of the Antarctic Treaty. Provide the flag of the Antarctic Treaty as a single emoji, a short description, and an interesting fact.`;
    } else {
      prompt = `Provide a summary for ${countryName}. Include its capital city, population, primary language(s), a brief, interesting fact, a short description, its GDP in USD, its flag as a single emoji, and a list of its states or major administrative divisions.`;
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: countryInfoSchema,
      },
    });

    const jsonText = response.text.trim();
    const countryData = JSON.parse(jsonText) as CountryInfo;
    return countryData;

  } catch (error) {
    console.error(`Error fetching info for ${countryName}:`, error);
    return null;
  }
}

export async function getCapitalList(): Promise<string[] | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Provide a JSON list of 100 diverse world capitals.",
      config: {
        responseMimeType: "application/json",
        responseSchema: capitalListSchema,
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText) as { capitals: string[] };
    return data.capitals;
  } catch (error) {
    console.error("Error fetching capital list:", error);
    return null;
  }
}
