import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, gender, birthDate, height } = body;

    if (!name || !email || !password) {
        return NextResponse.json({ error: 'Имя, почта и пароль обязательны' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return NextResponse.json({ error: 'Почта уже занята' }, { status: 400 });
    }

    // Подготовка даты (если пришла строка, превращаем в Date)
    const birthDateObj = birthDate ? new Date(birthDate) : null;
    const heightNum = height ? parseFloat(height) : null;

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password,
            gender: gender || 'male', // По умолчанию мужчина, если не выбрано
            birthDate: birthDateObj,
            height: heightNum,
            role: 'client',
            isActive: false,
            isTraining: false
        }
    });

    return NextResponse.json({ success: true, user: newUser });

  } catch (error) {
    console.error("Ошибка создания:", error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}