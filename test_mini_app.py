import asyncio
import json
from telegram import Bot
from config import BOT_TOKEN

async def send_test_data():
    try:
        # Тестовые данные заказа
        test_data = {
            "product": "bag",
            "size": "M",
            "shape": "круглая",
            "material": "акрил",
            "color": "розовый",
            "options": ["застежка", "подклад"],
            "contact": {
                "id": 12345678,
                "first_name": "Test",
                "last_name": "User",
                "username": "testuser"
            }
        }
        
        json_data = json.dumps(test_data)
        
        # Укажите здесь ID вашего бота
        bot_chat_id = "7408506728" 
        
        bot = Bot(BOT_TOKEN)
        message = await bot.send_message(chat_id=bot_chat_id, text=json_data)
        print(f"Сообщение с тестовыми данными отправлено: {json_data}")
    except Exception as e:
        print(f"Ошибка при отправке тестовых данных: {e}")

if __name__ == "__main__":
    asyncio.run(send_test_data()) 