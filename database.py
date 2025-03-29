import aiosqlite
import json
import os
import datetime
from typing import Dict, List, Any, Optional, Union
import logging
import time

# Словарь для преобразования формы сумки (глобальный для удобства)
shape_mapping = {
    'kruglaya': 'Круглая',
    'pryamougolnaya': 'Прямоугольная',
    'kvadratnaya': 'Квадратная',
    'trapeciya': 'Трапеция',
    'mesyac': 'Месяц',
    'serdce': 'Сердце',
    'round': 'Круглая',
    'rectangular': 'Прямоугольная',
    'square': 'Квадратная',
    'trapezoid': 'Трапеция',
    'crescent': 'Месяц',
    'heart': 'Сердце'
}

# Словарь для преобразования материалов (глобальный для удобства)
material_mapping = {
    'akril': 'Акрил',
    'hrustal': 'Хрусталь',
    'swarovski': 'Swarovski',
    'acrylic': 'Акрил',
    'crystal': 'Хрусталь'
}

# Словарь для преобразования типов продуктов (глобальный для удобства)
product_mapping = {
    'bag': 'Сумка',
    'coaster': 'Подстаканник',
    'custom': 'Индивидуальный заказ'
}

class Database:
    def __init__(self, db_path: str = 'bot.db'):
        """Инициализирует базу данных

        Args:
            db_path (str, optional): Путь к базе данных. По умолчанию 'bot.db'.
        """
        self.db_path = db_path
        # self._create_tables() # Создание таблиц теперь асинхронное

    async def initialize(self):
        """Асинхронная инициализация - создает таблицы, если их нет."""
        async with aiosqlite.connect(self.db_path) as conn:
            # Устанавливаем row_factory для получения результатов в виде словарей
            # conn.row_factory = aiosqlite.Row # aiosqlite.Row удобнее для доступа по именам
            cursor = await conn.cursor()
            
            # Таблица для заказов
            await cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                username TEXT,
                order_date TEXT NOT NULL,
                product_type TEXT,
                size TEXT,
                shape TEXT,
                material TEXT,
                color TEXT,
                options TEXT, -- Храним как JSON строку
                custom_description TEXT,
                custom_photos TEXT, -- Храним как JSON строку
                contact TEXT,
                status TEXT DEFAULT 'new',
                notes TEXT,
                total_price REAL
            )
            ''')
            
            await conn.commit()
            logging.info(f"База данных {self.db_path} инициализирована.")

    async def add_order(self, user_id: int, username: str, data=None, **kwargs) -> int:
        """Асинхронно добавляет новый заказ в базу данных

        Args:
            user_id: ID пользователя
            username: Имя пользователя
            data: Данные заказа как словарь (из Mini App)
            **kwargs: Данные заказа как отдельные параметры (из старого бота)

        Returns:
            int: ID созданного заказа
        """
        # --- МЕТКА 1.5 --- 
        logging.info(f"!!!!!!!! database.py: ТОЧКА 1.5 - ВХОД В add_order (user={user_id}) !!!!!!!!")
        print(f"!!!!!!!! database.py: ТОЧКА 1.5 - ВХОД В add_order (user={user_id}) !!!!!!!!")
        # -----------------
        async with aiosqlite.connect(self.db_path) as conn:
            cursor = await conn.cursor()
            
            # Определяем источник данных
            if data is None and kwargs:
                source_data = kwargs
                logging.info(f"DB: Используется старый способ вызова add_order через kwargs: {kwargs}")
            elif data is None:
                source_data = {}
                logging.warning("DB: Данные для заказа не предоставлены!")
            else:
                source_data = data
                # --- ЛОГИРУЕМ СЫРЫЕ ДАННЫЕ, ПРИШЕДШИЕ В ФУНКЦИЮ --- 
                try:
                    raw_data_log = json.dumps(source_data, indent=2, ensure_ascii=False)
                except TypeError: # На случай, если данные не сериализуемы
                    raw_data_log = repr(source_data)
                logging.info(f"!!!!!!!! DB add_order: ПОЛУЧЕНЫ СЫРЫЕ ДАННЫЕ: {raw_data_log} !!!!!!!!")
                # ------------------------------------------------------

            # --- Подготовка данных --- 
            
            # Тип продукта
            product_type_key = source_data.get('product', source_data.get('product_type', 'Нестандартный заказ'))
            product_type = product_mapping.get(product_type_key, product_type_key)
            
            # Форма
            shape_key = source_data.get('shape', '')
            shape = shape_mapping.get(shape_key, shape_key) if shape_key else ''
            
            # Материал
            material_key = source_data.get('material', '')
            material = material_mapping.get(material_key, material_key) if material_key else ''
            
            # Опции (корректная обработка и сериализация)
            options_data = source_data.get('options', [])
            options_json = json.dumps(options_data, ensure_ascii=False) if options_data else '[]'
            
            # Фотографии (корректная обработка и сериализация)
            custom_photos_data = source_data.get('custom_photos', [])
            custom_photos_json = json.dumps(custom_photos_data, ensure_ascii=False) if custom_photos_data else '[]'
            
            # Контакт
            contact = source_data.get('contact', source_data.get('contact_phone', source_data.get('phone', '')))
            
            # Описание (учет разных ключей)
            custom_description = source_data.get('custom_description', source_data.get('customDescription', ''))
            
            # Подготовка словаря для вставки
            order_data_to_insert = {
                'user_id': user_id,
                'username': username,
                'order_date': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'product_type': product_type,
                'size': source_data.get('size', ''),
                'shape': shape,
                'material': material,
                'color': source_data.get('color', ''),
                'options': options_json,
                'custom_description': custom_description,
                'custom_photos': custom_photos_json,
                'contact': contact,
                'status': source_data.get('status', 'new'),
                'notes': '', # Заметки добавляются отдельно
                'total_price': source_data.get('total_price', 0) if isinstance(source_data.get('total_price'), (int, float)) else 0
            }
            
            # --- ЛОГИРУЕМ ДАННЫЕ ПЕРЕД ВСТАВКОЙ --- 
            logging.info(f"DB: Подготовленные данные для вставки: {json.dumps(order_data_to_insert, indent=2, ensure_ascii=False)}")
            
            # --- Вставка данных --- 
            fields = ', '.join(order_data_to_insert.keys())
            placeholders = ', '.join([f':{key}' for key in order_data_to_insert.keys()]) # Используем именованные плейсхолдеры
            sql = f'INSERT INTO orders ({fields}) VALUES ({placeholders})'
            
            logging.info(f"DB SQL: {sql}")
            logging.info(f"DB Values: {order_data_to_insert}")
            
            await cursor.execute(sql, order_data_to_insert)
            order_id = cursor.lastrowid
            
            await conn.commit()
            
            logging.info(f"DB: Заказ успешно добавлен с ID: {order_id}")
            
            return order_id

    async def get_order_by_id(self, order_id: int) -> Optional[Dict[str, Any]]:
        """Асинхронно получает данные заказа по ID.
        
        Returns:
            Словарь с данными заказа или None, если заказ не найден.
        """
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row # Получать результаты как объекты Row
                cursor = await conn.cursor()
                await cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
                order_row = await cursor.fetchone()
                
                if order_row:
                    # Преобразуем Row в обычный словарь
                    order_dict = dict(order_row)
                    logging.info(f"DB: Заказ #{order_id} найден: {json.dumps(order_dict, indent=2, ensure_ascii=False)}")
                    # Десериализуем JSON поля для удобства использования
                    try:
                        order_dict['options'] = json.loads(order_dict.get('options', '[]') or '[]')
                    except (json.JSONDecodeError, TypeError):
                        logging.warning(f"DB: Не удалось десериализовать options для заказа {order_id}")
                        order_dict['options'] = []
                    try:
                        order_dict['custom_photos'] = json.loads(order_dict.get('custom_photos', '[]') or '[]')
                    except (json.JSONDecodeError, TypeError):
                        logging.warning(f"DB: Не удалось десериализовать custom_photos для заказа {order_id}")
                        order_dict['custom_photos'] = []
                    return order_dict
                else:
                    logging.warning(f"DB: Заказ с ID {order_id} не найден.")
                    return None
        except Exception as e:
            logging.error(f"DB: Ошибка при получении заказа по ID {order_id}: {e}")
            return None

    async def get_all_orders(self) -> List[Dict[str, Any]]:
        """Асинхронно получает все заказы из БД"""
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row # Для удобного доступа к полям
                cursor = await conn.cursor()
                await cursor.execute("""
                    SELECT id, user_id, username, product_type, size, shape, material, color, options, 
                           custom_description, datetime(order_date, 'localtime') as order_date_local, status, notes, contact
                    FROM orders
                    ORDER BY id DESC
                """)
                orders_rows = await cursor.fetchall()
            
            formatted_orders = []
            for order_row in orders_rows:
                order_dict = dict(order_row)
                # Десериализуем JSON поля
                try:
                    order_dict['options'] = json.loads(order_dict.get('options', '[]') or '[]')
                except (json.JSONDecodeError, TypeError):
                    order_dict['options'] = []
                # Добавляем поле order_date из order_date_local
                order_dict['order_date'] = order_dict.pop('order_date_local', None)
                formatted_orders.append(order_dict)
                
            logging.info(f"DB: Получено {len(formatted_orders)} заказов.")
            return formatted_orders
        except Exception as e:
            logging.error(f"DB: Ошибка при получении всех заказов: {e}")
            return []

    async def get_next_order_id(self) -> int:
        """Асинхронно получает следующий доступный ID заказа"""
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                cursor = await conn.cursor()
                await cursor.execute("SELECT MAX(id) FROM orders")
                result = await cursor.fetchone()
                next_id = (result[0] or 0) + 1
                logging.info(f"DB: Следующий ID заказа: {next_id}")
                return next_id
        except Exception as e:
            logging.error(f"DB: Ошибка при получении следующего ID заказа: {e}")
            # В случае ошибки возвращаем временное значение, чтобы избежать падения
            return int(time.time()) # Не идеально, но лучше чем падение

    async def update_order_status(self, order_id: int, status: str) -> bool:
        """Асинхронно обновляет статус заказа"""
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                cursor = await conn.cursor()
                await cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (status, order_id))
                await conn.commit()
                if cursor.rowcount > 0:
                    logging.info(f"DB: Статус заказа #{order_id} обновлен на '{status}'")
                    return True
                else:
                    logging.warning(f"DB: Заказ #{order_id} не найден для обновления статуса.")
                    return False
        except Exception as e:
            logging.error(f"DB: Ошибка при обновлении статуса заказа #{order_id}: {e}")
            return False

    async def add_order_note(self, order_id: int, note: str) -> bool:
        """Асинхронно добавляет или обновляет заметку к заказу"""
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                cursor = await conn.cursor()
                # Получаем текущую заметку
                await cursor.execute("SELECT notes FROM orders WHERE id = ?", (order_id,))
                current_note_row = await cursor.fetchone()
                
                if current_note_row is None:
                    logging.warning(f"DB: Заказ #{order_id} не найден для добавления заметки.")
                    return False
                
                current_note = current_note_row[0] or ""
                new_note = f"{current_note}\n[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}] {note}".strip()
                
                await cursor.execute("UPDATE orders SET notes = ? WHERE id = ?", (new_note, order_id))
                await conn.commit()
                
                if cursor.rowcount > 0:
                    logging.info(f"DB: Заметка добавлена к заказу #{order_id}")
                    return True
                else:
                    # Этого не должно произойти, если fetchone вернул результат
                    logging.error(f"DB: Не удалось обновить заметку для заказа #{order_id} после ее нахождения.")
                    return False
        except Exception as e:
            logging.error(f"DB: Ошибка при добавлении заметки к заказу #{order_id}: {e}")
            return False

# Пример использования (если нужно запустить отдельно для инициализации)
#async def main():
#    db = Database()
#    await db.initialize()
#
#if __name__ == "__main__":
#    import asyncio
#    asyncio.run(main()) 