'use server'

import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY || '');

export async function searchExaAI(query: string) {
  try {
    const result = await exa.searchAndContents(
      query,
      {
        type: "neural",
        useAutoprompt: true,
        numResults: 10,
        text: true
      }
    );

    return { success: true, data: result };
  } catch (error) {
    console.error('Error searching Exa AI:', error);
    return { success: false, error: 'Failed to search Exa AI' };
  }
}