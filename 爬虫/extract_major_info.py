import csv
import re

def extract_major_info(file_path):
    """从文本文件中提取专业信息"""
    majors = []
    current_major = None
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
        for line in lines:
            line = line.strip()
            if not line:  # 跳过空行
                continue
                
            # 检查是否是专业名（以###开头）
            if line.startswith('###'):
                current_major = line.replace('###', '').strip()
            # 如果不是专业名且存在当前专业，则为专业简介
            elif current_major:
                majors.append({
                    '专业名称': current_major,
                    '专业简介': line
                })
                current_major = None
    
    return majors

def save_to_csv(majors, output_file):
    """保存专业信息到CSV文件"""
    try:
        with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
            # 定义CSV表头
            fieldnames = ['专业名称', '专业简介']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            
            # 写入表头
            writer.writeheader()
            
            # 写入数据
            writer.writerows(majors)
            
        print(f"数据已保存到: {output_file}")
        print(f"共保存 {len(majors)} 个专业信息")
    
    except Exception as e:
        print(f"保存CSV文件失败: {str(e)}")

def main():
    # 输入和输出文件路径
    input_file = "e:\\Web大作业\\爬虫\\url.txt"
    output_file = "e:\\Web大作业\\爬虫\\专业信息.csv"
    
    # 提取专业信息
    print("正在提取专业信息...")
    majors = extract_major_info(input_file)
    
    # 保存到CSV文件
    if majors:
        save_to_csv(majors, output_file)
    else:
        print("未提取到任何专业信息")

if __name__ == "__main__":
    main()