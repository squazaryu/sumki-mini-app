import asyncio
from telegram import Bot
from config import BOT_TOKEN, SELLER_CHAT_ID

async def check_chat():
    try:
        bot = Bot(BOT_TOKEN)
        await bot.send_message(chat_id=SELLER_CHAT_ID, text="Тестовое сообщение от бота")
        print("Сообщение успешно отправлено!")
    except Exception as e:
        print(f"Ошибка при отправке сообщения: {e}")

if __name__ == "__main__":
    asyncio.run(check_chat())
