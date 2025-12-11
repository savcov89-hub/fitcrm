export const WORKOUT_LIBRARY = [
  
  // =======================================================
  // 1. PUSH / PULL / LEGS (Толкай / Тяни / Ноги)
  // =======================================================
  {
    id: 'ppl_classic',
    category: 'Push/Pull/Legs',
    title: 'Вариант 1: Базовый (Штанга)',
    description: 'Классическая база. Тяжелые веса.',
    workouts: [
      {
        name: 'Push (База)',
        exercises: [
          { name: 'Жим штанги лежа', sets: 3, reps: '', weight: '' },
          { name: 'Армейский жим стоя', sets: 3, reps: '', weight: '' },
          { name: 'Жим узким хватом', sets: 3, reps: '', weight: '' },
          { name: 'Разводка гантелей', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Pull (База)',
        exercises: [
          { name: 'Становая тяга', sets: 3, reps: '', weight: '' },
          { name: 'Тяга штанги в наклоне', sets: 3, reps: '', weight: '' },
          { name: 'Подтягивания с весом', sets: 3, reps: '', weight: '' },
          { name: 'Подъем штанги на бицепс', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Legs (База)',
        exercises: [
          { name: 'Приседания со штангой', sets: 3, reps: '', weight: '' },
          { name: 'Румынская тяга', sets: 3, reps: '', weight: '' },
          { name: 'Выпады со штангой', sets: 3, reps: '', weight: '' },
          { name: 'Подъем на носки стоя', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },
  {
    id: 'ppl_hypertrophy',
    category: 'Push/Pull/Legs',
    title: 'Вариант 2: Гипертрофия (Гантели/Тренажеры)',
    description: 'Акцент на объем и изоляцию.',
    workouts: [
      {
        name: 'Push (Объем)',
        exercises: [
          { name: 'Жим гантелей на наклонной', sets: 3, reps: '', weight: '' },
          { name: 'Жим в Хаммере', sets: 3, reps: '', weight: '' },
          { name: 'Махи гантелями в стороны', sets: 3, reps: '', weight: '' },
          { name: 'Разгибание на блоке (канат)', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Pull (Объем)',
        exercises: [
          { name: 'Тяга верхнего блока', sets: 3, reps: '', weight: '' },
          { name: 'Тяга горизонтального блока', sets: 3, reps: '', weight: '' },
          { name: 'Пуловер в блоке', sets: 3, reps: '', weight: '' },
          { name: 'Молотки на бицепс', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Legs (Объем)',
        exercises: [
          { name: 'Жим ногами', sets: 3, reps: '', weight: '' },
          { name: 'Гакк-приседания', sets: 3, reps: '', weight: '' },
          { name: 'Сгибание ног лежа', sets: 3, reps: '', weight: '' },
          { name: 'Разгибание ног сидя', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },
  {
    id: 'ppl_mix',
    category: 'Push/Pull/Legs',
    title: 'Вариант 3: Смешанный (Атлетичный)',
    description: 'Баланс между свободными весами и функциональностью.',
    workouts: [
      {
        name: 'Push (Микс)',
        exercises: [
          { name: 'Отжимания на брусьях', sets: 3, reps: '', weight: '' },
          { name: 'Жим гантелей стоя', sets: 3, reps: '', weight: '' },
          { name: 'Кроссовер', sets: 3, reps: '', weight: '' },
          { name: 'Французский жим', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Pull (Микс)',
        exercises: [
          { name: 'Тяга Т-грифа', sets: 3, reps: '', weight: '' },
          { name: 'Тяга гантели одной рукой', sets: 3, reps: '', weight: '' },
          { name: 'Лицевая тяга', sets: 3, reps: '', weight: '' },
          { name: 'Бицепс на скамье Скотта', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Legs (Микс)',
        exercises: [
          { name: 'Фронтальные приседания', sets: 3, reps: '', weight: '' },
          { name: 'Болгарские выпады', sets: 3, reps: '', weight: '' },
          { name: 'Гиперэкстензия', sets: 3, reps: '', weight: '' },
          { name: 'Икры сидя', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },

  // =======================================================
  // 2. UPPER / LOWER (Верх / Низ)
  // =======================================================
  {
    id: 'ul_classic',
    category: 'Верх / Низ',
    title: 'Вариант 1: Классика (Силовой акцент)',
    description: 'Базовые движения для всего тела.',
    workouts: [
      {
        name: 'Верх (База)',
        exercises: [
          { name: 'Жим штанги лежа', sets: 3, reps: '', weight: '' },
          { name: 'Тяга штанги в наклоне', sets: 3, reps: '', weight: '' },
          { name: 'Армейский жим', sets: 3, reps: '', weight: '' },
          { name: 'Подтягивания', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Низ (База)',
        exercises: [
          { name: 'Приседания со штангой', sets: 3, reps: '', weight: '' },
          { name: 'Румынская тяга', sets: 3, reps: '', weight: '' },
          { name: 'Жим ногами', sets: 3, reps: '', weight: '' },
          { name: 'Подъем ног в висе', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },
  {
    id: 'ul_dumbbell',
    category: 'Верх / Низ',
    title: 'Вариант 2: Гантельный акцент',
    description: 'Больше амплитуды и стабилизации.',
    workouts: [
      {
        name: 'Верх (Гантели)',
        exercises: [
          { name: 'Жим гантелей на наклонной', sets: 3, reps: '', weight: '' },
          { name: 'Тяга гантелей в наклоне (к поясу)', sets: 3, reps: '', weight: '' },
          { name: 'Жим Арнольда', sets: 3, reps: '', weight: '' },
          { name: 'Махи в стороны', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Низ (Гантели)',
        exercises: [
          { name: 'Приседания Гоблет', sets: 3, reps: '', weight: '' },
          { name: 'Мертвая тяга с гантелями', sets: 3, reps: '', weight: '' },
          { name: 'Зашагивания на тумбу', sets: 3, reps: '', weight: '' },
          { name: 'Планка', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },
  {
    id: 'ul_machine',
    category: 'Верх / Низ',
    title: 'Вариант 3: Изоляция (Тренажеры)',
    description: 'Безопасно для спины, акцент на памп.',
    workouts: [
      {
        name: 'Верх (Машины)',
        exercises: [
          { name: 'Жим в Смите', sets: 3, reps: '', weight: '' },
          { name: 'Тяга верхнего блока', sets: 3, reps: '', weight: '' },
          { name: 'Бабочка (Peck-Deck)', sets: 3, reps: '', weight: '' },
          { name: 'Тяга нижнего блока', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Низ (Машины)',
        exercises: [
          { name: 'Гакк-приседания', sets: 3, reps: '', weight: '' },
          { name: 'Сгибание ног сидя', sets: 3, reps: '', weight: '' },
          { name: 'Разгибание ног', sets: 3, reps: '', weight: '' },
          { name: 'Сведение/Разведение ног', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },

  // =======================================================
  // 3. СПЛИТЫ 3 ДНЯ (Разные вариации)
  // =======================================================
  {
    id: '3day_arnold',
    category: 'Сплит 3 дня',
    title: 'Сплит Арнольда (Антагонисты)',
    description: 'Грудь+Спина, Плечи+Руки, Ноги.',
    workouts: [
      {
        name: 'Грудь + Спина',
        exercises: [
          { name: 'Жим штанги лежа', sets: 3, reps: '', weight: '' },
          { name: 'Подтягивания широким хватом', sets: 3, reps: '', weight: '' },
          { name: 'Жим гантелей на наклонной', sets: 3, reps: '', weight: '' },
          { name: 'Тяга горизонтального блока', sets: 3, reps: '', weight: '' },
          { name: 'Пуловер', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Плечи + Руки',
        exercises: [
          { name: 'Армейский жим', sets: 3, reps: '', weight: '' },
          { name: 'Махи в стороны', sets: 3, reps: '', weight: '' },
          { name: 'Французский жим', sets: 3, reps: '', weight: '' },
          { name: 'Подъем штанги на бицепс', sets: 3, reps: '', weight: '' },
          { name: 'Молотки', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Ноги',
        exercises: [
          { name: 'Приседания со штангой', sets: 3, reps: '', weight: '' },
          { name: 'Выпады', sets: 3, reps: '', weight: '' },
          { name: 'Румынская тяга', sets: 3, reps: '', weight: '' },
          { name: 'Сгибание ног', sets: 3, reps: '', weight: '' },
          { name: 'Разгибание ног', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },
  {
    id: '3day_legs_focus',
    category: 'Сплит 3 дня',
    title: 'Низ / Верх / Низ (Квадрицепс/Бицепс бедра)',
    description: 'Общий акцент на ноги.',
    workouts: [
      {
        name: 'День 1: Низ (Тяжелый)',
        exercises: [
          { name: 'Приседания со штангой', sets: 3, reps: '', weight: '' },
          { name: 'Жим ногами', sets: 3, reps: '', weight: '' },
          { name: 'Румынская тяга', sets: 3, reps: '', weight: '' },
          { name: 'Ягодичный мостик', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'День 2: Весь Верх',
        exercises: [
          { name: 'Жим гантелей лежа', sets: 3, reps: '', weight: '' },
          { name: 'Тяга верхнего блока', sets: 3, reps: '', weight: '' },
          { name: 'Жим гантелей сидя', sets: 3, reps: '', weight: '' },
          { name: 'Тяга к поясу сидя', sets: 3, reps: '', weight: '' },
          { name: 'Бицепс + Трицепс', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'День 3: Низ (Объемный)',
        exercises: [
          { name: 'Выпады', sets: 3, reps: '', weight: '' },
          { name: 'Гакк-приседания', sets: 3, reps: '', weight: '' },
          { name: 'Сгибание ног', sets: 3, reps: '', weight: '' },
          { name: 'Разведение ног', sets: 3, reps: '', weight: '' },
          { name: 'Гиперэкстензия', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },
  // --- НОВЫЙ СПЛИТ ДЛЯ ЯГОДИЦ ---
  {
    id: '3day_glutes',
    category: 'Сплит 3 дня',
    title: 'Низ / Верх / Низ (Акцент Ягодицы)',
    description: 'Специализация на ягодичные мышцы (Glute Focus).',
    workouts: [
      {
        name: 'День 1: Ягодицы (Тяжелая/Мостик)',
        exercises: [
          { name: 'Ягодичный мостик со штангой', sets: 3, reps: '', weight: '' },
          { name: 'Румынская тяга (гантели)', sets: 3, reps: '', weight: '' },
          { name: 'Болгарские сплит-приседания', sets: 3, reps: '', weight: '' },
          { name: 'Отведение ноги в кроссовере', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'День 2: Верх (Тонус)',
        exercises: [
          { name: 'Жим гантелей сидя', sets: 3, reps: '', weight: '' },
          { name: 'Тяга верхнего блока', sets: 3, reps: '', weight: '' },
          { name: 'Отжимания от пола', sets: 3, reps: '', weight: '' },
          { name: 'Тяга гантели к поясу', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'День 3: Ягодицы (Памп/Изоляция)',
        exercises: [
          { name: 'Приседания Сумо (гантель)', sets: 3, reps: '', weight: '' },
          { name: 'Гиперэкстензия (с круглой спиной)', sets: 3, reps: '', weight: '' },
          { name: 'Жим ногами (высокая постановка)', sets: 3, reps: '', weight: '' },
          { name: 'Разведение ног в тренажере', sets: 3, reps: '', weight: '' },
          { name: 'Зашагивания на тумбу', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },

  // =======================================================
  // 4. FULL BODY (Все тело)
  // =======================================================
  {
    id: 'full_classic',
    category: 'Full Body',
    title: 'Вариант 1: Золотая пятерка',
    description: 'Только самые эффективные упражнения.',
    workouts: [
      {
        name: 'Full Body (База)',
        exercises: [
          { name: 'Приседания', sets: 3, reps: '', weight: '' },
          { name: 'Жим лежа', sets: 3, reps: '', weight: '' },
          { name: 'Тяга в наклоне', sets: 3, reps: '', weight: '' },
          { name: 'Армейский жим', sets: 3, reps: '', weight: '' },
          { name: 'Подтягивания', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },
  {
    id: 'full_ab_split',
    category: 'Full Body',
    title: 'Вариант 2: Чередование А/Б',
    description: 'Разные упражнения каждую тренировку.',
    workouts: [
      {
        name: 'Тренировка А',
        exercises: [
          { name: 'Приседания', sets: 3, reps: '', weight: '' },
          { name: 'Жим лежа', sets: 3, reps: '', weight: '' },
          { name: 'Тяга блока', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'Тренировка Б',
        exercises: [
          { name: 'Становая тяга', sets: 3, reps: '', weight: '' },
          { name: 'Жим стоя', sets: 3, reps: '', weight: '' },
          { name: 'Выпады', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  },
  {
    id: 'full_3day_var',
    category: 'Full Body',
    title: 'Вариант 3: 3 разных дня',
    description: 'Пн: Присед-акцент, Ср: Жим-акцент, Пт: Тяга-акцент.',
    workouts: [
      {
        name: 'День 1 (Присед)',
        exercises: [
          { name: 'Приседания', sets: 3, reps: '', weight: '' },
          { name: 'Жим гантелей', sets: 3, reps: '', weight: '' },
          { name: 'Тяга блока', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'День 2 (Жим)',
        exercises: [
          { name: 'Жим лежа', sets: 3, reps: '', weight: '' },
          { name: 'Выпады', sets: 3, reps: '', weight: '' },
          { name: 'Махи', sets: 3, reps: '', weight: '' }
        ]
      },
      {
        name: 'День 3 (Тяга)',
        exercises: [
          { name: 'Становая тяга', sets: 3, reps: '', weight: '' },
          { name: 'Брусья', sets: 3, reps: '', weight: '' },
          { name: 'Планка', sets: 3, reps: '', weight: '' }
        ]
      }
    ]
  }
];