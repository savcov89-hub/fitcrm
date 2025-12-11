import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { goal, split, level, historyContext } = await request.json();

    const prompt = `
      Ты — агрессивный тренер по силовому спорту. Твоя цель — заставить клиента прогрессировать.
      
      ВХОДНЫЕ ДАННЫЕ:
      Цель: ${goal}
      ИСТОРИЯ КЛИЕНТА:
      ${historyContext}
      
      АЛГОРИТМ РАСЧЕТА ВЕСА (СТРОГИЙ):
      Проанализируй строку "Факт" и "План" для каждого упражнения.
      
      1. ПРАВИЛО ПОВЫШЕНИЯ (АГРЕССИВНОЕ):
         - Если клиент выполнил план во ВСЕХ подходах (например, план 10, сделал 10, 10, 10) -> ПОВЫШАЙ ВЕС (+2.5кг или +5кг).
         - Если клиент ПЕРЕВЫПОЛНИЛ план хотя бы в одном подходе (например, 15, 15, 17) -> ОБЯЗАТЕЛЬНО ПОВЫШАЙ ВЕС.
      
      2. ПРАВИЛО СОХРАНЕНИЯ:
         - Оставляй вес прежним, ТОЛЬКО если клиент НЕ СПРАВИЛСЯ с планом в последних подходах (например, 10, 8, 6).
      
      3. ОКРУГЛЕНИЕ:
         - Для гантелей и тренажеров округляй до шага 2кг или 5кг (не пиши 16.5кг, пиши 18кг).
         - Для штанги шаг 2.5кг.
      
      ТВОЙ ОТВЕТ (JSON):
      [
        {
          "name": "Название",
          "sets": "число",
          "reps": "число (если повысил вес, можешь чуть снизить повторы, например с 15 до 12)",
          "weight": "число (НОВЫЙ ВЕС)" 
        }
      ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        { role: "system", content: "Ты тренер. Ты всегда повышаешь веса, если клиент справился с планом." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3, // Очень низкая температура, чтобы он четко следовал правилам
    });

    let content = completion.choices[0].message.content || "[]";
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const exercises = JSON.parse(content);

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка генерации' }, { status: 500 });
  }
}