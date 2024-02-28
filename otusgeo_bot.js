// Добавляем библиотеку geolib
const geolib = require('geolib');

const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');

// Замените значение ниже на токен Telegram, который вы получите от @BotFather
const token = 'token';

// Создаем бота, который использует 'polling' для получения новых обновлений
const bot = new TelegramBot(token, {polling: true});

// Обрабатываем команду start
bot.onText(/\/start/, (msg) => {
    // Приветствуем пользователя по имени
    const chatId = msg.chat.id;
    const name = msg.from.first_name;
    bot.sendMessage(chatId, `Привет, ${name}! Я геобот путеводитель по Крыму, если отравить мне свою геопозицию - я выдам ближайшую к Вам точку из базы данных интересных мест Крымского полуострова.`);
    console.log(`Пользователь ${name} начал чат с ботом`); // Логируем начало чата
});

// Задаем параметры подключения к базе данных
const dbHost = '127.0.0.1'; // IP адрес базы данных
const dbPort = 27017; // Порт базы данных
const dbName = 'otusbotdb'; // Имя базы данных
const dbUser = 'mongo-user'; // Логин пользователя
const dbPass = 'password'; // Пароль пользователя

// Подключаемся к базе данных mongoDB
mongoose.connect(`mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`)
    .then(() => {
        console.log('Подключились к mongoDB');

        Place.createIndexes('places', { location: '2dsphere' })

    .then((indexResult) => {
                // Выводим имя индекса в консоль
                console.log(`Created or updated index ${indexResult} on places collection`);
            })
            .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));


// Добавляем поле description в схему и модель для коллекции places
const placeSchema = new mongoose.Schema({
    name: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String // Новое поле
});

const Place = mongoose.model('Place', placeSchema);

// Определяем константу для максимальной длины сообщения в телеграме
const MAX_MESSAGE_LENGTH = 4096;

// Создаем функцию для разбиения длинного текста на части
function splitText(text, maxLength) {
    // Если текст короче или равен максимальной длине, возвращаем его в виде массива из одного элемента
    if (text.length <= maxLength) {
        return [text];
    }

    // Иначе ищем пробел или перенос строки, ближайший к максимальной длине, и разбиваем текст по нему
    let index = text.lastIndexOf(' ', maxLength);
    if (index === -1) {
        index = text.lastIndexOf('\n', maxLength);
    }
    if (index === -1) {
        // Если не нашли ни пробела, ни переноса строки, просто обрезаем текст по максимальной длине
        index = maxLength;
    }

    // Возвращаем массив из первой части текста и рекурсивно вызываем функцию для остатка
    return [text.slice(0, index)].concat(splitText(text.slice(index + 1), maxLength));
}

// Создаем функцию для удаления ссылок на сайт mysuntime.ru из текста
function removeMysuntimeLinks(text) {
    // Используем регулярное выражение для поиска и замены ссылок на пустую строку
    // Ссылка начинается с http:// или https://, затем содержит mysuntime.ru, затем любые символы, кроме пробела или переноса строки, и заканчивается пробелом, переносом строки или концом строки
    let regex = /https?:\/\/mysuntime\.ru[^\s\n]+(\s|\n|$)/g;
    return text.replace(regex, '');
}

// Изменяем код обработки сообщения с геопозицией
bot.on('location', (msg) => {
    // Получаем геопозицию пользователя
    const chatId = msg.chat.id;
    const userLat = msg.location.latitude;
    const userLon = msg.location.longitude;
    console.log(`Пользователь отправил свою геопозицию: ${userLat}, ${userLon}`); // Логируем геопозицию пользователя

    // Находим ближайшую точку из базы данных
    Place.findOne({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [userLat, userLon]
                }
            }
        }
    }).then((place) => {
        // Проверяем, что точка найдена
        if (place) {
            // Получаем название, координаты и описание точки
            const name = place.name;
            const lat = place.location.coordinates[0];
            const lon = place.location.coordinates[1];
            const description = place.description; // Новое поле
            console.log(`Найдена ближайшая точка: ${name} (${lat}, ${lon})`); // Логируем название и координаты точки

            // Вычисляем расстояние между пользователем и точкой в километрах с помощью библиотеки geolib
            const distance = geolib.getDistance(
                {latitude: userLat, longitude: userLon},
                {latitude: lat, longitude: lon}
            ) / 1000; // Преобразуем метры в километры

            // Форматируем сообщение с ответом
            let response = `Вот ближайшая точка из базы данных по Вашей геопозиции:\n\n`;
            response += `${name}\n`;
            response += `Расстояние до нее: ${distance.toFixed(2)} км\n`; // Новая строка

            // Отправляем сообщение с ответом
            bot.sendMessage(chatId, response);

            // Отправляем сообщение с координатами точки в формате Telegram
            bot.sendLocation(chatId, lat, lon);

            // Удаляем ссылки на сайт mysuntime.ru из описания точки, если они там есть
            const cleanDescription = removeMysuntimeLinks(description);

            // Разбиваем описание точки на части, если оно слишком длинное
            const parts = splitText(cleanDescription, MAX_MESSAGE_LENGTH);

            // Отправляем каждую часть описания отдельным сообщением
            for (let part of parts) {
                bot.sendMessage(chatId, part);
            }
        } else {
            // Сообщаем, что точка не найдена
            bot.sendMessage(chatId, 'К сожалению, по Вашей геопозиции нет точек в базе данных.');
        }
    }).catch((err) => console.error(err));
});
