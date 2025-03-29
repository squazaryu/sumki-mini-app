const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '../public/images/products');

// Убедимся, что директория существует
if (!fs.existsSync(PRODUCTS_DIR)) {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
}

// Функция для кодирования данных в Base64
function encodeAsBase64(imagePath) {
  const data = fs.readFileSync(imagePath);
  return Buffer.from(data).toString('base64');
}

// Функция для декодирования данных из Base64 и сохранения в файл
function decodeAndSaveImage(base64Data, filePath) {
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
  console.log(`Сохранено: ${filePath}`);
}

// Пример закодированных данных изображений
const BAG_IMAGE = ''; // Здесь должны быть данные изображения сумки
const EARRINGS_IMAGE = ''; // Здесь должны быть данные изображения серег
const COASTER_IMAGE = ''; // Здесь должны быть данные изображения подстаканника

// Сохраняем изображения
if (BAG_IMAGE) {
  decodeAndSaveImage(BAG_IMAGE, path.join(PRODUCTS_DIR, 'bag.jpg'));
}

if (EARRINGS_IMAGE) {
  decodeAndSaveImage(EARRINGS_IMAGE, path.join(PRODUCTS_DIR, 'earrings.jpg'));
}

if (COASTER_IMAGE) {
  decodeAndSaveImage(COASTER_IMAGE, path.join(PRODUCTS_DIR, 'coaster.jpg'));
}

console.log('Все изображения сохранены');

// Пример использования для кодирования изображений
// const bagImagePath = './images/bag.jpg';
// const bagBase64 = encodeAsBase64(bagImagePath);
// console.log('BAG_IMAGE = ', bagBase64); 