import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
import csv
import time
import os

def load_major_urls_from_json(json_file):
    """从JSON文件中加载专业URL信息"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 提取所有专业信息
        major_info_list = []
        
        # 遍历学科门类
        for xkml in data.get("xkmlList", []):
            xkml_name = xkml.get("xkmlName", "")
            
            # 遍历专业列表
            for zy in xkml.get("xkzyList", []):
                zy_name = zy.get("zymc", "")
                zy_link = zy.get("zylj", "")
                
                major_info_list.append({
                    "专业名": zy_name,
                    "学科门类": xkml_name,
                    "链接": zy_link
                })
                print(f"加载专业: {zy_name} ({xkml_name}) - {zy_link}")
        
        return major_info_list
    
    except Exception as e:
        print(f"加载专业URL失败: {str(e)}")
        return []

def fetch_major_content(base_url, html_path):
    """获取专业页面内容，使用与test.py相同的方法"""
    full_url = urljoin(base_url.strip(), html_path.strip())

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    }

    try:
        response = requests.get(full_url, headers=headers, timeout=10)
        response.encoding = 'utf-8'  # 设置编码以避免乱码

        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')

            # 去除 script、style 等非正文内容
            for script_or_style in soup(['script', 'style', 'noscript']):
                script_or_style.decompose()

            # 提取标题
            title = soup.title.string.strip() if soup.title else "无标题"
            
            # 提取正文中的所有段落 <p>，与test.py保持一致
            paragraphs = soup.find_all('p')
            content_list = []
            for p in paragraphs:
                text = p.get_text(strip=True)
                if text:  # 只收集非空段落
                    content_list.append(text)
            
            # 将所有段落内容合并为一个字符串
            content = "\n".join(content_list)
            
            # 尝试从内容中提取专业解析、就业前景和报考指南
            # 这里使用简单的关键词匹配方法
            major_analysis = ""
            employment_prospects = ""
            application_guide = ""
            
            for paragraph in content_list:
                if "专业解析" in paragraph or "专业介绍" in paragraph or "专业概况" in paragraph:
                    major_analysis += paragraph + "\n"
                elif "就业" in paragraph or "职业" in paragraph or "前景" in paragraph:
                    employment_prospects += paragraph + "\n"
                elif "报考" in paragraph or "考试" in paragraph or "指南" in paragraph:
                    application_guide += paragraph + "\n"
            
            # 如果没有找到特定部分，尝试从页面结构中查找
            if not major_analysis and not employment_prospects and not application_guide:
                # 查找可能包含这些信息的标题
                headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                for heading in headings:
                    heading_text = heading.get_text(strip=True)
                    if "专业解析" in heading_text or "专业介绍" in heading_text:
                        # 获取该标题后的内容
                        next_content = []
                        for sibling in heading.find_next_siblings():
                            if sibling.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                                break
                            if sibling.name == 'p':
                                next_content.append(sibling.get_text(strip=True))
                        major_analysis = "\n".join(next_content)
                    
                    elif "就业" in heading_text or "前景" in heading_text:
                        next_content = []
                        for sibling in heading.find_next_siblings():
                            if sibling.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                                break
                            if sibling.name == 'p':
                                next_content.append(sibling.get_text(strip=True))
                        employment_prospects = "\n".join(next_content)
                    
                    elif "报考" in heading_text or "指南" in heading_text:
                        next_content = []
                        for sibling in heading.find_next_siblings():
                            if sibling.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                                break
                            if sibling.name == 'p':
                                next_content.append(sibling.get_text(strip=True))
                        application_guide = "\n".join(next_content)
            
            return {
                "标题": title,
                "专业解析": major_analysis.strip(),
                "就业前景": employment_prospects.strip(),
                "报考指南": application_guide.strip(),
                "完整内容": content,
                "链接": full_url
            }
        else:
            print(f"请求失败，状态码：{response.status_code}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"网络请求出错：{e}")
        return None
    except Exception as e:
        print(f"发生异常：{e}")
        return None

def save_to_csv(major_details, output_file):
    """保存专业信息到CSV文件"""
    try:
        with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
            # 定义CSV表头
            fieldnames = ['专业名', '学科门类', '专业解析', '就业前景', '报考指南', '完整内容', '链接']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            
            # 写入表头
            writer.writeheader()
            
            # 写入数据
            writer.writerows(major_details)
            
        print(f"数据已保存到: {output_file}")
    
    except Exception as e:
        print(f"保存CSV文件失败: {str(e)}")

def ensure_directory(directory):
    """确保目录存在，如果不存在则创建"""
    if not os.path.exists(directory):
        os.makedirs(directory)

def main():
    # 基础URL
    base_url = "https://gaokao.chsi.com.cn"
    
    # JSON文件路径
    json_file = "e:\\Web大作业\\爬虫\\url.json"
    
    # 输出目录
    output_dir = "e:\\Web大作业\\爬虫\\专业数据"
    ensure_directory(output_dir)
    
    # 加载专业URL
    print("正在加载专业URL...")
    major_infos = load_major_urls_from_json(json_file)
    print(f"共加载 {len(major_infos)} 个专业URL")
    
    # 爬取所有专业详情
    all_majors = []
    for i, major_info in enumerate(major_infos):
        print(f"正在爬取 ({i+1}/{len(major_infos)}): {major_info['专业名']} - {major_info['链接']}")
        
        # 获取专业详细内容
        major_content = fetch_major_content(base_url, major_info['链接'])
        
        if major_content:
            # 合并专业信息
            major_detail = {
                "专业名": major_info['专业名'],
                "学科门类": major_info['学科门类'],
                "专业解析": major_content['专业解析'],
                "就业前景": major_content['就业前景'],
                "报考指南": major_content['报考指南'],
                "完整内容": major_content['完整内容'],
                "链接": major_content['链接']
            }
            
            all_majors.append(major_detail)
            print(f"成功获取: {major_detail['专业名']}")
        
        # 添加延时，避免请求过于频繁
        time.sleep(1)
    
    # 按学科门类分组保存专业信息
    if all_majors:
        # 保存总的CSV文件
        output_file = os.path.join(output_dir, "专业详情_全部.csv")
        save_to_csv(all_majors, output_file)
        
        # 按学科门类分组
        majors_by_category = {}
        for major in all_majors:
            category = major['学科门类']
            if category not in majors_by_category:
                majors_by_category[category] = []
            majors_by_category[category].append(major)
        
        # 保存分类CSV文件
        for category, majors in majors_by_category.items():
            category_file = os.path.join(output_dir, f"专业详情_{category}.csv")
            save_to_csv(majors, category_file)
            print(f"已保存{category}专业信息到: {category_file}")
    else:
        print("未获取到任何专业信息")

if __name__ == "__main__":
    main()