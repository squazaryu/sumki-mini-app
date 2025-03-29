import json
import logging
import asyncio
from telegram import Update, Message, User, Chat
from config import SELLER_CHAT_ID, BOT_TOKEN
from telegram import Bot

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

async def send_telegram_message(message, chat_id):
    """Отправляет сообщение в Telegram чат с повторными попытками"""
    max_retries = 3
    retry_delay = 2  # секунды
    
    for attempt in range(max_retries):
        try:
            await Bot(BOT_TOKEN).send_message(chat_id=chat_id, text=message)
            logger.info(f"Сообщение успешно отправлено в чат {chat_id}")
            return True
        except Exception as e:
            logger.error(f"Ошибка при отправке сообщения (попытка {attempt+1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
    
    logger.error(f"Не удалось отправить сообщение после {max_retries} попыток")
    return False

async def test_handle_mini_app_data():
    try:
        # Загружаем тестовые данные
        with open('test_data.json', 'r') as f:
            json_data = f.read()
        
        logger.info(f"Тестовые данные: {json_data}")
        
        # Создаем объекты для имитации Update
        user = User(id=12345, is_bot=False, first_name="Test")
        chat = Chat(id=12345, type="private")
        
        # Парсим JSON данные
        try:
            data = json.loads(json_data)
            logger.info(f"Успешно распарсили JSON данные: {data}")
        except json.JSONDecodeError as json_err:
            logger.error(f"Ошибка при разборе JSON: {json_err}")
            return
        
        # Формируем текст заказа
        order_text = "Новый заказ из мини-приложения (тест):\n\n"
        
        # Добавляем информацию о продукте
        if data.get('product') == 'bag':
            order_text += "Тип: Сумка\n"
            if data.get('size'):
                order_text += f"Размер: {data['size']}\n"
            if data.get('shape'):
                order_text += f"Форма: {data['shape']}\n"
        elif data.get('product') == 'coaster':
            order_text += "Тип: Подстаканник\n"
        else:
            order_text += "Тип: Индивидуальный заказ\n"
        
        # Добавляем остальные параметры
        if data.get('material'):
            order_text += f"Материал: {data['material']}\n"
        if data.get('color'):
            order_text += f"Цвет: {data['color']}\n"
        if data.get('options'):
            order_text += f"Дополнительные опции: {', '.join(data['options'])}\n"
        
        if data.get('customDescription'):
            order_text += f"Описание: {data['customDescription']}\n"
        
        # Добавляем контактные данные
        if data.get('contact'):
            contact = data['contact']
            order_text += "\nКонтактные данные:\n"
            if contact.get('phone_number'):
                order_text += f"Телефон: {contact['phone_number']}\n"
            if contact.get('username'):
                order_text += f"Username: @{contact['username']}\n"
            if contact.get('first_name'):
                order_text += f"Имя: {contact['first_name']}\n"
            if contact.get('last_name'):
                order_text += f"Фамилия: {contact['last_name']}\n"
            if contact.get('id'):
                order_text += f"ID: {contact['id']}\n"
        
        # Логируем сформированный текст заказа
        logger.info(f"Сформирован текст заказа: {order_text}")
        
        # Отправляем заказ в чат продавца
        logger.info(f"Отправка заказа в чат продавца {SELLER_CHAT_ID}")
        sent = await send_telegram_message(order_text, SELLER_CHAT_ID)
        
        if sent:
            logger.info(f"Заказ успешно отправлен в чат продавца")
        else:
            logger.error("Не удалось отправить заказ в чат продавца")
            
    except Exception as e:
        logger.error(f"Общая ошибка при тестировании: {e}")
        import traceback
        logger.error(f"Трассировка: {traceback.format_exc()}")

if __name__ == "__main__":
    asyncio.run(test_handle_mini_app_data()) 