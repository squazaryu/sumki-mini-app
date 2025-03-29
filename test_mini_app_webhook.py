#!/usr/bin/env python3
"""
Скрипт для прямого вызова API бота с данными заказа из мини-приложения.
"""

import json
import requests
import logging
from config import BOT_TOKEN

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ID продавца (получателя заказа)
SELLER_CHAT_ID = "50122963"

# Тестовый заказ из мини-приложения
order_data = {
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

def send_order_directly_to_bot():
    """Отправляет заказ напрямую боту через API Telegram"""
    try:
        logger.info("Начинаем отправку заказа через API Telegram...")
        
        # Формируем текст сообщения для заказа
        order_text = "🛍️ *Тестовый заказ из мини-приложения*\n\n"
        
        # Добавляем основные детали заказа
        if order_data.get('product') == 'bag':
            order_text += "*Тип:* Сумка\n"
            if order_data.get('size'): order_text += f"*Размер:* {order_data['size']}\n"
            if order_data.get('shape'): order_text += f"*Форма:* {order_data['shape']}\n"
        elif order_data.get('product') == 'coaster':
            order_text += "*Тип:* Подстаканник\n"
        else:
            order_text += "*Тип:* Индивидуальный заказ\n"
        
        if order_data.get('material'): order_text += f"*Материал:* {order_data['material']}\n"
        if order_data.get('color'): order_text += f"*Цвет:* {order_data['color']}\n"
        
        if order_data.get('options') and order_data['options']:
            order_text += f"*Опции:* {', '.join(order_data['options'])}\n"
        
        if order_data.get('customDescription'):
            order_text += f"\n*Описание:* {order_data['customDescription']}\n"
        
        # Добавляем информацию о пользователе
        order_text += "\n*Контактные данные:*\n"
        if order_data.get('contact'):
            contact = order_data['contact']
            if contact.get('username'): order_text += f"Username: @{contact['username']}\n"
            if contact.get('first_name'): order_text += f"Имя: {contact['first_name']}\n"
            if contact.get('last_name'): order_text += f"Фамилия: {contact['last_name']}\n"
            if contact.get('id'): order_text += f"ID: {contact['id']}\n"
        
        # Формируем URL API для отправки сообщения
        api_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        
        # Параметры запроса
        params = {
            "chat_id": SELLER_CHAT_ID,
            "text": order_text,
            "parse_mode": "Markdown"
        }
        
        # Отправляем запрос
        logger.info(f"Отправляем запрос к API: {api_url}")
        response = requests.post(api_url, json=params)
        
        # Проверяем ответ
        if response.status_code == 200:
            result = response.json()
            if result.get("ok"):
                logger.info("Сообщение успешно отправлено!")
                logger.info(f"Ответ API: {result}")
                return True
            else:
                logger.error(f"API вернул ошибку: {result}")
                return False
        else:
            logger.error(f"Ошибка HTTP: {response.status_code}")
            logger.error(f"Ответ: {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"Произошла ошибка: {e}")
        import traceback
        logger.error(f"Трассировка: {traceback.format_exc()}")
        return False

def test_webhook_payload():
    """Имитирует отправку вебхука с данными от мини-приложения"""
    try:
        logger.info("Тестируем отправку данных через вебхук...")
        
        # Серверный URL бота (нужно заменить на фактический URL)
        webhook_url = "https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        
        # Данные для вебхука - имитация сообщения с данными из mini app
        webhook_data = {
            "update_id": 123456789,
            "message": {
                "message_id": 123,
                "from": {
                    "id": 12345678,
                    "is_bot": False,
                    "first_name": "Test",
                    "username": "testuser",
                    "language_code": "ru"
                },
                "chat": {
                    "id": 12345678,
                    "first_name": "Test",
                    "username": "testuser",
                    "type": "private"
                },
                "date": 1613826000,
                "text": json.dumps(order_data)  # Отправляем JSON с данными заказа
            }
        }
        
        # Отправляем POST-запрос на вебхук
        logger.info(f"Отправляем запрос на вебхук: {webhook_url}")
        response = requests.post(webhook_url, json=webhook_data)
        
        # Проверяем ответ
        if response.status_code == 200:
            logger.info("Вебхук успешно отправлен!")
            logger.info(f"Ответ: {response.text}")
            return True
        else:
            logger.error(f"Ошибка HTTP: {response.status_code}")
            logger.error(f"Ответ: {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"Произошла ошибка: {e}")
        import traceback
        logger.error(f"Трассировка: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    logger.info("Запуск скрипта тестирования отправки заказа...")
    send_order_directly_to_bot() 