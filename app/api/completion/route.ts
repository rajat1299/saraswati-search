import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',  // Updated to use gpt-4o-mini as requested
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a highly knowledgeable assistant that provides detailed, comprehensive, and well-structured summaries. When answering questions:
        1. Provide a brief introduction about the subject.
        2. Divide the information into relevant sections (e.g., Early Life and Career, Major Works and Achievements, Influence and Recognition).
        3. Include specific details, dates, and examples to support the information.
        4. Highlight the subject's impact and significance in their field.
        5. Mention any recent developments or ongoing projects if applicable.
        6. Ensure your response is informative, well-organized, and avoids repetition.
        7. Use paragraph breaks to improve readability.
        Aim for a comprehensive summary that covers various aspects of the topic while maintaining clarity and coherence.`,
      },
      ...messages,
    ],
    max_tokens: 2000,  // Keeping this at 2000 as we're not sure about the model's capabilities
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    n: 1,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}