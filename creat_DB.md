# Приложение для импорта geojson файла в mongodb с помощью node.js

Это приложение позволяет прочитать файл в формате geojson, содержащий данные о различных местах (кафе, рестораны и т.д.), и загрузить их в базу данных mongodb, создавая отдельные документы для каждого места. Также приложение создает пространственный индекс по полю location, который позволяет выполнять геопространственные запросы к базе данных.

## Что нужно для запуска приложения

Для запуска приложения тебе нужно иметь следующее:

- Node.js версии 18.19.1 или выше. 
- Mongodb версии 6.0 или выше. 
- Файл data.geojson, содержащий данные о местах в формате geojson. Ты можешь использовать свой собственный файл или где то скачать .
- Файл creat_db.js, содержащий код приложения. Ты можешь скопировать его из этого документа или скачать с этого репозитория.

## Как запустить приложение

Для запуска приложения тебе нужно выполнить следующие шаги:

1. Открой терминал и перейди в папку, где лежат файлы data.geojson и creat_db.js.
2. Установи модуль mongoose, необходимый для работы с mongodb, с помощью команды `npm install mongoose`.
3. Открой файл creat_db.js в любом текстовом редакторе и измени параметры подключения к базе данных в соответствии с твоими настройками. Ты должен указать хост, порт, имя, логин и пароль базы данных. 

```javascript
// Подключаем модули nodejs
const fs = require('fs'); // Для работы с файлами
const mongoose = require('mongoose'); // Для работы с mongodb

// Задаем параметры подключения к базе данных
const dbHost = '127.0.0.1'; // IP адрес базы данных
const dbPort = 27017; // Порт базы данных
const dbName = 'otusbot'; // Имя базы данных
const dbUser = 'mongo-user-otusbot'; // Логин пользователя
const dbPass = 'password'; // Пароль пользователя

// Формируем строку подключения к базе данных
const dbUrl = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;

// Создаем схему для документов в коллекции places
const placeSchema = new mongoose.Schema({
    name: String, // Название места
    type: String, // Тип места (кафе, ресторан и т.д.)
    location: {
        type: { type: String }, // Тип геометрии
        coordinates: [Number], // Координаты места
    },
});

// Создаем модель для документов в коллекции places
const Place = mongoose.model('Place', placeSchema);

// Подключаемся к базе данных с помощью async/await
(async () => {
    try {
        // Подключаемся к базе данных без лишних опций, которые больше не нужны и будут удалены в следующей версии
        await mongoose.connect(dbUrl);
        console.log('Connected to mongodb');

        // Читаем файл data.geojson из текущей папки
        const data = await fs.promises.readFile('data.geojson', 'utf8');

        // Парсим файл как JSON
        const geojsonData = JSON.parse(data);

        // Преобразуем данные из geojson в формат для коллекции places
        const placesData = geojsonData.features.map((feature) => {
            return {
                name: feature.properties.name, // Название места
                type: feature.properties.type, // Тип места
                location: feature.geometry, // Геометрия места
            };
        });

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

```
4. Сохрани файл creat_db.js и закрой редактор.
5. Запусти приложение с помощью команды node creat_db.js в терминале. Ты должен увидеть сообщения о подключении к базе данных, удалении, добавлении и индексации документов в коллекции places.
```angular2html
Connected to mongodb
Inserted 10 documents into places collection
Created or updated index undefined on places collection
```
# Что делает приложение

Приложение выполняет следующие действия:

- Подключается к базе данных mongodb с помощью модуля mongoose.
- Читает файл data.geojson с помощью модуля fs и парсит его как JSON.
- Преобразует данные из geojson в формат для коллекции places, извлекая название, тип и геометрию каждого места.
- Удаляет все документы из коллекции places, если она существует, или создает новую коллекцию, если ее нет.
- Добавляет новые документы в коллекцию places, используя модель Place, основанную на схеме placeSchema.
- Создает или обновляет пространственный индекс по полю location, используя тип 2dsphere, который позволяет хранить и запросить данные в виде геометрических объектов на сфере.
- Закрывает подключение к базе данных.

# Какая база с какой структурой создана

Приложение создает базу данных с именем, указанным в параметре dbName. В этой базе данных создается коллекция с именем places, в которой хранятся документы, представляющие места. Каждый документ имеет следующую структуру:

```javascript
{
  _id: ObjectId, // Уникальный идентификатор документа, созданный автоматически
  name: String, // Название места
  type: String, // Тип места (кафе, ресторан и т.д.)
  location: {
    type: { type: String }, // Тип геометрии (Point, Polygon и т.д.)
    coordinates: [Number], // Координаты места в виде массива чисел
  },
}
```
Например, один из документов в коллекции places может выглядеть так:

```javascript

{
    _id: ObjectId("617c4f1a9b0f3d3f8a8f7e1b"),
        name: "cafe Rebecca",
    type: "cafe",
    location: {
    type: "Point",
        coordinates: [44.12, 59.4],
}
}

```