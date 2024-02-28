// Подключаем модуль faker с локализацией для русского языка
const faker = require('faker/locale/ru');
// Подключаем модуль fs
const fs = require('fs');

// Задаем количество данных
const count = 10;

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
