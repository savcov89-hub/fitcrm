import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Получить историю
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json([]);

  const logs = await prisma.workoutLog.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { date: 'desc' },
    take: 50
  });
  return NextResponse.json(logs);
}

// POST: Сохранить
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, exercises, plannedWorkoutId } = body;
    const uid = parseInt(userId);

    // --- НАЧАЛО ДИАГНОСТИКИ ---
    const now = new Date();
    const todayString = now.toDateString(); // Например: "Sat Dec 13 2025"
    
    console.log("\n--- [DEBUG] НАЧАЛО ЗАПИСИ ИСТОРИИ ---");
    console.log("1. Сейчас на сервере (полная дата):", now.toString());
    console.log("2. Строка для сравнения (сегодня):", todayString);

    // Скачиваем последние записи
    const recentLogs = await prisma.workoutLog.findMany({
        where: { userId: uid },
        orderBy: { date: 'desc' },
        take: 5
    });

    console.log(`3. Найдено записей в базе: ${recentLogs.length}`);

    // Ищем совпадение
    const logToUpdate = recentLogs.find(log => {
        const logDate = new Date(log.date);
        const logString = logDate.toDateString();
        
        console.log(`   - Сравниваю с записью ID ${log.id}:`);
        console.log(`     Дата в базе: ${log.date}`);
        console.log(`     Дата JS:     ${logDate.toString()}`);
        console.log(`     Строка:      "${logString}" === "${todayString}" ? -> ${logString === todayString}`);
        
        return logString === todayString;
    });
    // --- КОНЕЦ ДИАГНОСТИКИ ---

    if (logToUpdate) {
        console.log(">>> РЕШЕНИЕ: ОБНОВИТЬ запись ID", logToUpdate.id);
        await prisma.workoutLog.update({
            where: { id: logToUpdate.id },
            data: { 
                details: JSON.stringify(exercises),
                date: new Date() 
            }
        });
    } else {
        console.log(">>> РЕШЕНИЕ: СОЗДАТЬ НОВУЮ запись");
        await prisma.workoutLog.create({
            data: {
                userId: uid,
                details: JSON.stringify(exercises),
                date: new Date()
            }
        });
    }

    if (plannedWorkoutId) {
        const pid = parseInt(plannedWorkoutId);
        const plan = await prisma.plannedWorkout.findUnique({ where: { id: pid }});
        if (plan) {
            await prisma.plannedWorkout.update({ where: { id: pid }, data: { isDone: true } });
        }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Ошибка сохранения:", error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}