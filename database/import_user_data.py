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

def import_user_data(connection, csv_file_path):
    try:
        cursor = connection.cursor()
        
        # 禁用外键检查
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        # 清空users表
        cursor.execute("TRUNCATE TABLE users")
        print("清空users表完成")
        
        # 读取CSV文件并插入数据
        with open(csv_file_path, 'r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # 直接插入新用户
                insert_query = """
                INSERT INTO users (
                    user_id, nickname, school, major, 
                    education, username, password, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                try:
                    cursor.execute(insert_query, (
                        int(row['user_id']),
                        str(row['nickname']),
                        str(row['school']),
                        str(row['major']),
                        str(row['education']),
                        str(row['username']),
                        str(row['password']),
                        str(row['created_at'])  # 直接使用字符串，让MySQL自动转换
                    ))
                    print(f"添加新用户: {row['username']}")
                except Exception as e:
                    print(f"插入用户 {row['username']} 时出错: {e}")
                    continue
            
            connection.commit()
            print(f"成功导入所有用户数据")
        
        # 重新启用外键检查
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
                
    except Exception as e:
        print(f"导入数据时出错: {e}")
        connection.rollback()
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

def main():
    connection = connect_to_database()
    if connection:
        try:
            csv_file_path = r'e:\Web大作业\爬虫\user_data_corrected.csv'
            import_user_data(connection, csv_file_path)
            print('用户数据导入完成')
        finally:
            connection.close()
            print('数据库连接已关闭')

if __name__ == "__main__":
    main()