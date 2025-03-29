// Файл: /api/send-message.js
// Это серверная функция для Vercel, которая выступает в качестве прокси между клиентом и API Telegram

import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Улучшенное логирование для отладки
  console.log('Received request:', new Date().toISOString());
  
  // Устанавливаем CORS-заголовки для разрешения запросов с любого источника
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка предварительных запросов OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Только обрабатываем POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Получаем параметры из запроса
    const { botToken, chatId, text, parseMode } = req.body;
    
    // Также поддерживаем старый формат параметров
    const token = botToken || req.body.token;
    const chat_id = chatId || req.body.chat_id;
    const parse_mode = parseMode || req.body.parse_mode || 'Markdown';
    
    // Логирование параметров запроса
    console.log('Request params:', {
      token: token ? `${token.slice(0, 10)}...` : undefined, // Безопасно: не логируем полный токен
      chatId: chat_id,
      parseMode: parse_mode,
      textLength: text ? text.length : 0
    });

    // Проверяем, что все необходимые параметры присутствуют
    if (!token || !chat_id || !text) {
      console.error('Missing parameters:', { 
        hasToken: !!token, 
        hasChatId: !!chat_id, 
        hasText: !!text 
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters',
        details: {
          hasToken: !!token,
          hasChatId: !!chat_id,
          hasText: !!text
        }
      });
    }

    // Формируем URL для API Telegram
    const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    
    // Подготавливаем тело запроса
    const requestBody = {
      chat_id,
      text,
      parse_mode
    };
    
    console.log('Sending to Telegram API:', {
      url: apiUrl,
      bodyLength: JSON.stringify(requestBody).length
    });

    // Отправляем запрос к API Telegram
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    // Получаем результат в формате JSON
    const data = await response.json();
    
    console.log('Telegram API response:', {
      ok: data.ok,
      status: response.status,
      statusText: response.statusText
    });

    // Проверяем, был ли запрос успешным
    if (data.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      console.error('Telegram API error:', data);
      return res.status(response.status || 500).json({ 
        success: false, 
        error: data.description || 'Error from Telegram API',
        details: data
      });
    }
  } catch (error) {
    console.error('Proxy server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
} 