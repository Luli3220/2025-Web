import os
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

def import_major_data(connection, csv_file_path):
    try:
        cursor = connection.cursor()
        
        # 读取CSV文件
        with open(csv_file_path, 'r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # 获取专业大类ID
                category_name = row['学科门类']
                cursor.execute("SELECT category_id FROM major_categories WHERE category_name = %s", (category_name,))
                result = cursor.fetchone()
                
                if result:
                    category_id = result[0]
                    
                    # 检查专业是否已存在
                    major_name = row['专业名']
                    cursor.execute("SELECT major_id FROM majors WHERE major_name = %s", (major_name,))
                    major_exists = cursor.fetchone()
                    
                    # 处理空值
                    summary = row.get('专业解析', '').strip() or None
                    job_prospects = row.get('就业前景', '').strip() or None
                    admission_guide = row.get('报考指南', '').strip() or None
                    full_content = row.get('完整内容', '').strip() or None
                    source_url = row.get('链接', '').strip() or None
                    
                    # 准备数据
                    major_data = {
                        'major_name': major_name,
                        'category_id': category_id,
                        'summary': summary,
                        'job_prospects': job_prospects,
                        'admission_guide': admission_guide,
                        'full_content': full_content,
                        'popularity': 50,  # 默认热度值
                        'source_url': source_url
                    }
                    
                    if major_exists:
                        # 更新现有专业
                        major_id = major_exists[0]
                        update_query = """
                        UPDATE majors SET 
                            category_id = %s,
                            summary = %s,
                            job_prospects = %s,
                            admission_guide = %s,
                            full_content = %s,
                            popularity = %s,
                            source_url = %s
                        WHERE major_id = %s AND (
                            summary IS NULL OR 
                            job_prospects IS NULL OR 
                            admission_guide IS NULL OR 
                            full_content IS NULL OR 
                            source_url IS NULL
                        )
                        """
                        cursor.execute(update_query, (
                            major_data['category_id'],
                            major_data['summary'],
                            major_data['job_prospects'],
                            major_data['admission_guide'],
                            major_data['full_content'],
                            major_data['popularity'],
                            major_data['source_url'],
                            major_id
                        ))
                        if cursor.rowcount > 0:
                            print(f"更新专业: {major_name}")
                    else:
                        # 插入新专业
                        insert_query = """
                        INSERT INTO majors (
                            major_name, category_id, summary, 
                            job_prospects, admission_guide, full_content, 
                            popularity, source_url
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """
                        cursor.execute(insert_query, (
                            major_data['major_name'],
                            major_data['category_id'],
                            major_data['summary'],
                            major_data['job_prospects'],
                            major_data['admission_guide'],
                            major_data['full_content'],
                            major_data['popularity'],
                            major_data['source_url']
                        ))
                        print(f"添加新专业: {major_name}")
                    
                    connection.commit()
                else:
                    print(f"警告: 未找到学科门类 '{category_name}'")
    
    except Exception as e:
        print(f"导入数据时出错: {e}")
        connection.rollback()

def main():
    connection = connect_to_database()
    if connection:
        try:
            csv_dir = r'e:\Web大作业\爬虫\专业数据'
            for filename in os.listdir(csv_dir):
                if filename.startswith('专业详情_') and filename.endswith('.csv'):
                    print(f'\n处理文件: {filename}')
                    file_path = os.path.join(csv_dir, filename)
                    import_major_data(connection, file_path)
        finally:
            connection.close()
            print('数据库连接已关闭')

if __name__ == "__main__":
    main()