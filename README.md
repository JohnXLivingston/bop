# bop

Bop Open Planning

## Prerequisite

- Mysql or MariaDB with InnoDB enabled, character set utf8mb4 available. You have to create a database yourself.

## Running unit tests

- Warning: the redis db 0 will be used. All keys will be prefixed by 'bop_test-'.
- You have to create a mariadb test database:
  - mysql -uroot
  - mysql> CREATE DATABASE bop_test;
  - mysql> CREATE USER 'bop_test'@'localhost' IDENTIFIED by 'bop';
  - mysql> GRANT ALL ON bop_test.* TO 'bop_test'@'localhost';
  - mysql> FLUSH PRIVILEGES;
