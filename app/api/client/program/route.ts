import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const uid = parseInt(userId);

    // 1. ИЩЕМ ТОЛЬКО В НОВОЙ ТАБЛИЦЕ (Очередь)
    // Берем первую тренировку, которая еще НЕ выполнена (isDone: false)
    // Сортируем по порядку (order: asc)
    const nextWorkout = await prisma.plannedWorkout.findFirst({
      where: { 
          userId: uid,
          isDone: false 
      },
      orderBy: { order: 'asc' }, 
    });

    // Если в плане пусто — возвращаем null (Клиент увидит "План выполнен")
    // Старую таблицу Program мы ИГНОРИРУЕМ, поэтому "хуй2" исчезнет.
    if (!nextWorkout) return NextResponse.json(null);

    // 2. Достаем историю для подсказок (стандартная логика)
    const history = await prisma.workoutLog.findMany({
      where: { userId: uid },
      orderBy: { date: 'desc' },
    });

    let currentExercises = [];
    try {
        currentExercises = JSON.parse(nextWorkout.exercises);
    } catch(e) {
        currentExercises = [];
    }

    // 3. Прикрепляем историю к упражнениям
    currentExercises = currentExercises.map((ex: any) => {
      const relevantLogs = history.filter(log => {
        try {
            const details = JSON.parse(log.details);
            return Array.isArray(details) && details.some((d: any) => d.name === ex.name);
        } catch(e) { return false; }
      }).slice(0, 5);

      const historyList = relevantLogs.map(log => {
        const details = JSON.parse(log.details);
        const foundEx = details.find((e: any) => e.name === ex.name);
        
        let resStr = '';
        if (foundEx.actualSets && foundEx.actualSets.length > 0) {
          const w = foundEx.actualSets[0].weight || foundEx.workingWeight || 0;
          const r = foundEx.actualSets.map((s: any) => s.reps).join(', ');
          resStr = `${w}кг х ${r}`;
        } else {
          resStr = `${foundEx.doneWeight}кг х ${foundEx.doneReps}`;
        }
        
        const date = new Date(log.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        return { date, result: resStr };
      });

      return { ...ex, historyList };
    });

    // Возвращаем данные для карточки и страницы тренировки
    return NextResponse.json({ 
        name: nextWorkout.name, 
        plannedId: nextWorkout.id, // ID нужен, чтобы при завершении вычеркнуть её
        exercises: JSON.stringify(currentExercises) 
    });

  } catch (error) {
    console.error("Ошибка API client/program:", error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}