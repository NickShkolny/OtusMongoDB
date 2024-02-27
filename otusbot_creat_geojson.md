# �������� ���� ��������

## ���� ������

����� ������ ���� ������� nodejs ����������, ������� ���������� ����� �������� ������ � ������: �������� ���� ��� ���������, ���������� � �������� 2000 �� �� ������ ������, � ��������� ��� ������ � ������� geojson � ����.

## ��� ������

### �������� ����� ����� otusbot �� �������

��� �������� ����� ����� otusbot �� ������� � ����������� ������� `mkdir otusbot` � ���������. ����� � ������� � ��� ����� � ������� ������� `cd otusbot`.

### ������������� nodejs ����������

��� ������������� nodejs ���������� � ����������� ������� `npm init` � ���������. ��� ������� ������� ���� package.json, � ������� �������� ��������� � ����������� ����������. � �������� ����������� ����, ����� ��� ���, ������, ��������, �����, �������� � �.�.

### ��������� ������ faker

��� ��������� �������� ������ � ����������� ������ faker, ������� ������������� ��������� ������ ��� �������� ��������� ����, �������, ����� � �.�. � ��������� ���� ������ � ������� ������� `npm install faker --save` � ���������. ��� ������� ��������� ������ � ����� node_modules � ���������� ��� � ���� package.json � ������� dependencies.

### ��������� ���� ����������

��� ��������� ���� ���������� � ����������� ��������� �������� Visual Studio Code. � ������ ���� index.js � ����� otusbot � ������� ��������� ���:

```javascript
// ���������� ������ faker � ������������ ��� �������� �����
const faker = require('faker/locale/ru');
// ���������� ������ fs
const fs = require('fs');

// ������ ���������� ������
const count = 1000;

// ������� ������ geojson
let geojson = {
    type: 'FeatureCollection',
    features: []
};

// ������� ������ ���������
const prefixes = ['restaurant', 'cafe', 'club'];

// ���������� ��������� ������
for (let i = 0; i < count; i++) {
    // ���������� ��� �� ������� �����
    let name = faker.name.firstName();
    // ���������� ��������� �������
    let prefix = faker.random.arrayElement(prefixes);
    // ���������� �������� ��������� ��� ����
    let fullName = `${prefix} ${name}`;
    // ���������� ���������� � �������� 1500 �� �� ������
    let lat = faker.datatype.float({ min: 43.5, max: 62.5 }); // ������
    let lng = faker.datatype.float({ min: 26.5, max: 50.5 }); // �������
    // ������� ������ ����
    let feature = {
        type: 'Feature',
        properties: {
            name: fullName
        },
        geometry: {
            type: 'Point',
            coordinates: [lng, lat] // ���������� ������� ��������� � ������������
        }
    };
    // ��������� ���� � ������
    geojson.features.push(feature);
}

// ����������� ������ � ������
let data = JSON.stringify(geojson);

// ���������� ������ � ����
fs.writeFile('data.geojson', data, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Data saved');
    }
});

```
### ������ � �������� ����������
��� ������� ���������� � ����������� ������� node index.js � ���������. ��� ������� ��������� ���� index.js � ������� �������������� node � ������� ��������� �Data saved� � ������ ��������� ����������. ��� ��������� ���������� � ������ ���� data.geojson � ��������� ��������� � ������, ��� �� �������� ����� �������� ������ � ������� geojson. � ����� �������� ���������� ������� � ������� ��������� geojson ������ �� github, ������� �������, ��� ���� ������������� ������������ GeoJSON ��� ��� ����� �� ����� ������������.

### ���������
```json
{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"cafe Rebecca"},"geometry":{"type":"Point","coordinates":[44.12,59.4]}},{"type":"Feature","properties":{"name":"club Howell"},"geometry":{"type":"Point","coordinates":[38.62,53.62]}},{"type":"Feature","properties":{"name":"cafe Kolby"},"geometry":{"type":"Point","coordinates":[41.15,51.97]}}]}
```
