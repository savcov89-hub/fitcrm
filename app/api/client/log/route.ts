import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // ИСПРАВЛЕНИЕ: Читаем 'details', а не 'exercises'
    // Фронтенд отправляет { userId, details, plannedId }
    const userId = body.userId || body.id; 
    const { details, plannedId } = body; 
    
    const uid = parseInt(userId);

    // --- НАЧАЛО: ЖЕЛЕЗНАЯ ПРОВЕРКА ДАТЫ ---
    const now = new Date();
    const todayString = now.toDateString(); 

    console.log(`[DEBUG] Сохраняем для ID ${uid}. План ID: ${plannedId}`);

    // 1. Ищем записи за последние дни
    const recentLogs = await prisma.workoutLog.findMany({
        where: { userId: uid },
        orderBy: { date: 'desc' },
        take: 20
    });

    // 2. Ищем запись за сегодня
    const logToUpdate = recentLogs.find(log => {
        return new Date(log.date).toDateString() === todayString;
    });

    // Подготовка данных (если details это объект, превращаем в строку)
    const detailsString = typeof details === 'string' ? details : JSON.stringify(details);

    if (logToUpdate) {
        console.log(">>> НАШЛИ запись за сегодня! ОБНОВЛЯЕМ.");
        await prisma.workoutLog.update({
            where: { id: logToUpdate.id },
            data: { 
                details: detailsString, // <--- Исправлено
                date: new Date()
            }
        });
    } else {
        console.log(">>> Записи за сегодня нет. СОЗДАЕМ НОВУЮ.");
        await prisma.workoutLog.create({
            data: {
                userId: uid,
                details: detailsString, // <--- Исправлено
                date: new Date()
            }
        });
    }
    // --- КОНЕЦ ПРОВЕРКИ ---

    // 3. Закрываем тренировку в плане
    if (plannedId) {
        const pid = parseInt(plannedId);
        const plan = await prisma.plannedWorkout.findUnique({ where: { id: pid }});
        if (plan) {
            await prisma.plannedWorkout.update({
                where: { id: pid },
                data: { isDone: true }
            });
        }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Ошибка сохранения лога:", error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}