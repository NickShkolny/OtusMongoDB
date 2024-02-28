// Подключаем модули nodejs
const fs = require('fs'); // Для работы с файлами
const mongoose = require('mongoose'); // Для работы с mongodb



// Задаем параметры подключения к базе данных
const dbHost = '127.0.0.1'; // IP адрес базы данных
const dbPort = 27017; // Порт базы данных
const dbName = 'otusbotdb'; // Имя базы данных
const dbUser = 'mongo-user'; // Логин пользователя
const dbPass = 'password'; // Пароль пользователя

// Формируем строку подключения к базе данных
const dbUrl = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;

// Создаем схему для документов в коллекции places
const placeSchema = new mongoose.Schema({
    name: { type: String, alias: 'Name' }, // Название места
    type: String, // Тип места (кафе, ресторан и т.д.)
    location: {
        type: { type: String }, // Тип геометрии
        coordinates: [Number], // Координаты места
    },
    description: String, // Описание места
});

// Создаем модель для документов в коллекции places
const Place = mongoose.model('Place', placeSchema);

// Подключаемся к базе данных с помощью async/await
(async () => {
    try {
        // Подключаемся к базе данных без лишних опций, которые больше не нужны и будут удалены в следующей версии
        await mongoose.connect(dbUrl);
        console.log('Connected to mongodb');

        // Удаляем все документы из коллекции places
        const deleteResult = await Place.deleteMany({});

        // Выводим количество удаленных документов в консоль
        console.log(`Deleted ${deleteResult.deletedCount} documents from places collection`);

        // Читаем файл data.geojson из текущей папки
        const data = await fs.promises.readFile('763.geojson', 'utf8');

        // Парсим файл как JSON
        const geojsonData = JSON.parse(data);



// Преобразуем данные из geojson в формат для коллекции places
        const placesData = geojsonData.features.map((feature) => {
            return {
                name: feature.properties.Name, // Название места
                type: feature.properties.type, // Тип места
                location: {
                    type: feature.geometry.type, // Тип геометрии
                    coordinates: SwapCoordinates(feature.geometry.coordinates) // Меняем местами широту и долготу с помощью функции SwapCoordinates
                },
                description: feature.properties.description, // Описание места
            };
        });

// Функция для обмена координат в массиве
        function SwapCoordinates(array) {
            // Если массив пустой или не является массивом, возвращаем его без изменений
            if (!Array.isArray(array) || array.length === 0) {
                return array;
            }
            // Если первый элемент массива - число, то меняем местами его и второй элемент
            if (typeof array[0] === "number") {
                return [array[1], array[0]];
            }
            // Иначе, рекурсивно применяем функцию к каждому элементу массива
            return array.map(SwapCoordinates);
        }


        // Добавляем новые документы в коллекцию places
        const insertResult = await Place.insertMany(placesData);

        // Выводим количество добавленных документов в консоль
        console.log(`Inserted ${insertResult.length} documents into places collection`);

        // Создаем или обновляем пространственный индекс по полю location
        // Используем метод createIndexes вместо createIndex, который был переименован в версии mongoose 6.0
        const indexResult = await Place.createIndexes({ location: '2dsphere' });

        // Выводим имя индекса в консоль
        console.log(`Created or updated index ${indexResult} on places collection`);

        // Закрываем подключение к базе данных
        await mongoose.disconnect();
    } catch (err) {
        // Если произошла ошибка, выводим ее в консоль
        console.error(err);
    }
})();
