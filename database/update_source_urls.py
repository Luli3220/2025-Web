import json
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

def update_source_urls(connection):
    try:
        cursor = connection.cursor()
        
        # 读取url.json文件
        with open('e:\\Web大作业\\url.json', 'r', encoding='utf-8') as file:
            url_data = json.load(file)
        
        # 处理专业链接数据
        major_urls = {}
        for category in url_data['xkmlList']:
            for major in category['xkzyList']:
                major_name = major['zymc']
                url_path = major['zylj']
                full_url = f"https://gaokao.chsi.com.cn{url_path}"
                major_urls[major_name] = full_url
        
        # 更新数据库中的source_url字段
        for major_name, url in major_urls.items():
            # 处理特殊情况：有些专业名称可能在数据库中有多个匹配或略有不同
            # 使用LIKE查询以提高匹配率
            update_query = """
            UPDATE majors 
            SET source_url = %s 
            WHERE major_name = %s OR major_name LIKE %s
            """
            cursor.execute(update_query, (url, major_name, f"%{major_name}%"))
            if cursor.rowcount > 0:
                print(f"已更新专业 '{major_name}' 的外部链接")
        
        connection.commit()
        print("专业外部链接更新完成")
        
    except Exception as e:
        print(f"更新专业链接时出错: {e}")
        connection.rollback()

def main():
    connection = connect_to_database()
    if connection:
        try:
            update_source_urls(connection)
        finally:
            connection.close()
            print('数据库连接已关闭')

if __name__ == "__main__":
    main()