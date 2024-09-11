'use server'

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getOpenAICompletion(systemContent: string = "You are a helpful assistant.") {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: systemContent }],
      model: "gpt-4o-mini",
    });

    return { success: true, data: completion.choices[0] };
  } catch (error) {
    console.error('Error getting OpenAI completion:', error);
    return { success: false, error: 'Failed to get OpenAI completion' };
  }
}

export async function summarizeText(text: string) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes information." },
        { role: "user", content: `Summarize the following information: ${text}` }
      ],
      model: "gpt-3.5-turbo",
    });

    return { success: true, data: completion.choices[0].message.content };
  } catch (error) {
    console.error('Error getting OpenAI completion:', error);
    return { success: false, error: 'Failed to get OpenAI completion' };
  }
}