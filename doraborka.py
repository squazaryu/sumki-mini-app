import logging
import os
import sys
import time
import json
from telegram import Bot, Update, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove, InputMediaPhoto, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from telegram.ext import Application, ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes, ConversationHandler, CallbackQueryHandler
from telegram.error import Conflict, TimedOut, NetworkError
from better_profanity import Profanity
from config import *
from database import Database
from menu import get_menu_commands
import asyncio

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    filename='bot.log'
)
logger = logging.getLogger(__name__)

# Инициализация фильтра нецензурной лексики
profanity = Profanity()
profanity.load_censor_words()

# Определение этапов
PRODUCT, SIZE, SHAPE, MATERIAL, COLOR, OPTIONS, CONTACT, ORDER, PREVIEW = range(9)

class SumkiBot:
    def __init__(self):
        self.user_data = {}
        self.stages = ['start', 'choose_product', 'choose_size', 'choose_shape', 'choose_material', 'choose_color', 'choose_options', 'contact', 'order', 'preview']
        self.state_history = {}
        self.db = Database()

    async def initialize_db(self, application: ApplicationBuilder):
        """Асинхронно инициализирует базу данных (принимает application от post_init)."""
        await self.db.initialize()

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id] = []
        context.user_data['stage'] = 'start'
        keyboard = ReplyKeyboardMarkup([
            ["Оформить заказ"],
            ["Заказать через приложение"]
        ], resize_keyboard=True)
        await update.message.reply_text(MESSAGES['welcome'], reply_markup=keyboard)

    async def cancel_order(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Отмена текущего заказа"""
        user_id = update.message.from_user.id
        context.user_data.clear()
        self.state_history[user_id] = []
        keyboard = ReplyKeyboardMarkup([["Оформить заказ"]], resize_keyboard=True)
        await update.message.reply_text(MESSAGES['order_cancelled'], reply_markup=keyboard)
        return ConversationHandler.END

    async def show_order_preview(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Показывает предпросмотр заказа"""
        user_id = update.message.from_user.id
        self.state_history[user_id].append('preview')
        context.user_data['stage'] = 'preview'

        # Формируем текст предпросмотра
        preview_text = MESSAGES['order_preview'] + "\n\n"
        
        if context.user_data.get('product') == "Нестандартный заказ":
            preview_text += f"Тип заказа: Нестандартный\n"
            preview_text += f"Описание: {context.user_data.get('custom_description', 'Не указано')}\n"
            if 'custom_photo_id' in context.user_data:
                preview_text += "Фотографии: Прикреплены\n"
        else:
            preview_text += f"Продукт: {context.user_data.get('product', 'Не указан')}\n"
            if context.user_data.get('product') == "Сумка":
                preview_text += f"Размер: {context.user_data.get('size', 'Не указан')}\n"
                preview_text += f"Форма: {context.user_data.get('shape', 'Не указана')}\n"
            preview_text += (
                f"Материал бусин: {context.user_data.get('material', 'Не указан')}\n"
                f"Цвет: {context.user_data.get('color', 'Не указан')}\n"
                f"Дополнительные опции: {', '.join(context.user_data.get('options', ['Не указаны']))}\n"
            )

        # Создаем клавиатуру для подтверждения/отмены
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("Подтвердить", callback_data="confirm_order"),
                InlineKeyboardButton("Отменить", callback_data="cancel_order")
            ]
        ])

        # Отправляем предпросмотр
        await update.message.reply_text(preview_text, reply_markup=keyboard)

    async def handle_preview_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обрабатывает нажатия кнопок в предпросмотре заказа"""
        query = update.callback_query
        await query.answer()

        if query.data == "confirm_order":
            await query.message.reply_text(MESSAGES['request_contact'])
            keyboard = ReplyKeyboardMarkup([[KeyboardButton("Поделиться контактом", request_contact=True)]], resize_keyboard=True)
            await query.message.reply_text(MESSAGES['contact_button'], reply_markup=keyboard)
            context.user_data['stage'] = 'contact'
        elif query.data == "cancel_order":
            await self.cancel_order(update, context)

    async def choose_product(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_product')
        context.user_data['stage'] = 'choose_product'
        keyboard = ReplyKeyboardMarkup([
            ["Сумка", "Подстаканник"],
            ["Нестандартный заказ"]
        ], resize_keyboard=True)
        await update.message.reply_text("Какой продукт вы хотите заказать?", reply_markup=keyboard)

    async def choose_bag_size(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_size')
        context.user_data['stage'] = 'choose_size'
        keyboard = ReplyKeyboardMarkup([
            ["S (микросумка)"], 
            ["M (влезает телефон и картхолдер)"],
            ["L (на 5 см больше размера M)"],
            ["Назад"]
        ], resize_keyboard=True)
        await update.message.reply_text("Пожалуйста, выберите размер сумки:", reply_markup=keyboard)

    async def choose_bag_shape(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_shape')
        context.user_data['stage'] = 'choose_shape'
        keyboard = ReplyKeyboardMarkup([
            ["Круглая", "Прямоугольная"],
            ["Трапеция", "Квадратная"],
            ["Месяц", "Сердце"],
            ["Назад"]
        ], resize_keyboard=True)
        
        # Отправка фотографий
        photo_files = {
            "Круглая": "/Users/tumowuh/Desktop/Telebot/bag_shapes/krug.jpeg",
            "Прямоугольная": "/Users/tumowuh/Desktop/Telebot/bag_shapes/pramougolnaya.jpeg",
            "Трапеция": "/Users/tumowuh/Desktop/Telebot/bag_shapes/trapeciya.jpeg",
            "Квадратная": "/Users/tumowuh/Desktop/Telebot/bag_shapes/kvadrat.jpeg",
            "Месяц": "/Users/tumowuh/Desktop/Telebot/bag_shapes/mesyac.jpeg",
            "Сердце": "/Users/tumowuh/Desktop/Telebot/bag_shapes/serdce.jpeg"
        }
        
        # Подготовка медиа-группы
        success = False
        media_group = []
        try:
            for shape_name, photo_path in photo_files.items():
                if os.path.exists(photo_path):
                    try:
                        with open(photo_path, 'rb') as photo_file:
                            photo_bytes = photo_file.read()
                            media_group.append(InputMediaPhoto(media=photo_bytes, caption=shape_name))
                            logger.info(f"Фото {shape_name} успешно добавлено в медиагруппу")
                    except Exception as e:
                        logger.error(f"Ошибка при открытии или чтении файла {photo_path}: {e}")
                else:
                    logger.error(f"Файл не найден: {photo_path}")
            
            if media_group:
                await context.bot.send_media_group(chat_id=user_id, media=media_group)
                success = True
                logger.info("Медиагруппа форм успешно отправлена")
            else:
                logger.error("Не удалось подготовить ни одной фотографии форм.")
                
        except Exception as e:
            logger.error(f"Ошибка при подготовке или отправке медиагруппы форм: {e}")

        # Отправляем сообщение с информацией о доступных формах
        await update.message.reply_text(
            "Выберите форму сумки:\n\n" + 
            ("Фотографии доступных форм отправлены выше." if success else "К сожалению, не удалось отобразить фотографии форм."), 
            reply_markup=keyboard
        )

    async def choose_bag_material(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_material')
        context.user_data['stage'] = 'choose_material'
        keyboard = ReplyKeyboardMarkup([
            ["Акрил"],
            ["Хрусталь", "Swarovski"],
            ["Назад"]
        ], resize_keyboard=True)
        
        # Отправка фотографий
        photos = [
            "/Users/tumowuh/Desktop/Telebot/akril.jpeg",
            "/Users/tumowuh/Desktop/Telebot/hrust.jpeg",
            "/Users/tumowuh/Desktop/Telebot/swarovski.jpeg"
        ]
        
        media_group = []
        try:
            for photo_path in photos:
                if os.path.exists(photo_path):
                    try:
                        with open(photo_path, 'rb') as photo_file:
                            photo_bytes = photo_file.read()
                            media_group.append(InputMediaPhoto(media=photo_bytes))
                    except Exception as e:
                        logger.error(f"Ошибка при открытии или чтении файла материала {photo_path}: {e}")
                else:
                    logger.error(f"Файл материала не найден: {photo_path}")
            
            if media_group:
                await context.bot.send_media_group(chat_id=user_id, media=media_group)
                logger.info("Медиагруппа материалов успешно отправлена")
            else:
                await update.message.reply_text("Не удалось найти фотографии материалов для отображения.")
                logger.error("Не удалось подготовить ни одной фотографии материалов для отправки")
                
        except (TimedOut, NetworkError) as e:
            logger.error(f"Ошибка при отправке медиагруппы материалов: {e}")
            await update.message.reply_text("Произошла ошибка при отправке фотографий материалов. Пожалуйста, продолжите выбор.")
        except Exception as e:
            logger.error(f"Общая ошибка при обработке фотографий материалов: {e}")
            await update.message.reply_text("Произошла неизвестная ошибка при показе фотографий материалов.")
        
        await update.message.reply_text("Выберите материал бусин:", reply_markup=keyboard)

    async def choose_bag_color(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_color')
        context.user_data['stage'] = 'choose_color'
        keyboard = ReplyKeyboardMarkup([
            ["Белый", "Чёрный"],
            ["Синий", "Зелёный"],
            ["Назад"]
        ], resize_keyboard=True)
        await update.message.reply_text("Выберите цвет сумки:", reply_markup=keyboard)

    async def choose_options(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('choose_options')
        context.user_data['stage'] = 'choose_options'
        
        product = context.user_data.get('product')
        if product == "Сумка":
            keyboard = ReplyKeyboardMarkup([
                ["Застёжка", "Подклад"],
                ["Ручка-цепочка"],
                ["Назад", "Завершить выбор"]
            ], resize_keyboard=True)
        elif product == "Подстаканник":
            keyboard = ReplyKeyboardMarkup([
                ["Короткая ручка", "Ручка-цепочка"],
                ["Назад", "Завершить выбор"]
            ], resize_keyboard=True)
        else:
            keyboard = ReplyKeyboardMarkup([
                ["Назад", "Завершить выбор"]
            ], resize_keyboard=True)
        
        await update.message.reply_text("Выберите дополнительные опции:", reply_markup=keyboard)

    async def check_text_content(self, text):
        """Проверяет текст на наличие непристойного содержания"""
        try:
            # Проверяем текст на непристойности
            return not profanity.contains_profanity(text)
        except Exception as e:
            logger.error(f"Ошибка при проверке текста: {e}")
            return True  # В случае ошибки пропускаем проверку

    async def handle_custom_order(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('custom_order')
        context.user_data['stage'] = 'custom_order'
        context.user_data['product'] = "Нестандартный заказ"
        keyboard = ReplyKeyboardMarkup([["Назад"]], resize_keyboard=True)
        await update.message.reply_text(
            "Пожалуйста, опишите ваш заказ в свободной форме. "
            "Вы можете приложить фото-пример на следующем шаге, если он у вас есть. "
            "После описания нажмите прикрепите фото и нажмите 'Завершить описание'.",
            reply_markup=keyboard
        )

    async def handle_custom_order_description(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if update.message.text == "Назад":
            await self.go_back(update, context)
            return
            
        if update.message.text == "Завершить описание":
            await self.request_contact(update, context)
        else:
            # Проверяем текст на непристойности
            if not await self.check_text_content(update.message.text):
                await update.message.reply_text(
                    "Извините, но ваше сообщение содержит неприемлемый контент. "
                    "Пожалуйста, переформулируйте ваш запрос.",
                    reply_markup=ReplyKeyboardMarkup([["Назад"]], resize_keyboard=True)
                )
                return

            context.user_data['custom_description'] = update.message.text
            keyboard = ReplyKeyboardMarkup([["Завершить описание", "Назад"]], resize_keyboard=True)
            await update.message.reply_text(
                "Описание сохранено. Вы можете добавить фото или завершить описание.",
                reply_markup=keyboard
            )

    async def handle_custom_order_photo(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if update.message.text == "Назад":
            await self.go_back(update, context)
            return
            
        # Проверяем размер фото
        photo = update.message.photo[-1]
        if photo.file_size > MAX_PHOTO_SIZE:
            await update.message.reply_text(MESSAGES['error_photo_size'])
            return

        # Проверяем количество фото
        photos = context.user_data.get('custom_photos', [])
        if len(photos) >= MAX_PHOTOS_PER_ORDER:
            await update.message.reply_text(MESSAGES['error_photo_count'])
            return

        photos.append(photo.file_id)
        context.user_data['custom_photos'] = photos
        context.user_data['custom_photo_id'] = photo.file_id

        keyboard = ReplyKeyboardMarkup([["Завершить описание", "Назад"]], resize_keyboard=True)
        await update.message.reply_text(
            f"Фото сохранено ({len(photos)}/{MAX_PHOTOS_PER_ORDER}). Вы можете добавить ещё фото или завершить описание.",
            reply_markup=keyboard
        )

    async def handle_input(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        stage = context.user_data.get('stage', 'start')
        user_input = update.message.text

        if user_input == "Назад":
            await self.go_back(update, context)
            return

        if user_input == "Отменить заказ":
            await self.cancel_order(update, context)
            return

        if stage == 'start' and user_input == "Оформить заказ":
            await self.choose_product(update, context)
        elif stage == 'choose_product':
            if user_input == "Нестандартный заказ":
                await self.handle_custom_order(update, context)
            else:
                context.user_data['product'] = user_input
                if user_input == "Сумка":
                    await self.choose_bag_size(update, context)
                elif user_input == "Подстаканник":
                    await self.choose_bag_material(update, context)
        elif stage == 'custom_order':
            if update.message.photo:
                await self.handle_custom_order_photo(update, context)
            else:
                await self.handle_custom_order_description(update, context)
        elif stage == 'choose_size':
            context.user_data['size'] = user_input
            await self.choose_bag_shape(update, context)
        elif stage == 'choose_shape':
            context.user_data['shape'] = user_input
            await self.choose_bag_material(update, context)
        elif stage == 'choose_material':
            context.user_data['material'] = user_input
            await self.choose_bag_color(update, context)
        elif stage == 'choose_color':
            context.user_data['color'] = user_input
            await self.choose_options(update, context)
        elif stage == 'choose_options':
            if user_input == "Завершить выбор":
                await self.show_order_preview(update, context)
            else:
                # Обработка дополнительных опций только на этапе выбора опций
                options = context.user_data.get('options', [])
                if user_input not in ["Назад", "Завершить выбор"]:  # Проверяем, что это не служебная команда
                    options.append(user_input)
                    context.user_data['options'] = options
                    await update.message.reply_text(f"Опция '{user_input}' добавлена. Выберите ещё или нажмите 'Завершить выбор'.")

    async def go_back(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        if user_id in self.state_history and len(self.state_history[user_id]) > 1:
            # Удаляем текущее состояние
            self.state_history[user_id].pop()
            # Получаем предыдущее состояние
            previous_state = self.state_history[user_id].pop()
            if previous_state == 'start':
                await self.start(update, context)
            elif previous_state == 'choose_product':
                await self.choose_product(update, context)
            elif previous_state == 'choose_size':
                await self.choose_bag_size(update, context)
            elif previous_state == 'choose_shape':
                await self.choose_bag_shape(update, context)
            elif previous_state == 'choose_material':
                await self.choose_bag_material(update, context)
            elif previous_state == 'choose_color':
                await self.choose_bag_color(update, context)
            elif previous_state == 'choose_options':
                await self.choose_options(update, context)
            elif previous_state == 'custom_order':
                await self.handle_custom_order(update, context)
        else:
            await update.message.reply_text('No previous state found.')
            return ConversationHandler.END

    async def request_contact(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.message.from_user.id
        self.state_history[user_id].append('contact')
        context.user_data['stage'] = 'contact'
        keyboard = ReplyKeyboardMarkup([[KeyboardButton("Поделиться контактом", request_contact=True)]], resize_keyboard=True)
        await update.message.reply_text("Пожалуйста, поделитесь своим контактом, чтобы мы могли с вами связаться.", reply_markup=keyboard)

    async def contact_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        contact = update.message.contact
        context.user_data['contact'] = contact.phone_number
        await update.message.reply_text("Благодарим за заказ!", reply_markup=ReplyKeyboardRemove())
        await self.send_order(update, context)

    async def send_order(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        if context.user_data.get('product') == "Нестандартный заказ":
            order = (
                f"Нестандартный заказ от {update.effective_user.username}:\n"
                f"Описание: {context.user_data.get('custom_description', 'Не указано')}\n"
            )
            if 'custom_photo_id' in context.user_data:
                order += "Фотография прикреплена\n"
        else:
            order = (
                f"Заказ от {update.effective_user.username}:\n"
                f"Продукт: {context.user_data.get('product', 'Не указан')}\n"
            )
            if context.user_data.get('product') == "Сумка":
                order += f"Размер: {context.user_data.get('size', 'Не указан')}\n"
                order += f"Форма: {context.user_data.get('shape', 'Не указана')}\n"
            order += (
                f"Материал бусин: {context.user_data.get('material', 'Не указан')}\n"
                f"Цвет: {context.user_data.get('color', 'Не указан')}\n"
                f"Дополнительные опции: {', '.join(context.user_data.get('options', ['Не указаны']))}"
            )
        
        # Сохраняем заказ в базу данных
        order_id = await self.db.add_order(
            update.effective_user.id,
            update.effective_user.username,
            context.user_data
        )
        
        if order_id:
            order = f"Заказ #{order_id}\n{order}"
        
        # Отправляем сообщение с заказом в личный чат продавца
        contact = context.user_data.get('contact', 'Не указан')
        order_with_contact = f"{order}\nКонтакт: {contact}"
        
        try:
            await self.send_telegram_message(order_with_contact, SELLER_CHAT_ID)
            
            # Если есть фотографии, отправляем их отдельно
            if 'custom_photos' in context.user_data:
                for photo_id in context.user_data['custom_photos']:
                    await context.bot.send_photo(chat_id=SELLER_CHAT_ID, photo=photo_id)
            
            # Отправляем сообщение с благодарностью
            chat_id = update.effective_user.id
            await context.bot.send_message(chat_id=chat_id, text=MESSAGES['contact_received'])
            logger.info(f"Заказ #{order_id} успешно отправлен")
            
            # Отправляем сообщение о возможности оформить дополнительный заказ
            keyboard = ReplyKeyboardMarkup([["Оформить заказ"]], resize_keyboard=True)
            await context.bot.send_message(chat_id=chat_id, text="Для оформления дополнительного заказа нажмите на кнопку ниже:", reply_markup=keyboard)
            
        except Exception as e:
            logger.error(f"Ошибка при отправке заказа: {e}")
            await update.message.reply_text("Произошла ошибка при отправке заказа. Пожалуйста, попробуйте позже.")
        
        # Очищаем данные заказа
        context.user_data.clear()
        context.user_data['stage'] = 'start'

    async def send_telegram_message(self, message, chat_id):
        """Отправляет сообщение в Telegram чат с повторными попытками"""
        max_retries = 3
        retry_delay = 2  # секунды
        
        for attempt in range(max_retries):
            try:
                await Bot(BOT_TOKEN).send_message(chat_id=chat_id, text=message)
                logger.info(f"Сообщение успешно отправлено в чат {chat_id}")
                return True
            except TimedOut:
                logger.warning(f"Тайм-аут при отправке сообщения (попытка {attempt+1}/{max_retries})")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
            except NetworkError as e:
                logger.warning(f"Сетевая ошибка при отправке сообщения (попытка {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
            except Exception as e:
                logger.error(f"Неизвестная ошибка при отправке сообщения: {e}")
                break
        
        logger.error(f"Не удалось отправить сообщение после {max_retries} попыток")
        return False

    # Обработчик ошибок
    async def error_handler(self, update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Обрабатывает и логирует ошибки."""
        logger.error(f"Произошла ошибка: {context.error}")
        
        if isinstance(context.error, Conflict):
            logger.error("Обнаружен конфликт: возможно, запущено несколько экземпляров бота")
        elif isinstance(context.error, TimedOut):
            logger.error("Истекло время ожидания ответа от Telegram API")
        
        # Если произошла критическая ошибка, можно перезапустить бота
        # time.sleep(5)  # Ждем немного перед перезапуском
        # os.execv(sys.executable, [sys.executable] + sys.argv)

    def is_admin(self, user_id):
        """Проверяет, является ли пользователь администратором"""
        user_id_str = str(user_id)
        logger.info(f"Проверка администратора. Запрашиваемый ID: {user_id_str}")
        logger.info(f"Список админов: {ADMIN_IDS}")
        
        # Сравниваем строки (не числа)
        if user_id_str in ADMIN_IDS:
            logger.info(f"ID {user_id_str} найден в списке администраторов")
            return True
        else:
            logger.info(f"ID {user_id_str} НЕ найден в списке администраторов")
            return False

    async def admin_help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Показывает справку по админ-командам"""
        user_id = update.effective_user.id
        logger.info(f"Запрос админ-помощи от пользователя с ID: {user_id}")
        
        if not self.is_admin(user_id):
            logger.warning(f"Отказано в доступе для ID: {user_id}")
            await update.message.reply_text(MESSAGES['access_denied'])
            return
            
        logger.info(f"Доступ разрешен для ID: {user_id}")
        await update.message.reply_text(MESSAGES['admin_help'])

    async def admin_orders(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Показывает список всех заказов"""
        if not self.is_admin(update.effective_user.id):
            await update.message.reply_text(MESSAGES['access_denied'])
            return

        orders = await self.db.get_all_orders()
        if not orders:
            await update.message.reply_text("Нет доступных заказов.")
            return

        message = "Список заказов:\n\n"
        for order in orders:
            message += f"Заказ #{order['id']}\n"
            message += f"Дата: {order['order_date']}\n"
            message += f"Клиент: {order['username']}\n"
            message += f"Статус: {order['status']}\n"
            message += f"Тип: {order['product_type']}\n"
            if order['product_type'] == "Сумка":
                message += f"Размер: {order['size']}\n"
                message += f"Форма: {order['shape']}\n"
            message += f"Материал: {order['material']}\n"
            message += f"Цвет: {order['color']}\n"
            message += f"Опции: {order['options']}\n"
            if order['custom_description']:
                message += f"Описание: {order['custom_description']}\n"
            message += f"Контакт: {order['contact']}\n"
            if order['notes']:
                message += f"Заметки: {order['notes']}\n"
            message += "-------------------\n"

        # Разбиваем сообщение на части, если оно слишком длинное
        max_length = 4000
        for i in range(0, len(message), max_length):
            await update.message.reply_text(message[i:i + max_length])

    async def admin_order_status(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обновляет статус заказа"""
        if not self.is_admin(update.effective_user.id):
            await update.message.reply_text(MESSAGES['access_denied'])
            return

        try:
            order_id, status = context.args
            order_id = int(order_id)
            
            if await self.db.update_order_status(order_id, status):
                await update.message.reply_text(f"Статус заказа #{order_id} обновлен на '{status}'")
            else:
                await update.message.reply_text(f"Не удалось обновить статус заказа #{order_id}")
        except (ValueError, IndexError):
            await update.message.reply_text("Использование: /status <id_заказа> <новый_статус>")

    async def admin_order_note(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Добавляет заметку к заказу"""
        if not self.is_admin(update.effective_user.id):
            await update.message.reply_text(MESSAGES['access_denied'])
            return

        try:
            order_id = int(context.args[0])
            note = ' '.join(context.args[1:])
            
            if await self.db.add_order_note(order_id, note):
                await update.message.reply_text(f"Заметка добавлена к заказу #{order_id}")
            else:
                await update.message.reply_text(f"Не удалось добавить заметку к заказу #{order_id}")
        except (ValueError, IndexError):
            await update.message.reply_text("Использование: /note <id_заказа> <текст_заметки>")

    # Добавляем обработчик для Mini App
    async def open_mini_app(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Открывает Mini App для оформления заказа"""
        # Добавляем параметр v с текущим временем, чтобы обойти кэширование
        timestamp = int(time.time())
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("Открыть приложение", web_app=WebAppInfo(url=f"https://squazaryu.github.io/sumki-mini-app/?v={timestamp}"))
        ]])
        await update.message.reply_text(
            "Нажмите на кнопку ниже, чтобы открыть приложение для оформления заказа:",
            reply_markup=keyboard
        )

    async def handle_webapp_data(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """(УПРОЩЕННАЯ ВЕРСИЯ 2) Обрабатывает данные, полученные из веб-приложения или любое другое сообщение в ЛС"""
        # --- Логируем вход и сам объект Update --- 
        logging.info("!!!!!! ++++++ ВХОД В handle_webapp_data (упрощенный 2) ++++++ !!!!!!")
        print("!!!!!! ++++++ ВХОД В handle_webapp_data (упрощенный 2) ++++++ !!!!!!") 
        try:
            logging.info(f"!!!!!! handle_webapp_data: UPDATE: {repr(update)} !!!!!!")
            print(f"!!!!!! handle_webapp_data: UPDATE: {repr(update)} !!!!!!")
            
            # --- Проверяем и логируем web_app_data, если есть --- 
            if update.effective_message and hasattr(update.effective_message, 'web_app_data') and update.effective_message.web_app_data:
                 logging.info(f"!!!!!! handle_webapp_data: RAW DATA: >>>{update.effective_message.web_app_data.data}<<< !!!!!!")
                 print(f"!!!!!! handle_webapp_data: RAW DATA: >>>{update.effective_message.web_app_data.data}<<< !!!!!!")
                 # --- УБРАН ТЕСТОВЫЙ ВЫЗОВ add_order({}) --- 
            else:
                 logging.info("!!!!!! handle_webapp_data: НЕТ web_app_data в сообщении !!!!!!")
                 print("!!!!!! handle_webapp_data: НЕТ web_app_data в сообщении !!!!!!")

        except Exception as e:
             logging.error(f"!!!!!! handle_webapp_data: Ошибка в упрощенном обработчике 2: {e} !!!!!!")
             print(f"!!!!!! handle_webapp_data: Ошибка в упрощенном обработчике 2: {e} !!!!!!")
             import traceback
             logging.error(f"!!!!!! handle_webapp_data: Трассировка ошибки 2: {traceback.format_exc()} !!!!!!")
             
        # --- КОНЕЦ УПРОЩЕННОЙ ФУНКЦИИ 2 --- 

    # --- ЗАКОММЕНТИРОВАНА СТАРАЯ ФУНКЦИЯ --- 
    # async def handle_webapp_data_old(...): 
    #    ... вся старая логика ...

    async def send_message_to_seller(self, order_text, user, context):
        """Отправка информации о заказе продавцу"""
        try:
            # ID продавца
            SELLER_CHAT_ID = "50122963"
            
            logging.info(f"Попытка отправки заказа продавцу в чат {SELLER_CHAT_ID}")
            logging.info(f"Текст заказа для отправки: {order_text}") # Логируем финальный текст
            
            # Сначала пробуем отправить простой текст без форматирования
            try:
                # --- Первый try для отправки --- 
                result = await context.bot.send_message(
                    chat_id=SELLER_CHAT_ID,
                    text=order_text
                )
                logging.info(f"Сообщение продавцу успешно отправлено без форматирования, message_id: {result.message_id}")
                return # Выходим при успехе
            except Exception as plain_error:
                # --- except для первого try --- 
                logging.error(f"❌ Ошибка отправки продавцу без форматирования: {plain_error}")
            
            # Если не удалось, пробуем с Markdown
            logging.info("Попытка отправки продавцу с MarkdownV2...")
            try:
                # --- Второй try для отправки --- 
                import re
                escaped_text = re.sub(r'([_*[\]()~`>#+=|{}.!-])', r'\\\1', order_text)
                
                result = await context.bot.send_message(
                    chat_id=SELLER_CHAT_ID,
                    text=escaped_text,
                    parse_mode="MarkdownV2"
                )
                logging.info(f"Сообщение продавцу успешно отправлено с MarkdownV2, message_id: {result.message_id}")
                return # Выходим при успехе
            except Exception as markdown_error:
                # --- except для второго try --- 
                logging.error(f"❌ Ошибка отправки продавцу с MarkdownV2: {markdown_error}")
                
                # Крайний случай - пробуем отправить только основную информацию
                logging.info("Попытка отправки базового уведомления продавцу...")
                try:
                    # --- Третий try для отправки --- 
                    basic_text = f"Новый заказ!\n\nОт: {user.first_name} {user.last_name or ''} (@{user.username or 'без username'})\n\nПожалуйста, проверьте логи."
                    await context.bot.send_message(
                        chat_id=SELLER_CHAT_ID,
                        text=basic_text
                    )
                    logging.info("Базовое уведомление продавцу успешно отправлено")
                except Exception as basic_error:
                    # --- except для третьего try --- 
                    logging.error(f"❌ Критическая ошибка! Невозможно отправить продавцу даже базовое уведомление: {basic_error}")

        except Exception as e:
            # --- Глобальный except для всей функции --- 
            logging.error(f"❌ Критическая ошибка ВНУТРИ send_message_to_seller: {str(e)}")
            import traceback
            logging.error(f"❌ Трассировка send_message_to_seller: {traceback.format_exc()}")

    def main(self):
        """Запускает бота"""
        logger.info('Запуск бота...')

        # Создаем ApplicationBuilder
        builder = ApplicationBuilder().token(BOT_TOKEN)\
                .read_timeout(TIMEOUTS['read'])\
                .write_timeout(TIMEOUTS['write'])\
                .connect_timeout(TIMEOUTS['connect'])\
            .pool_timeout(TIMEOUTS['pool'])
        
        # Добавляем асинхронную инициализацию БД перед построением приложения
        builder.post_init(self.initialize_db)
        
        application = builder.build()

        # Добавляем обработчики команд
        application.add_handler(CommandHandler("start", self.start))
        application.add_handler(CommandHandler("help", self.admin_help))
        application.add_handler(CommandHandler("orders", self.admin_orders))
        application.add_handler(CommandHandler("status", self.admin_order_status))
        application.add_handler(CommandHandler("note", self.admin_order_note))
        
        # --- ОБРАБОТЧИК WEB APP DATA --- 
        # Возвращаем стандартный фильтр
        application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, self.handle_webapp_data))
        # ----------------------------------------------------------------
        
        application.add_handler(MessageHandler(filters.Regex("^Оформить заказ$"), self.choose_product))
        application.add_handler(MessageHandler(filters.Regex("^Заказать через приложение$"), self.open_mini_app))
        application.add_handler(MessageHandler(filters.CONTACT, self.contact_handler))
        application.add_handler(MessageHandler(filters.PHOTO, self.handle_custom_order_photo))
        # --- ОБРАБОТЧИК ОБЫЧНЫХ ТЕКСТОВЫХ СООБЩЕНИЙ --- 
        # Закомментирован, так как упрощенный handle_webapp_data ловит все
        # application.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), self.debug_message_handler))
        # -------------------------------------
        
        application.add_handler(CallbackQueryHandler(self.handle_preview_callback))
        application.add_error_handler(self.error_handler)
        
        application.post_init(self.set_commands)
        
        # Печатаем отладочную информацию (можно оставить здесь или перенести в post_init)
        logger.info("Бот настроен, запуск...")
        logger.info(f"Администраторы: {ADMIN_IDS}")
        logger.info(f"ID продавца: {SELLER_CHAT_ID}")
        
        # Запускаем бота
        application.run_polling(drop_pending_updates=True)
    
    async def set_commands(self, application: Application):
        """Устанавливает команды меню асинхронно (принимает Application)."""
        try:
            await application.bot.set_my_commands(get_menu_commands())
            logger.info("Команды меню успешно установлены")
        except Exception as e:
            logger.error(f"Ошибка при установке команд меню: {e}")

if __name__ == "__main__":
    bot = SumkiBot()
    # Вызов main() запускает все, включая асинхронную инициализацию и run_polling
    bot.main()