import os
from dotenv import load_dotenv

# Загрузка переменных из .env файла
load_dotenv()

# Токен бота
BOT_TOKEN = os.getenv('TELEGRAM_TOKEN', '7408506728:AAGK9d5kddSnMQDwgIYOiEK-6nPFFwgYP-M')

# ID администраторов (список строк)
# Сначала пробуем загрузить из переменных окружения, если нет - используем жестко заданное значение
admin_id_env = os.getenv('ADMIN_ID', '50122963')
# Разделяем по запятой, если это список, и обеспечиваем, что все элементы - строки
ADMIN_IDS = [str(id_val.strip()) for id_val in admin_id_env.split(',')]
print(f"ADMIN_IDS настроены: {ADMIN_IDS}")

# ID чата продавца (для отправки заказов)
SELLER_CHAT_ID = os.getenv('SELLER_CHAT_ID', '50122963')
print(f"SELLER_CHAT_ID настроен: {SELLER_CHAT_ID}")

# Группа администраторов для отправки сообщений
ADMIN_GROUP_ID = os.getenv('ADMIN_GROUP_ID', SELLER_CHAT_ID)
print(f"ADMIN_GROUP_ID настроен: {ADMIN_GROUP_ID}")

# Максимальный размер фото в байтах (5MB)
MAX_PHOTO_SIZE = 5 * 1024 * 1024

# Максимальное количество фото на заказ
MAX_PHOTOS_PER_ORDER = 5

# Таймауты для API Telegram
TIMEOUTS = {
    'read': 30,
    'write': 30,
    'connect': 30,
    'pool': 30
}

# Сообщения бота
MESSAGES = {
    'welcome': 'Добро пожаловать в VaMi Bags - магазин изделий из бусин! Для оформления заказа нажмите кнопку одну из кнопок ниже.',
    'order_cancelled': 'Ваш заказ был отменен. Чтобы начать снова, нажмите "Оформить заказ".',
    'order_preview': 'Предпросмотр вашего заказа:',
    'request_contact': 'Для завершения заказа, нам нужен ваш контакт.',
    'contact_button': 'Нажмите кнопку ниже, чтобы поделиться своим номером телефона:',
    'contact_received': 'Спасибо! Ваш заказ успешно отправлен. Мы свяжемся с вами в ближайшее время.',
    'error_photo_size': 'Фото слишком большое. Максимальный размер - 5MB.',
    'error_photo_count': 'Достигнуто максимальное количество фото (5).',
    'admin_help': 'Команды администратора:\n/orders - список всех заказов\n/status <id> <статус> - изменить статус заказа\n/note <id> <текст> - добавить заметку к заказу',
    'access_denied': 'Доступ запрещен. Вы не являетесь администратором.'
} 