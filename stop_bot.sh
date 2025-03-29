#!/bin/bash

# --- Определение python --- 
# Используем полный путь к python из venv, если он есть
PYTHON_EXEC=".venv/bin/python"
if [ ! -f "$PYTHON_EXEC" ]; then
    PYTHON_EXEC=$(which python3) # Используем системный python3, если venv нет
    echo "Stop: Используется системный python: $PYTHON_EXEC"
else
    echo "Stop: Используется python из venv: $PYTHON_EXEC"
fi
# ------------------------

# Найти PID бота, используя правильный python
BOT_PID=$(pgrep -f "$PYTHON_EXEC doraborka.py")
if [ -z "$BOT_PID" ]; then
    echo "Бот не запущен"
    exit 0
fi

# Остановить бота
echo "Остановка бота с PID: $BOT_PID (используя $PYTHON_EXEC)"
kill $BOT_PID

# Проверить, остановился ли бот
sleep 2
BOT_PID=$(pgrep -f "$PYTHON_EXEC doraborka.py")
if [ -z "$BOT_PID" ]; then
    echo "Бот успешно остановлен"
else
    echo "Не удалось остановить бота. Попробуйте принудительно: kill -9 $BOT_PID"
fi 