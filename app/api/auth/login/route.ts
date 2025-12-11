import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    // Ищем пользователя в базе
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Если пользователя нет или пароль не совпал
    // (Внимание: тут простое сравнение, для реального проекта нужен bcrypt, но пока так, чтобы не усложнять)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    // Если всё ок, возвращаем данные пользователя (без пароля)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}