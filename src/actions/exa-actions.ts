'use server'

import Exa from 'exa-js';

const exa = new Exa("5c63aa2c-7324-4b7c-9c22-23bb4ff5f62e");

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