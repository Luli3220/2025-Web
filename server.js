const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

// 中间件设置
app.use(express.json()); // 用于解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 用于解析表单数据
app.use(cookieParser());

// 会话管理设置
app.use(session({
  secret: 'volunteer_platform_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 会话有效期1小时
}));

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 检查用户是否已登录的中间件
const checkAuth = (req, res, next) => {
  // 排除不需要登录验证的路径
  const excludePaths = ['/login.html', '/api/login', '/api/register'];
  if (excludePaths.includes(req.path) || req.path.startsWith('/css/') || req.path.startsWith('/js/') || 
      req.path.startsWith('/lib/') || req.path.startsWith('/images/')) {
    return next();
  }
  
  // 检查用户是否已登录
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  
  next();
};

// 应用认证中间件
app.use(checkAuth);

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

// 首页路由
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// 获取当前登录用户信息
app.get('/api/user/current', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: '未登录' });
  }
});

// 用户退出登录
app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: '退出成功' });
});

// 用户注册API
app.post('/api/register', (req, res) => {
  const { username, password, nickname, school, major, education } = req.body;
  
  // 简单验证
  if (!username || !password || !nickname) {
    return res.status(400).json({ success: false, message: '用户名、密码和昵称为必填项' });
  }
  
  // 检查用户名是否已存在
  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error('查询用户失败:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 插入新用户
    const insertQuery = `
      INSERT INTO users (username, password, nickname, school, major, education) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(
      insertQuery, 
      [username, password, nickname, school || null, major || null, education || null], 
      (err, results) => {
        if (err) {
          console.error('注册用户失败:', err);
          return res.status(500).json({ success: false, message: '服务器错误' });
        }
        
        res.json({ success: true, message: '注册成功' });
      }
    );
  });
});

// 用户登录API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // 简单验证
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码为必填项' });
  }
  
  // 查询用户
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('登录查询失败:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: '用户名或密码不正确' });
    }
    
    // 登录成功，返回用户信息（不包含密码）
    const user = results[0];
    delete user.password;
    
    // 将用户信息存储在会话中
    req.session.user = user;
    
    res.json({ success: true, message: '登录成功', user });
  });
});