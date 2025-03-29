#!/bin/bash

# Перейти в директорию с ботом
cd "$(dirname "$0")"

# Активировать виртуальное окружение (если оно есть)
if [ -d ".venv" ]; then
    echo "Активация виртуального окружения..."
    source .venv/bin/activate
else
    echo "Предупреждение: Виртуальное окружение .venv не найдено."
fi

# Проверить, не запущен ли уже бот (ищем процесс, запущенный ИЗ ЭТОГО окружения)
# Используем полный путь к python из venv
PYTHON_EXEC=".venv/bin/python"
if [ ! -f "$PYTHON_EXEC" ]; then
    PYTHON_EXEC=$(which python3) # Используем системный python3, если venv нет
    echo "Используется системный python: $PYTHON_EXEC"
else
    echo "Используется python из venv: $PYTHON_EXEC"
fi

BOT_PID=$(pgrep -f "$PYTHON_EXEC doraborka.py")
if [ -n "$BOT_PID" ]; then
    echo "Бот уже запущен с PID: $BOT_PID (используя $PYTHON_EXEC)"
    # Деактивировать окружение, если активировали
    if [[ "$VIRTUAL_ENV" != "" ]]; then deactivate; fi
    exit 0
fi

# Запустить бота в фоновом режиме с использованием python из venv
echo "Запуск бота с использованием $PYTHON_EXEC..."
nohup $PYTHON_EXEC doraborka.py > bot.log 2>&1 &

# Проверить, что бот запустился
sleep 2
BOT_PID=$(pgrep -f "$PYTHON_EXEC doraborka.py")
if [ -n "$BOT_PID" ]; then
    echo "Бот успешно запущен с PID: $BOT_PID"
else
    echo "Ошибка при запуске бота. Проверьте лог-файл bot.log"
fi

# Деактивировать окружение, если активировали
if [[ "$VIRTUAL_ENV" != "" ]]; then
    deactivate
fi 