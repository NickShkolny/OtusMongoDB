# Как установить и настроить MongoDB 5.0 в докере на Ubuntu 20.04

## Шаг 1: Установите докер на вашем сервере

Для установки докер на Ubuntu 20.04, выполните следующие команды в терминале:

```bash
sudo apt update
sudo apt install docker.io
sudo systemctl enable --now docker
```

Проверьте, что докер успешно установлен и запущен:

```bash
sudo docker --version
sudo docker ps
```

## Шаг 2: Запустите контейнер с MongoDB 5.0

Для запуска контейнера с MongoDB 5.0, выполните следующую команду в терминале:

```bash
sudo docker run -d --name mongo -p 27018:27017 mongo:5.0
```

Эта команда скачает образ mongo:5.0 с Docker Hub и запустит его в фоновом режиме с именем mongo2 (так как одна mongoDB локально уже запущена). Также она пробросит порт 27017 с контейнера на хост, чтобы вы могли подключаться к MongoDB с вашего сервера.

Проверьте, что контейнер успешно запущен:

```bash
sudo docker ps
```

Вы должны увидеть что-то вроде этого:

```bashCONTAINER ID   IMAGE       COMMAND                  CREATED              STATUS              PORTS                                           NAMES
       f15822542ed0   mongo:5.0   "docker-entrypoint.s…"   27 seconds ago   Up 26 seconds   0.0.0.0:27018->27017/tcp, :::27018->27017/tcp   mongo

```

## Шаг 3: Подключитесь к MongoDB в контейнере

Для подключения к MongoDB в контейнере, выполните следующую команду в терминале:

```bash
sudo docker exec -it mongo mongo
```

Эта команда запустит интерактивную сессию mongo shell внутри контейнера mongo. Вы должны увидеть что-то вроде этого:

```bash
MongoDB shell version v5.0.25 
connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb 
Implicit session: session { "id" : UUID("97c04e11-6364-4ea5-872a-05e0521a321f") }
MongoDB server version: 5.0.25
================
Warning: the "mongo" shell has been superseded by "mongosh", 
which delivers improved usability and compatibility.The "mongo" shell has been deprecated and will be removed in
an upcoming release.
For installation instructions, see
https://docs.mongodb.com/mongodb-shell/install/
================
Welcome to the MongoDB shell.

>
```

## Шаг 4: Создайте базу данных и пользователя для нее

Для создания базы данных и пользователя для нее, выполните следующие команды в mongo shell:

```bash
use otusbot
db.createUser({user: "mongo-user-bot", pwd: "mypass", roles: ["readWrite"]})
```

Эти команды переключат вас на базу данных otusbot, если она существует, или создадут ее, если нет. Затем они создадут пользователя mongo-user-bot с паролем mypass и ролью readWrite, которая дает ему права на чтение и запись в эту базу данных.

Проверьте, что пользователь успешно создан:

```bash
db.getUsers()
```

Вы должны увидеть что-то вроде этого:

```bash
[
        {
                "_id" : "otusbot.mongo-user-bot",
                "userId" : UUID("a0a912c7-d72c-4322-92eb-0163b5eacd82"),
                "user" : "mongo-user-bot",
                "db" : "otusbot",
                "roles" : [
                        {
                                "role" : "readWrite",
                                "db" : "otusbot"
                        }
                ],
                "mechanisms" : [
                        "SCRAM-SHA-1",
                        "SCRAM-SHA-256"
                ]
        }
]
```

## Шаг 5: Выйдите из mongo shell и включите аутентификацию

Для выхода из mongo shell, выполните следующую команду:

```bash
exit
```

Для включения аутентификации, вам нужно остановить контейнер mongo и запустить его снова с параметром --auth. Выполните следующие команды в терминале:

```bash
sudo docker stop mongo
sudo docker run -d --name mongo -p 27018:27017 mongo:5.0 --auth
```

Проверьте, что контейнер успешно запущен с аутентификацией:

```bash
sudo docker ps
```

Вы должны увидеть что-то вроде этого:

```bash
CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                      NAMES
c29db5687290   mongo:5.0      "docker-entrypoint.s…"   4 seconds ago   Up 3 seconds   0.0.0.0:27017->27017/tcp   mongo
```

## Шаг 6: Подключитесь к MongoDB с пользователем и паролем

Для подключения к MongoDB с пользователем и паролем, выполните следующую команду в терминале:

```bash
sudo docker exec -it mongo mongo -u mongo-user-bot -p mypass --authenticationDatabase otusbot
```

Эта команда запустит интерактивную сессию mongo shell внутри контейнера mongo с аутентификацией по имени пользователя, паролю и базе данных. Вы должны увидеть что-то вроде этого:

```bash
MongoDB shell version v5.0.0
connecting to: mongodb://127.0.0.1:27017/?authSource=otusbot&compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("63c00e27-1952-85e8-27d4-8908") }
MongoDB server version: 5.0.0
---
The server generated these startup warnings when booting:
        2024-01-12T16:51:10.132+00:00: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine. See http://dochub.mongodb.org/core/prodnotes-filesystem
        2024-01-12T16:51:10.132+00:00: Access control is enabled for the database. Read and write access to data and configuration is restricted
        2024-01-12T16:51:10.132+00:00: You are running this process as the root user, which is not recommended
        2024-01-12T16:51:10.132+00:00: This server is bound to localhost. Remote systems will be unable to connect to this server. Start the server with --bind_ip <address> to specify which IP addresses it should serve responses from, or with --bind_ip_all to bind to all interfaces. If this behavior is desired, start the server with --bind_ip 127.0.0.1 to disable this warning
---
>
```

Теперь вы можете работать с базой данных otusbot как обычно, используя mongo shell.

## Шаг 7: Подключение к MongoDB в докере на сервере в терминале ssh
Если вы хотите подключиться к MongoDB в докере с вашего локального компьютера, вам нужно убедиться, что вы пробросили порт 27017 с контейнера на хост на порт 27018,  Тогда вы сможете использовать любой клиент MongoDB, например, mongo shell или MongoDB Compass, для подключения к базе данных по адресу localhost:27018 или IP-адрес-хоста:27018, где IP-адрес-хоста - это IP-адрес вашего сервера, на котором запущен докер. Не забудьте указать имя пользователя, пароль и базу данных для аутентификации, если вы включили ее в шаге 5. Например, для подключения с mongo shell, вы можете выполнить такую команду:

```bash
mongo -u mongo-user-bot -p mypass --authenticationDatabase otusbot localhost:27018
```
## Шаг 8: Подключение из NodeJS 
### Ничего не изменилось кроме порта - как и до всех наших действий база доступна с нашего приложения по прежнему:

```javascript
// Задаем параметры подключения к базе данных
const dbHost = '127.0.0.1'; // IP адрес базы данных
const dbPort = 27018; // Порт базы данных
const dbName = 'otusbot'; // Имя базы данных
const dbUser = 'mongo-user-bot'; // Логин пользователя
const dbPass = 'mypass'; // Пароль пользователя

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
```

