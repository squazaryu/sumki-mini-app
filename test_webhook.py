#!/usr/bin/env python3
"""
Скрипт для имитации отправки данных от мини-приложения боту.
Этот скрипт создает POST-запрос к боту, имитирующий сообщение от Telegram с данными мини-приложения.
"""

import json
import asyncio
import logging
from config import BOT_TOKEN
import uuid
from telegram import Bot, Update, Message, Chat, User

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Тестовые данные, имитирующие заказ из мини-приложения
TEST_ORDER_DATA = {
    "product": "bag",
    "size": "M",
    "shape": "круглая",
    "material": "акрил",
    "color": "розовый",
    "options": ["застежка", "подклад"],
    "contact": {
        "id": 12345678,
        "first_name": "Тест",
        "last_name": "Пользователь",
        "username": "testuser"
    }
}

async def send_test_webhook():
    """Отправляет тестовый вебхук, имитирующий данные от мини-приложения"""
    try:
        # Создаем экземпляр бота для отправки сообщений
        bot = Bot(token=BOT_TOKEN)
        
        # ID пользователя, от имени которого отправляем сообщение
        user_id = 12345678
        
        # Имитируем обновление Telegram, создание реалистичного объекта Update
        # Для теста будем имитировать текстовое сообщение с JSON данными
        
        logger.info(f"Подготовка тестовых данных: {TEST_ORDER_DATA}")
        json_data = json.dumps(TEST_ORDER_DATA)
        logger.info(f"JSON данные: {json_data}")
        
        # Отправляем сообщение самому боту для тестирования
        me = await bot.get_me()
        chat_id = me.id
        
        logger.info(f"Отправка тестового сообщения боту {me.username} (ID: {chat_id})...")
        
        # Отправляем JSON данные напрямую боту
        # Примечание: боты не могут отправлять сообщения другим ботам,
        # поэтому этот метод может не сработать
        try:
            message = await bot.send_message(chat_id=chat_id, text=json_data)
            logger.info(f"Сообщение успешно отправлено! ID сообщения: {message.message_id}")
        except Exception as e:
            logger.error(f"Ошибка при отправке сообщения боту: {e}")
            logger.info("Использую альтернативный метод...")
            
            # Можем попробовать отправить сообщение в чат пользователя или другой чат
            test_user_id = 50122963  # ID вашего тестового пользователя
            try:
                message = await bot.send_message(chat_id=test_user_id, text=json_data)
                logger.info(f"Сообщение успешно отправлено пользователю {test_user_id}!")
            except Exception as e2:
                logger.error(f"Ошибка при отправке сообщения пользователю: {e2}")
        
        logger.info("Тестовый вебхук успешно обработан")
        
    except Exception as e:
        logger.error(f"Произошла ошибка: {e}")

if __name__ == "__main__":
    asyncio.run(send_test_webhook()) 