请为高考志愿填报辅助平台设计一个简化版开发方案，聚焦『专业解读』和『学长学姐说』两大核心模块，开发周期为5天。技术栈要求：前端采用 HTML + CSS + 原生 JavaScript（使用 Bootstrap 5 的 Carousel 组件实现首页轮播图），网页整体风格多元、现代、富有亲和力。需包含以下内容：

1. **技术路线**
   - 前端：HTML5 + CSS3 + 原生 JS
   - 样式框架：使用 [Bootstrap 5](https://getbootstrap.com/) 提升响应式布局效率
   - 首页设计：采用轮播图展示“热门专业推荐”、“学长寄语”、“选专业小贴士”等内容
   - 页面结构：首页 + 专业列表页 + 专业详情页 + 学长评论提交页

2. **首页功能建议**
   - **导航栏**：固定顶部导航栏，支持页面跳转
   - **轮播图（Banner）**：展示平台亮点内容（如热门专业、真实评价、报考建议）
   - **欢迎介绍区**：简洁有力的文案说明平台作用
   - **推荐专业展示区**：以卡片形式展示几个热门专业（名称+简介+链接）
   - **学长精选评论展示区**：展示几条精选用户评论，增强信任感
   - **底部信息栏**：显示项目来源、开发者信息等

3. **核心功能清单**
   - 专业列表展示：静态页面展示多个专业（可点击查看详情）
   - 专业详情页：展示某专业的详细描述、课程设置、就业方向
   - 学长学姐说模块：
     - 用户可在详情页填写昵称并提交评论
     - 提交后评论实时显示在该页面下方（无需数据库，仅用 JS 模拟）

4. **首页轮播图示例代码（HTML + Bootstrap）**
```html
<div id="homeCarousel" class="carousel slide" data-bs-ride="carousel">
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="images/banner-major.jpg" class="d-block w-100" alt="热门专业推荐">
      <div class="carousel-caption d-none d-md-block">
        <h3>热门专业推荐</h3>
        <p>了解哪些专业正在成为未来的风口！</p>
      </div>
    </div>
    <div class="carousel-item">
      <img src="images/banner-comment.jpg" class="d-block w-100" alt="学长学姐说">
      <div class="carousel-caption d-none d-md-block">
        <h3>听听他们怎么说</h3>
        <p>来自真实学生的专业体验分享。</p>
      </div>
    </div>
    <div class="carousel-item">
      <img src="images/banner-tips.jpg" class="d-block w-100" alt="选专业小贴士">
      <div class="carousel-caption d-none d-md-block">
        <h3>选专业小贴士</h3>
        <p>兴趣匹配、未来规划、学习难度三者兼顾。</p>
      </div>
    </div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
  </button>
</div>
```

5. **开发日程建议**
| 时间 | 任务 |
|------|------|
| Day 1 | 搭建基础 HTML 结构，引入 Bootstrap 和样式资源，完成首页轮播图和导航栏 |
| Day 2 | 设计并实现专业列表页与详情页，添加专业卡片展示逻辑 |
| Day 3 | 实现“学长学姐说”模块，包括评论表单提交与动态展示（模拟数据） |
| Day 4 | 优化页面交互效果，添加过渡动画、响应式适配、滚动加载等细节 |
| Day 5 | 测试修复，美化首页内容，整理文档，打包部署 |

6. **视觉与交互建议**
- 使用蓝色/绿色为主色调，体现理性与成长
- 使用卡片式布局提升内容层次感
- 加入简单动画（如 fade-in、slide-up）提升用户体验
- 所有图片使用占位图或免费图库素材（如 Unsplash、Pexels）

7. **扩展提示（可选）**
- 若时间允许，可加入搜索框实现首页关键词搜索专业功能
- 可添加“返回顶部”按钮提升移动端体验
- 可使用图标库（如 Font Awesome）增强视觉表现力

---

**输出要求：**
请以清晰的格式输出完整的开发指南，包括首页 HTML 模板、CSS 样式、JavaScript 动态逻辑示例、页面结构说明以及开发建议，适合计算机专业学生期末大作业使用，代码片段可直接复制运行，界面美观且易于扩展。

--- 
