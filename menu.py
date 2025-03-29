from telegram import BotCommand

def get_menu_commands():
    """Возвращает список команд для меню бота"""
    return [
        BotCommand("start", "Начать работу с ботом"),
        BotCommand("help", "Помощь по использованию бота"),
        BotCommand("orders", "Просмотр заказов (только для администраторов)"),
        BotCommand("status", "Изменить статус заказа (только для администраторов)"),
        BotCommand("note", "Добавить заметку к заказу (только для администраторов)")
    ] 