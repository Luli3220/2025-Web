import csv
import mysql.connector
from mysql.connector import Error

def connect_to_database():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='123456',
            database='majors_db',
            charset='utf8mb4'
        )
        if connection.is_connected():
            print('成功连接到数据库')
            return connection
    except Error as e:
        print(f'连接数据库时出错: {e}')
        return None

def import_majors(connection):
    try:
        cursor = connection.cursor()
        
        # 读取CSV文件
        with open('e:\\Web大作业\\爬虫\\专业信息.csv', 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # 插入新记录
                insert_query = """
                INSERT INTO majors (major_name, summary) 
                VALUES (%s, %s)
                """
                cursor.execute(insert_query, (
                    row['专业名称'], 
                    row['专业简介']
                ))
                print(f"已导入专业 '{row['专业名称']}'")
        
        connection.commit()
        print("专业信息导入完成")
        
    except Exception as e:
        print(f"导入专业信息时出错: {e}")
        connection.rollback()

def main():
    connection = connect_to_database()
    if connection:
        try:
            import_majors(connection)
        finally:
            connection.close()
            print('数据库连接已关闭')

if __name__ == "__main__":
    main()