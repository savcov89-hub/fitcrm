import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic'; // Принудительно отключаем кэш API

// --- БАЗА УПРАЖНЕНИЙ ---
const EXERCISE_POOLS: any = {
  'upper': [
    { name: '[TEST] Жим штанги лежа', weight: '' },
    { name: '[TEST] Тяга верхнего блока', weight: '' },
    { name: '[TEST] Разгибание на трицепс', weight: '' }
  ],
  'lower': [
    { name: '[TEST] Приседания', weight: '' },
    { name: '[TEST] Румынская тяга', weight: '' },
    { name: '[TEST] Сгибание ног', weight: '' }
  ],
  'push': [
    { name: '[TEST] Жим гантелей наклонный', weight: '' },
    { name: '[TEST] Армейский жим', weight: '' },
    { name: '[TEST] Французский жим', weight: '' }
  ],
  'pull': [
    { name: '[TEST] Становая тяга', weight: '' },
    { name: '[TEST] Подтягивания', weight: '' },
    { name: '[TEST] Подъем на бицепс', weight: '' }
  ],
  'legs': [
    { name: '[TEST] Жим ногами', weight: '' },
    { name: '[TEST] Выпады', weight: '' },
    { name: '[TEST] Икры стоя', weight: '' }
  ],
  'full1': [{ name: 'Full Body A Test', weight: '' }],
  'full2': [{ name: 'Full Body B Test', weight: '' }]
};

// --- НАСТРОЙКИ СПЛИТОВ ---
const SPLIT_CONFIG: any = {
  '2day': [{ title: 'День А (Верх)', type: 'upper' }, { title: 'День Б (Низ)', type: 'lower' }],
  '3day': [{ title: 'Push', type: 'push' }, { title: 'Pull', type: 'pull' }, { title: 'Legs', type: 'legs' }],
  'full': [{ title: 'FB A', type: 'full1' }, { title: 'FB B', type: 'full2' }]
};

export async function POST(request: Request) {
  console.log("--- НАЧАЛО ГЕНЕРАЦИИ ---"); // <--- ЖУЧОК 1
  try {
    const body = await request.json();
    const { clientId, weeks, splitType } = body;
    console.log(`Параметры: Клиент=${clientId}, Недель=${weeks}, Сплит=${splitType}`); // <--- ЖУЧОК 2
    
    const uid = parseInt(clientId);

    await prisma.plannedWorkout.deleteMany({ where: { userId: uid, isDone: false } });

    const newWorkouts = [];
    let orderCounter = 1;

    // Получаем конфигурацию дней. Если сплит не найден, берем 2day
    const daysConfig = SPLIT_CONFIG[splitType] || SPLIT_CONFIG['2day'];
    console.log("Конфигурация дней:", JSON.stringify(daysConfig)); // <--- ЖУЧОК 3

    for (let w = 1; w <= parseInt(weeks); w++) {
      const isPowerPhase = w % 2 === 0;
      const phaseName = isPowerPhase ? "Силовая" : "Гипертрофия";
      const targetReps = isPowerPhase ? "5-6" : "10-12"; 
      const targetSets = isPowerPhase ? "4" : "3";

      for (const day of daysConfig) {
        console.log(`Генерирую: Неделя ${w}, День типа: ${day.type}`); // <--- ЖУЧОК 4

        // Ищем шаблон по ключу (type)
        const rawExercises = EXERCISE_POOLS[day.type];
        
        if (!rawExercises) {
             console.error(`ОШИБКА! Не найден шаблон для ключа: "${day.type}"`); // <--- ЖУЧОК ОШИБКИ
        }

        const finalExercises = (rawExercises || [{ name: "ОШИБКА ШАБЛОНА", weight: "" }]).map((ex: any) => ({
            name: ex.name,
            weight: ex.weight, 
            sets: targetSets,
            reps: targetReps
        }));

        newWorkouts.push({
          userId: uid,
          name: `Неделя ${w}: ${day.title} [${phaseName}]`,
          order: orderCounter++,
          exercises: JSON.stringify(finalExercises),
          isDone: false
        });
      }
    }

    await prisma.plannedWorkout.createMany({ data: newWorkouts });
    console.log(`Успешно создано ${newWorkouts.length} тренировок.`); // <--- ЖУЧОК ФИНАЛА
    console.log("--- КОНЕЦ ГЕНЕРАЦИИ ---");

    return NextResponse.json({ success: true, count: newWorkouts.length });

  } catch (error) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА ГЕНЕРАТОРА:", error);
    return NextResponse.json({ error: 'Ошибка генерации' }, { status: 500 });
  }
}