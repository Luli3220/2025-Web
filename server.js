const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 创建数据库连接
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'majors_db',
  charset: 'utf8mb4'
});

// 连接数据库
connection.connect(err => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('成功连接到数据库');
});

// API 路由 - 获取所有专业
app.get('/api/majors', (req, res) => {
  const category = req.query.category;
  let query = `
    SELECT m.major_id, m.major_name, m.summary, c.category_name, m.source_url 
    FROM majors m
    JOIN major_categories c ON m.category_id = c.category_id
  `;
  
  if (category && category !== '全部') {
    query += ` WHERE c.category_name = ?`;
    connection.query(query, [category], (err, results) => {
      if (err) {
        console.error('查询失败:', err);
        res.status(500).json({ error: '服务器错误' });
        return;
      }
      res.json(results);
    });
  } else {
    connection.query(query, (err, results) => {
      if (err) {
        console.error('查询失败:', err);
        res.status(500).json({ error: '服务器错误' });
        return;
      }
      res.json(results);
    });
  }
});

// API 路由 - 获取专业详情
app.get('/api/majors/:id', (req, res) => {
  const majorId = req.params.id;
  const query = `
    SELECT m.*, c.category_name 
    FROM majors m
    JOIN major_categories c ON m.category_id = c.category_id
    WHERE m.major_id = ?
  `;
  
  connection.query(query, [majorId], (err, results) => {
    if (err) {
      console.error('查询失败:', err);
      res.status(500).json({ error: '服务器错误' });
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ error: '未找到该专业' });
      return;
    }
    
    res.json(results[0]);
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});

// 在现有代码中添加这个路由
app.get('/', (req, res) => {
  res.redirect('/index.html');
});