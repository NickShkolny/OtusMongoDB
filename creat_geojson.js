// ���������� ������ faker � ������������ ��� �������� �����
const faker = require('faker/locale/ru');
// ���������� ������ fs
const fs = require('fs');

// ������ ���������� ������
const count = 10;

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
