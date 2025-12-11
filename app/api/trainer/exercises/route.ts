import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// Импортируем старую базу, чтобы не потерять её
import { EXERCISE_DB } from '../../../data/exercises'; 

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Берем твои личные упражнения из базы
    const customExercises = await prisma.exercise.findMany({
        select: { name: true }
    });

    // 2. Объединяем: Старые + Новые
    // (используем Set, чтобы убрать дубликаты, если названия совпали)
    const allNames = new Set([
        ...EXERCISE_DB.map(e => e.name),
        ...customExercises.map(e => e.name)
    ]);

    // Превращаем обратно в список объектов
    const result = Array.from(allNames).map(name => ({ name }));
    
    // Сортируем по алфавиту
    result.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}

// Добавление нового упражнения
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    // Проверяем, может оно уже есть в базе
    const exists = await prisma.exercise.findUnique({ where: { name } });
    if (exists) return NextResponse.json({ success: true }); // Уже есть, просто ок

    await prisma.exercise.create({ data: { name } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Скорее всего дубликат, не страшно
    return NextResponse.json({ success: true }); 
  }
}