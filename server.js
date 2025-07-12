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
  const excludePaths = ['/login.html', '/api/login', '/api/register', '/api/stats'];
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

// 论坛API - 获取所有帖子
app.get('/api/forum/posts', (req, res) => {
  const categoryId = req.query.category_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  
  let countQuery = `
    SELECT COUNT(*) as total
    FROM forum_posts p
    JOIN users u ON p.user_id = u.user_id
    JOIN major_categories c ON p.category_id = c.category_id
  `;
  
  let dataQuery = `
    SELECT p.*, u.nickname as name, u.school, u.major, c.category_name 
    FROM forum_posts p
    JOIN users u ON p.user_id = u.user_id
    JOIN major_categories c ON p.category_id = c.category_id
  `;
  
  // 如果指定了分类，添加筛选条件
  if (categoryId) {
    countQuery += ` WHERE p.category_id = ? `;
    dataQuery += ` WHERE p.category_id = ? `;
  }
  
  dataQuery += ` ORDER BY p.post_time DESC LIMIT ? OFFSET ?`;
  
  // 先获取总数，再获取分页数据
  if (categoryId) {
    connection.query(countQuery, [categoryId], (err, countResults) => {
      if (err) {
        console.error('获取帖子总数失败:', err);
        return res.status(500).json({ error: '服务器错误' });
      }
      
      const total = countResults[0].total;
      const totalPages = Math.ceil(total / limit);
      
      connection.query(dataQuery, [categoryId, limit, offset], (err, results) => {
        if (err) {
          console.error('获取帖子失败:', err);
          return res.status(500).json({ error: '服务器错误' });
        }
        res.json({
          posts: results,
          total: total,
          totalPages: totalPages,
          page: page,
          limit: limit
        });
      });
    });
  } else {
    connection.query(countQuery, (err, countResults) => {
      if (err) {
        console.error('获取帖子总数失败:', err);
        return res.status(500).json({ error: '服务器错误' });
      }
      
      const total = countResults[0].total;
      const totalPages = Math.ceil(total / limit);
      
      connection.query(dataQuery, [limit, offset], (err, results) => {
        if (err) {
          console.error('获取帖子失败:', err);
          return res.status(500).json({ error: '服务器错误' });
        }
        res.json({
          posts: results,
          total: total,
          totalPages: totalPages,
          page: page,
          limit: limit
        });
      });
    });
  }
});

// 论坛API - 发布新帖子
app.post('/api/forum/posts', (req, res) => {
  // 检查用户是否已登录
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }
  
  const { content, category_id } = req.body;
  const userId = req.session.user.user_id;
  
  // 验证内容
  if (!content) {
    return res.status(400).json({ success: false, message: '帖子内容不能为空' });
  }
  
  // 如果没有提供分类，默认使用第一个分类（哲学）
  const categoryId = category_id || 1;
  
  // 插入帖子
  const query = `
    INSERT INTO forum_posts (user_id, name, school, major, category_id, content) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  connection.query(
    query, 
    [userId, req.session.user.nickname, req.session.user.school, req.session.user.major, categoryId, content], 
    (err, results) => {
      if (err) {
        console.error('发布帖子失败:', err);
        return res.status(500).json({ success: false, message: '服务器错误' });
      }
      
      res.json({ success: true, message: '发布成功', postId: results.insertId });
    }
  );
}
);

// API 路由 - 获取统计数据
app.get('/api/stats', (req, res) => {
  // 查询专业数量
  const majorsQuery = 'SELECT COUNT(*) as count FROM majors';
  // 查询帖子数量
  const postsQuery = 'SELECT COUNT(*) as count FROM forum_posts';
  // 查询用户数量
  const usersQuery = 'SELECT COUNT(*) as count FROM users';
  
  // 执行专业数量查询
  connection.query(majorsQuery, (err, majorsResults) => {
    if (err) {
      console.error('查询专业数量失败:', err);
      return res.status(500).json({ error: '服务器错误' });
    }
    
    // 执行帖子数量查询
    connection.query(postsQuery, (err, postsResults) => {
      if (err) {
        console.error('查询帖子数量失败:', err);
        return res.status(500).json({ error: '服务器错误' });
      }
      
      // 执行用户数量查询
      connection.query(usersQuery, (err, usersResults) => {
        if (err) {
          console.error('查询用户数量失败:', err);
          return res.status(500).json({ error: '服务器错误' });
        }
        
        // 返回所有统计数据
        res.json({
          "majorsCount": majorsResults[0].count,
          "postsCount": postsResults[0].count,
          "usersCount": usersResults[0].count
        });
      });
    });
  });
});

// 论坛API - 添加评论
app.post('/api/forum/posts/:postId/comments', (req, res) => {
  // 检查用户是否已登录
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }
  
  const postId = req.params.postId;
  const { content } = req.body;
  const userId = req.session.user.user_id;
  
  // 验证内容
  if (!content) {
    return res.status(400).json({ success: false, message: '评论内容不能为空' });
  }
  
  // 首先获取当前帖子
  connection.query('SELECT comments FROM forum_posts WHERE post_id = ?', [postId], (err, results) => {
    if (err) {
      console.error('获取帖子失败:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: '帖子不存在' });
    }
    
    // 解析现有评论
    let comments = [];
    if (results[0].comments) {
      try {
        comments = JSON.parse(results[0].comments);
      } catch (e) {
        console.error('解析评论失败:', e);
        comments = [];
      }
    }
    
    // 添加新评论
    const newComment = {
      user_id: userId,
      name: req.session.user.nickname,
      content: content,
      time: new Date().toISOString()
    };
    
    comments.push(newComment);
    
    // 更新帖子评论
    const updateQuery = 'UPDATE forum_posts SET comments = ? WHERE post_id = ?';
    connection.query(updateQuery, [JSON.stringify(comments), postId], (err, updateResult) => {
      if (err) {
        console.error('添加评论失败:', err);
        return res.status(500).json({ success: false, message: '服务器错误' });
      }
      
      res.json({ success: true, message: '评论成功' });
    });
  });
});
  