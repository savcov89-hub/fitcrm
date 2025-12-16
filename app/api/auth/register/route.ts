import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Достаем новые поля: gender, height, birthDate
    const { email, password, name, role, trainerId, gender, height, birthDate } = body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        name,
        role,
        trainerId: role === 'client' && trainerId ? parseInt(trainerId) : null,
        
        // --- НОВЫЕ ДАННЫЕ ---
        gender: gender || null,
        height: height ? parseFloat(height) : null,
        // Если дата есть, превращаем её в формат даты, иначе null
        birthDate: birthDate ? new Date(birthDate) : null,
        isActive: true
      }
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}