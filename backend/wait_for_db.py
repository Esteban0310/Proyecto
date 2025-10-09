import time
import mysql.connector
from mysql.connector import Error
import os

DB_HOST = os.getenv("MYSQL_HOST", "db")
DB_USER = os.getenv("MYSQL_USER", "proyecto_user")
DB_PASS = os.getenv("MYSQL_PASSWORD", "proyecto_pass")
DB_NAME = os.getenv("MYSQL_DB", "proyecto_clinico")

print("Esperando a que la base de datos esté lista...")

while True:
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        if connection.is_connected():
            print("Base de datos lista!")
            connection.close()
            break
    except Error:
        print("Base de datos no lista, esperando 2 segundos...")
        time.sleep(2)
