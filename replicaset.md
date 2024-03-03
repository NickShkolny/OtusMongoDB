# Как создать кластер mongoDB на трех серверах

## Предварительные условия
- У вас есть доступ к трем серверам с операционной системой Ubuntu 20.04 или выше.
- У вас есть sudo права на этих серверах.
- У вас есть IP адреса этих серверов. Для примера, здесь будут указаны  192.168.0.1, 192.168.0.2 и 192.168.0.3.

## Шаг 1: Установить mongoDB на всех серверах

- Для первого сервера с IP адресом 192.168.0.1 и портом 27017, создайте файл с именем server1.sh и вставьте в него следующий код:

```bash
#!/bin/bash

# Установить mongodb из официального репозитория
wget -qO - [1] | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] [2] $(lsb_release -cs) mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Создать папку для хранения данных для узла
sudo mkdir -p /data/db

# Запустить узел с указанным IP адресом, портом, папкой для данных, именем реплики и лог файлом
sudo mongod --bind_ip 192.168.0.1 --port 27017 --dbpath /data/db --replSet rs0 --fork --logpath /var/log/mongodb/mongod.log

# Подключиться к узлу mongoDB на порту 27017
mongo --port 27017

# Инициировать набор реплик с тремя узлами
rs.initiate({_id: 'rs0', members: [{_id: 0, host: '192.168.0.1:27017'}, {_id: 1, host: '192.168.0.2:27018'}, {_id: 2, host: '192.168.0.3:27019'}]})

# Проверить статус набора реплик
rs.status()

# Создать базу данных oustusDB с пользователем mongo-user и паролем mypass
db = db.getSiblingDB('oustusDB');
db.createUser({user: 'mongo-user', pwd: 'mypass', roles: [{role: 'readWrite', db: 'oustusDB'}]});
```

- Для второго сервера с IP адресом 192.168.0.2 и портом 27018, создайте файл с именем server2.sh и вставьте в него следующий код:

```bash
#!/bin/bash

# Установить mongodb из официального репозитория
wget -qO - [1] | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] [2] $(lsb_release -cs) mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Создать папку для хранения данных для узла
sudo mkdir -p /data/db

# Запустить узел с указанным IP адресом, портом, папкой для данных, именем реплики и лог файлом
sudo mongod --bind_ip 192.168.0.2 --port 27018 --dbpath /data/db --replSet rs0 --fork --logpath /var/log/mongodb/mongod.log
```

- Для третьего сервера с IP адресом 192.168.0.3 и портом 27019, создайте файл с именем server3.sh и вставьте в него следующий код:

```bash
#!/bin/bash

# Установить mongodb из официального репозитория
wget -qO - [1] | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] [2] $(lsb_release -cs) mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Создать папку для хранения данных для узла
sudo mkdir -p /data/db

# Запустить узел с указанным IP адресом, портом, папкой для данных, именем реплики и лог файлом
sudo mongod --bind_ip 192.168.0.3 --port 27019 --dbpath /data/db --replSet rs0 --fork --logpath /var/log/mongodb/mongod.log
```

- Для запуска этих файлов, вам нужно сделать их исполняемыми и выполнить их с правами sudo. Например, для первого сервера, вы можете выполнить следующие команды в терминале:

```bash
# Сделать файл исполняемым
chmod +x server1.sh

# Выполнить файл с правами sudo
sudo ./server1.sh
```

#### Внимание: запустив первый этот ./server1.sh, вы не получите ошибку, так как инициация набора реплик не зависит от того, запущены ли другие узлы. Вы можете инициировать набор реплик с одним узлом, а затем добавлять другие узлы по мере их запуска. Однако, если вы попытаетесь подключиться к набору реплик с другого сервера, пока другие узлы не запущены, вы можете получить ошибку, так как набор реплик не сможет выбрать первичный узел, поэтому аналогично, для второго и третьего серверов, вы должны выполнить следующие команды в терминале:

```bash
# Сделать файл исполняемым
chmod +x server2.sh

# Выполнить файл с правами sudo
sudo ./server2.sh
```

```bash
# Сделать файл исполняемым
chmod +x server3.sh

# Выполнить файл с правами sudo
sudo ./server3.sh
```

- После запуска этих файлов, у вас будет кластер mongoDB на трех серверах с базой данных oustusDB и пользователем mongo-user.

## Шаг 2: Для подключения к созданной в реплике базе данных изменить код своего приложения

```javascript
// Подключаем модуль mongoose
const mongoose = require('mongoose');

// Задаем параметры подключения к базе данных
const dbHost = '127.0.0.1'; // IP адрес базы данных
const dbPort = '27017,27018,27019'; // Порты базы данных для трех узлов репликации
const dbName = 'oustusDB'; // Имя базы данных
const dbUser = 'mongo-user'; // Логин пользователя
const dbPass = 'mypass'; // Пароль пользователя
const dbReplicaSet = 'rs0'; // Имя набора реплик

// Формируем строку подключения к базе данных с использованием набора реплик
const connectionString = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?replicaSet=${dbReplicaSet}`;

// Подключаемся к базе данных mongoDB с использованием модуля mongoose
mongoose.connect(connectionString, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        console.log('Подключились к mongoDB');

        // Создаем схему для коллекции places
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
                },
                index: true // Создать индекс по умолчанию - это позволит ускорить поиск и запросы по этому полю
            },
            description: String // Новое поле
        });

        // Создаем модель для коллекции places
        const Place = mongoose.model('Place', placeSchema);

        // Создаем индекс для поля location
        Place.createIndexes({ location: '2dsphere' })
            .then((indexResult) => {
                // Выводим имя индекса в консоль
                console.log(`Created or updated index ${indexResult} on places collection`);
            })
            .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));

```

## Реализация этого подхода с набором реплик позволяет получить следующие преимущества:

- Высокая доступность данных, так как в случае сбоя одного из узлов, другие узлы могут продолжать обслуживать запросы
- Нет времени простоя для обслуживания, так как можно выполнять резервное копирование, перестроение индекса и уплотнение данных без остановки работы набора реплик
- Масштабирование чтения, так как можно распределять нагрузку на чтение между вторичными узлами
- Улучшение производительности записи, так как можно использовать разные уровни согласованности данных
