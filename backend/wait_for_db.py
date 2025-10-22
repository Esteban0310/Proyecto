import time
import os
import mysql.connector
from mysql.connector import Error

DB_HOST = os.getenv("MYSQL_HOST", "db")
DB_USER = os.getenv("MYSQL_USER", "proyecto_user")
DB_PASS = os.getenv("MYSQL_PASSWORD", "proyecto_pass")
DB_NAME = os.getenv("MYSQL_DB", "proyecto_clinico")

print("⏳ Esperando a que la base de datos esté lista...", flush=True)

max_retries = 60  # Espera hasta 2 minutos (60 * 2s)
retries = 0

while True:
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        if connection.is_connected():
            print("✅ Base de datos lista y disponible!", flush=True)
            break
    except Error as e:
        retries += 1
        print(f"❌ Intento {retries}: Base de datos no lista aún ({str(e)}). Reintentando en 2s...", flush=True)
        if retries >= max_retries:
            print("🚨 No se pudo conectar a la base de datos después de varios intentos. Abortando.", flush=True)
            exit(1)
        time.sleep(2)
    finally:
        try:
            if connection and connection.is_connected():
                connection.close()
        except NameError:
            pass
