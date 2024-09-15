import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { text, query, sources } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes information and engages in conversational dialogue. Provide clear, concise answers with a friendly tone."
        },
        {
          role: "user",
          content: `Please provide a comprehensive summary of the following information about ${query}. Include key details about the subject's background, highlights, major works or achievements, and their impact or influence. The summary should be structured in 2-3 paragraphs. After the summary, add a sentence inviting the user to ask follow-up questions:\n\n${text}`
        }
      ],
      max_tokens: 500,
    });

    const summary = response.choices[0].message.content;

    return NextResponse.json({ summary, sources });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}