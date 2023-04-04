Here are the steps to install PgBouncer in Docker:

1. Pull the prebuilt image from the Docker Hub Registry using this command:
```
docker pull bitnami/pgbouncer:latest
```
2. Create a new directory for your configuration files and create a new file named `pgbouncer.ini` with the following contents:
```
[databases]
* = host=<your_postgres_host> port=<your_postgres_port>

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /app/conf/userlist.txt
logfile = /app/logs/pgbouncer.log
pidfile = /app/pid/pgbouncer.pid
```
3. Create a new file named `userlist.txt` with the following contents:
```
"<your_postgres_user>" "<your_postgres_password>"
```
4. Run PgBouncer using this command:
```
docker run -d --name pgbouncer -p 6432:6432 --restart always -v <path_to_your_config_files_directory>:/app/conf bitnami/pgbouncer:latest
```

You can also use Docker Compose to run PgBouncer and PostgreSQL together. Here is an example of a `docker-compose.yml` file that you can use:
```
version: '3'
services:
  pgbouncer:
    image: bitnami/pgbouncer:latest
    ports:
      - "6432:6432"
    volumes:
      - ./pgbouncer.ini:/app/conf/pgbouncer.ini
      - ./userlist.txt:/app/conf/userlist.txt
    restart: always
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_USER: <your_postgres_user>
      POSTGRES_PASSWORD: <your_postgres_password>
      POSTGRES_DB: <your_postgres_database>
    volumes:
      - ./data:/var/lib/postgresql/data
    restart: always
```

I hope this helps! Let me know if you have any other questions.

Source: Conversation with Bing, 4/2/2023(1) PgBouncer packaged by Bitnami - Docker. https://hub.docker.com/r/bitnami/pgbouncer/ Accessed 4/2/2023.
(2) connect pgbouncer and postgres running with docker. https://stackoverflow.com/questions/59423189/connect-pgbouncer-and-postgres-running-with-docker Accessed 4/2/2023.
(3) PgBouncer Docker image. https://hub.docker.com/r/edoburu/pgbouncer/ Accessed 4/2/2023.
(4) PgBouncer Docker image - GitHub. https://github.com/edoburu/docker-pgbouncer Accessed 4/2/2023.