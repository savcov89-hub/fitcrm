import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json([]);

    // БЕРЕМ ДАННЫЕ ЗА ГОД (чтобы работали фильтры графиков)
    const timeWindow = new Date();
    timeWindow.setDate(timeWindow.getDate() - 365);

    const logs = await prisma.measurement.findMany({
      where: { 
        userId: parseInt(userId),
        weight: { gt: 0 }, 
        date: { gte: timeWindow }
      },
      orderBy: { date: 'desc' }
    });

    const getAverage = (daysStart: number, daysEnd: number) => {
        const now = new Date();
        const start = new Date(); start.setDate(now.getDate() - daysEnd);
        start.setHours(0,0,0,0);
        const end = new Date(); end.setDate(now.getDate() - daysStart);
        end.setHours(23,59,59,999);

        const relevant = logs.filter(l => {
            const d = new Date(l.date);
            return d >= start && d <= end;
        });

        if (relevant.length === 0) return null;
        const sum = relevant.reduce((acc, curr) => acc + curr.weight, 0);
        return (sum / relevant.length).toFixed(1);
    };

    const currentAvg = getAverage(0, 7);
    const week2Avg = getAverage(7, 14);
    const week3Avg = getAverage(14, 21);
    const week4Avg = getAverage(21, 28);
    const week5Avg = getAverage(28, 35);

    const calcDiff = (a: string | null, b: string | null) => {
        if (!a || !b) return null;
        return (Number(a) - Number(b)).toFixed(1);
    };

    return NextResponse.json({
        logs: logs, 
        stats: {
            current: currentAvg,
            diffCurrent: calcDiff(currentAvg, week2Avg),
            week2: week2Avg,
            diffWeek2: calcDiff(week2Avg, week3Avg),
            week3: week3Avg,
            diffWeek3: calcDiff(week3Avg, week4Avg),
            week4: week4Avg,
            diffWeek4: calcDiff(week4Avg, week5Avg),
            week5: week5Avg 
        }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, weight, date } = await request.json();
    const uid = parseInt(userId);
    const targetDate = date ? new Date(date) : new Date();
    
    const dayStart = new Date(targetDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate); dayEnd.setHours(23, 59, 59, 999);

    const existingEntry = await prisma.measurement.findFirst({
        where: {
            userId: uid,
            weight: { gt: 0 },
            date: { gte: dayStart, lte: dayEnd }
        }
    });

    if (existingEntry) {
        await prisma.measurement.update({
            where: { id: existingEntry.id },
            data: { weight: parseFloat(weight), date: targetDate }
        });
    } else {
        await prisma.measurement.create({
            data: { userId: uid, weight: parseFloat(weight), date: targetDate }
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 });
  }
}