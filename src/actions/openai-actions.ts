'use server'

import OpenAI from "openai";

// Validate that the API key is present
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment variables.");
}

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Function to get a chat completion from OpenAI.
 * @param systemContent - The system prompt content.
 * @returns An object containing success status and the completion data or error message.
 */
export async function getOpenAICompletion(systemContent: string = "You are a helpful assistant.") {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Make sure this is a valid model name
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: "Hello, how can you help me today?" }
      ],
    });

    return { success: true, data: completion.choices[0] };
  } catch (error) {
    console.error('Error getting OpenAI completion:', error);
    return { success: false, error: 'Failed to get OpenAI completion' };
  }
}

/**
 * Function to summarize text using OpenAI's chat completions.
 * @param text - The text to summarize.
 * @returns An object containing success status and the summarized text or error message.
 */
export async function summarizeText(text: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes information." },
        { role: "user", content: `Summarize the following information: ${text}` }
      ],
    });

    return { success: true, data: completion.choices[0].message?.content || '' };
  } catch (error) {
    console.error('Error getting OpenAI completion:', error);
    return { success: false, error: 'Failed to get OpenAI completion' };
  }
}

/**
 * Function to stream text from OpenAI's chat completions.
 * @param params - An object containing the model and prompt.
 * @returns An asynchronous iterable that yields chunks of text.
 */
export async function* streamText(params: { model: string; prompt: string; }): AsyncIterable<{ text: string }> {
  try {
    const stream = await openai.chat.completions.create({
      model: params.model,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: params.prompt }
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield { text: chunk.choices[0].delta.content };
      }
    }
  } catch (error) {
    console.error('Error streaming OpenAI completion:', error);
    throw new Error('Failed to stream OpenAI completion');
  }
}
