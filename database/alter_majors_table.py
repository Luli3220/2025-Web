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

def alter_majors_table(connection):
    try:
        cursor = connection.cursor()
        
        # 检查表结构
        cursor.execute("DESCRIBE majors")
        columns = [column[0] for column in cursor.fetchall()]
        
        # 需要添加的列
        columns_to_add = {
            'summary': 'TEXT',
            'job_prospects': 'TEXT',
            'admission_guide': 'TEXT',
            'full_content': 'TEXT',
            'popularity': 'INT DEFAULT 50',
            'source_url': 'VARCHAR(255)'
        }
        
        # 添加缺失的列
        for column_name, column_type in columns_to_add.items():
            if column_name not in columns:
                alter_query = f"ALTER TABLE majors ADD COLUMN {column_name} {column_type}"
                cursor.execute(alter_query)
                print(f"添加列: {column_name}")
        
        # 重命名已有列（如果需要）
        column_mapping = {
            'employment_prospects': 'job_prospects',
            'application_guide': 'admission_guide',
            'external_link': 'source_url'
        }
        
        for old_name, new_name in column_mapping.items():
            if old_name in columns and new_name not in columns:
                alter_query = f"ALTER TABLE majors CHANGE COLUMN {old_name} {new_name} TEXT"
                cursor.execute(alter_query)
                print(f"重命名列: {old_name} -> {new_name}")
        
        connection.commit()
        print("表结构修改完成")
        
    except Error as e:
        print(f"修改表结构时出错: {e}")
        connection.rollback()

def main():
    connection = connect_to_database()
    if connection:
        try:
            alter_majors_table(connection)
        finally:
            connection.close()
            print('数据库连接已关闭')

if __name__ == "__main__":
    main()