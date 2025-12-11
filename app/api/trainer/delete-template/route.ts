import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    await prisma.template.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления шаблона:", error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}