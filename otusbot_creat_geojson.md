# Создание базы объектов

## Цель работы

Целью работы было создать nodejs приложение, которое генерирует набор фейковых данных с полями: название кафе или ресторана, координаты в пределах 2000 км от города Москва, и сохраняет эти данные в формате geojson в файл.

## Ход работы

### Создание новой папки otusbot на сервере

Для создания новой папки otusbot на сервере я использовал команду `mkdir otusbot` в терминале. Затем я перешел в эту папку с помощью команды `cd otusbot`.

### Инициализация nodejs приложения

Для инициализации nodejs приложения я использовал команду `npm init` в терминале. Эта команда создает файл package.json, в котором хранятся настройки и зависимости приложения. Я заполнил необходимые поля, такие как имя, версия, описание, автор, лицензия и т.д.

### Установка модуля faker

Для генерации фейковых данных я использовал модуль faker, который предоставляет различные методы для создания случайных имен, адресов, чисел и т.д. Я установил этот модуль с помощью команды `npm install faker --save` в терминале. Эта команда добавляет модуль в папку node_modules и записывает его в файл package.json в разделе dependencies.

### Написание кода приложения

Для написания кода приложения я использовал текстовый редактор Visual Studio Code. Я создал файл index.js в папке otusbot и написал следующий код:

```javascript
// Подключаем модуль faker с локализацией для русского языка
const faker = require('faker/locale/ru');
// Подключаем модуль fs
const fs = require('fs');

// Задаем количество данных
const count = 1000;

// Создаем объект geojson
let geojson = {
    type: 'FeatureCollection',
    features: []
};

// Создаем массив префиксов
const prefixes = ['restaurant', 'cafe', 'club'];

// Генерируем случайные данные
for (let i = 0; i < count; i++) {
    // Генерируем имя на русском языке
    let name = faker.name.firstName();
    // Генерируем случайный префикс
    let prefix = faker.random.arrayElement(prefixes);
    // Составляем название ресторана или кафе
    let fullName = `${prefix} ${name}`;
    // Генерируем координаты в пределах 1500 км от Москвы
    let lat = faker.datatype.float({ min: 43.5, max: 62.5 }); // Широта
    let lng = faker.datatype.float({ min: 26.5, max: 50.5 }); // Долгота
    // Создаем объект фичи
    let feature = {
        type: 'Feature',
        properties: {
            name: fullName
        },
        geometry: {
            type: 'Point',
            coordinates: [lng, lat] // Возвращаем порядок координат к стандартному
        }
    };
    // Добавляем фичу в массив
    geojson.features.push(feature);
}

// Преобразуем объект в строку
let data = JSON.stringify(geojson);

// Записываем данные в файл
fs.writeFile('data.geojson', data, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Data saved');
    }
});

```
### Запуск и просмотр результата
Для запуска приложения я использовал команду node index.js в терминале. Эта команда запускает файл index.js с помощью интерпретатора node и выводит сообщение ‘Data saved’ в случае успешного выполнения. Для просмотра результата я открыл файл data.geojson в текстовом редакторе и увидел, что он содержит набор фейковых данных в формате geojson. Я также проверил валидность формата с помощью просмотра geojson файлов на github, который показал, что файл соответствует спецификации GeoJSON так как точки на карте отобразились.

### Результат
```json
{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"cafe Rebecca"},"geometry":{"type":"Point","coordinates":[44.12,59.4]}},{"type":"Feature","properties":{"name":"club Howell"},"geometry":{"type":"Point","coordinates":[38.62,53.62]}},{"type":"Feature","properties":{"name":"cafe Kolby"},"geometry":{"type":"Point","coordinates":[41.15,51.97]}}]}
```
