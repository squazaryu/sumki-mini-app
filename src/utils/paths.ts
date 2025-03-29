/**
 * Утилита для управления путями в приложении.
 * В зависимости от режима работы (dev или production), 
 * предоставляет корректные базовые пути для ресурсов.
 */

// Базовый путь из package.json
// В production это будет '/sumki-mini-app', в dev это будет '/'
export const BASE_PATH = process.env.PUBLIC_URL || '';

/**
 * Функция для получения полного пути к ресурсу, с учетом базового пути
 * @param path Относительный путь к ресурсу
 * @returns Полный путь с учетом базового пути
 */
export const getAssetPath = (path: string): string => {
  // Удаляем лишние слеши в начале пути
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const fullPath = `${BASE_PATH}/${cleanPath}`;
  
  // Добавляем отладочную информацию
  console.log(`[Path Debug] Requested: ${path}`);
  console.log(`[Path Debug] BASE_PATH: ${BASE_PATH}`);
  console.log(`[Path Debug] Full path: ${fullPath}`);
  
  return fullPath;
}; 