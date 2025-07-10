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

def update_majors(connection):
    try:
        cursor = connection.cursor()
        
        # 读取CSV文件
        with open('e:\\Web大作业\\爬虫\\专业信息.csv', 'r', encoding='utf-8') as file:
            # 直接指定列名
            csv_reader = csv.reader(file)
            next(csv_reader)  # 跳过标题行
            
            for row in csv_reader:
                # 更新现有记录
                update_query = """
                UPDATE majors 
                SET summary = %s 
                WHERE major_name = %s
                """
                cursor.execute(update_query, (
                    row[1],  # 专业简介在第二列
                    row[0]   # 专业名称在第一列
                ))
                if cursor.rowcount > 0:
                    print(f"已更新专业 '{row[0]}' 的简介")
                else:
                    print(f"未找到专业 '{row[0]}'")
        
        connection.commit()
        print("专业简介更新完成")
        
    except Exception as e:
        print(f"更新专业简介时出错: {e}")
        connection.rollback()

def main():
    connection = connect_to_database()
    if connection:
        try:
            update_majors(connection)
        finally:
            connection.close()
            print('数据库连接已关闭')

if __name__ == "__main__":
    main()