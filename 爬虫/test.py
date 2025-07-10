import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


def fetch_html_content(base_url, html_path):
    """
    根据 base_url 和 html_path 拼接完整 URL，
    请求页面并提取其中的文本内容。
    """
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

            # 提取正文中的所有段落 <p>
            paragraphs = soup.find_all('p')
            print(f"从 {full_url} 提取到的内容如下：\n")
            for p in paragraphs:
                text = p.get_text(strip=True)
                if text:  # 只打印非空段落
                    print(text)

            # 如果需要提取标题等信息也可以加上
            title = soup.title.string.strip() if soup.title else "无标题"
            print("\n页面标题：", title)

        else:
            print(f"请求失败，状态码：{response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"网络请求出错：{e}")
    except Exception as e:
        print(f"发生异常：{e}")


# 示例调用
if __name__ == "__main__":
    base_url = "https://gaokao.chsi.com.cn "
    html_path = "/gkxx/zybk/zt/201704/20170406/1595131118.html"

    fetch_html_content(base_url, html_path)