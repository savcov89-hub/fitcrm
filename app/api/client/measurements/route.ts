import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json([]);

    const logs = await prisma.measurement.findMany({
      where: { 
        userId: parseInt(userId),
        // Возвращаем запись, если заполнен хотя бы один параметр
        OR: [
            { waist: { not: null } },
            { hips: { not: null } },
            { neck: { not: null } },
            { bodyFat: { not: null } }
        ]
      },
      orderBy: { date: 'desc' },
      take: 10
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Теперь принимаем еще рост и процент жира
    const { userId, waist, hips, neck, height, bodyFat } = body;
    
    await prisma.measurement.create({
        data: {
            userId: parseInt(userId),
            weight: 0, 
            waist: waist ? parseFloat(waist) : null,
            hips: hips ? parseFloat(hips) : null,
            neck: neck ? parseFloat(neck) : null,
            height: height ? parseFloat(height) : null,     // <-- Рост
            bodyFat: bodyFat ? parseFloat(bodyFat) : null,  // <-- Жир
            date: new Date()
        }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 });
  }
}