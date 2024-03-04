Для подключения к **MongoDB** через **Kubernetes** **Lens** и создания базы данных и пользователя следуйте этим шагам:

1. **Добавление MongoDB в Lens**:
    - Запустите **Lens** и добавьте ваш **Kubernetes** кластер в приложение.
    - В меню **Lens** найдите ваш кластер и перейдите к нему.

2. **Создание базы данных**:
    - В разделе **Workloads** или **StatefulSets** найдите **MongoDB StatefulSet**.
    - Если его нет, создайте новый **StatefulSet**, используя YAML-файл
    - 
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
spec:
  replicas: 3
  serviceName: mongodb
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo:latest
          ports:
            - containerPort: 27017
          command:
            - "/bin/sh"
            - "-c"
          args:
            - "mongod --oplogSize 128 --replSet rs0 --bind_ip_all && mongo --eval \"rs.initiate()\""
          volumeMounts:
            - name: mongo-persistent-storage
              mountPath: /data/db
  volumeClaimTemplates:
    - metadata:
        name: mongo-persistent-storage
      spec:
        accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: 2Gi

```
    - Примените конфигурацию 

3. **Создание пользователя**:
    - Подключитесь к одному из подов **MongoDB** в вашем **StatefulSet**.
    - Используйте **MongoDB Shell (mongosh)** или другой способ для взаимодействия с базой данных.
    - Создайте пользователя с помощью команды, например:
      ```bash
      use otusbotdb
      db.createUser({
        user: "mongo-user",
        pwd: "password",
        roles: [{ role: "readWrite", db: "mydb" }]
      })
      ```

