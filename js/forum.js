// 论坛页面JavaScript

// 每页显示的帖子数量
const itemsPerPage = 12;
// 当前页码
let currentPage = 1;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    checkUserLoginStatus();
    
    // 加载帖子列表
    loadPosts();
    
    // 绑定发帖表单提交事件
    document.getElementById('postForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitPost();
    });
    
    // 绑定评论提交事件
    document.getElementById('submitComment').addEventListener('click', submitComment);
    
    // 绑定分类筛选点击事件
    const categoryFilters = document.querySelectorAll('#category-filter li');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // 移除所有分类的active类
            categoryFilters.forEach(f => f.classList.remove('active'));
            // 添加当前分类的active类
            this.classList.add('active');
            
            // 获取选中的分类
            const category = this.getAttribute('data-category');
            
            // 根据分类加载帖子
            if (category === '全部') {
                currentPage = 1;
                loadPosts();
            } else {
                // 专业类别映射
                const categoryMap = {
                    '工学': 8,
                    '理学': 7,
                    '经济学': 2,
                    '医学': 10,
                    '文学': 5,
                    '法学': 3,
                    '教育学': 4,
                    '管理学': 6,
                    '艺术学': 12,
                    '农学': 9,
                    '哲学': 1,
                    '历史学': 11
                };
                currentPage = 1;
                loadPosts(categoryMap[category]);
            }
        });
    });
});

// 检查用户登录状态
function checkUserLoginStatus() {
    fetch('/api/user/current')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.user) {
                // 用户已登录，显示用户信息
                // 使用与user-session.js相同的逻辑显示用户信息
                let navbarRight = document.querySelector('.navbar-right .navbar-nav');
                if (!navbarRight) {
                    navbarRight = document.querySelector('.navbar-nav.ms-auto:last-child');
                }
                if (!navbarRight) return;

                navbarRight.innerHTML = '';

                const userDropdown = document.createElement('li');
                userDropdown.className = 'nav-item dropdown';
                
                const displayName = data.user.nickname || data.user.username;
                
                userDropdown.innerHTML = `
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <span>${displayName}</span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li class="user-info">
                            <h6 class="mb-0">${displayName}</h6>
                            <p>${data.user.school ? data.user.school : '未设置学校'}</p>
                            <div class="user-details">
                                <div class="detail-item">${data.user.major || '未设置专业'}</div>
                            </div>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item logout-btn" href="javascript:void(0);"><i class="fas fa-sign-out-alt"></i>退出登录</a></li>
                    </ul>
                `;

                navbarRight.appendChild(userDropdown);

                // 添加退出登录事件
                const logoutBtn = userDropdown.querySelector('.logout-btn');
                logoutBtn.addEventListener('click', function() {
                    fetch('/api/logout')
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                window.location.href = '/login.html';
                            }
                        })
                        .catch(error => {
                            console.error('退出登录失败:', error);
                        });
                });
            }
        })
        .catch(error => {
            console.error('获取用户信息失败:', error);
        });
}

// 当前选中的分类ID
let currentCategoryId = null;

// 加载帖子列表
function loadPosts(categoryId = null) {
    const postsContainer = document.getElementById('postsList');
    const loadingElement = document.getElementById('loadingPosts');
    const noPostsMessage = document.getElementById('noPostsMessage');
    
    // 更新当前分类ID
    currentCategoryId = categoryId;
    
    // 构建API URL
    let url = `/api/forum/posts?page=${currentPage}&limit=${itemsPerPage}`;
    if (categoryId) {
        url += `&category_id=${categoryId}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // 隐藏加载提示
            loadingElement.classList.add('d-none');
            
            // 检查数据结构
            let posts = [];
            let totalPages = 1;
            
            // 处理不同的数据结构
            if (Array.isArray(data)) {
                // 如果返回的是数组，直接使用
                posts = data;
                // 如果没有提供总页数，默认为1页
                totalPages = data.totalPages || 1;
            } else if (data.posts && Array.isArray(data.posts)) {
                // 如果返回的是包含posts数组的对象
                posts = data.posts;
                totalPages = data.totalPages || data.total_pages || Math.ceil(data.total / itemsPerPage) || 1;
            } else if (data.data && Array.isArray(data.data)) {
                // 另一种常见的API返回结构
                posts = data.data;
                totalPages = data.totalPages || data.total_pages || Math.ceil(data.total / itemsPerPage) || 1;
            } else {
                // 其他情况，尝试使用data本身
                posts = data;
                totalPages = 1;
            }
            
            if (posts.length === 0) {
                // 没有帖子，显示提示信息
                noPostsMessage.classList.remove('d-none');
                return;
            } else {
                noPostsMessage.classList.add('d-none');
            }
            
            // 清空现有内容（除了加载提示和无帖子提示）
            postsContainer.innerHTML = '';
            
            // 添加帖子到列表
            posts.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            });

            // 渲染分页
            renderPagination(totalPages);
        })
        .catch(error => {
            console.error('加载帖子失败:', error);
            loadingElement.classList.add('d-none');
            
            // 显示错误信息
            const errorElement = document.createElement('div');
            errorElement.className = 'alert alert-danger';
            errorElement.textContent = '加载帖子失败，请稍后再试';
            postsContainer.appendChild(errorElement);
        });
}

// 创建帖子元素
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'col-lg-6';
    
    // 解析评论
    let comments = [];
    try {
        comments = post.comments ? JSON.parse(post.comments) : [];
    } catch (e) {
        console.error('解析评论失败:', e);
        comments = [];
    }

    postElement.innerHTML = `
        <div class="card senior-card h-100">
            <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                    <div class="user-avatar rounded-circle me-3 d-flex align-items-center justify-content-center" 
                         style="width: 60px; height: 60px; background: linear-gradient(135deg, #4e73df 0%, #1e3fa0 100%); color: white;">
                        <span style="font-size: 24px;">${post.name ? post.name[0] : '?'}</span>
                    </div>
                    <div>
                        <h5 class="mb-0">${post.name || '匿名用户'}</h5>
                        <p class="text-muted mb-0">${post.school || '未知学校'} | ${post.major || '未知专业'}</p>
                    </div>
                </div>
                <div class="testimonial-text p-3 mb-3">
                    <p>${post.content}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <button class="btn btn-link text-decoration-none comment-btn" data-post-id="${post.post_id}">
                            <i class="far fa-comment me-1"></i>${comments.length || 0} 评论
                        </button>
                    </div>
                    <small class="text-muted">发布于 ${new Date(post.post_time).toLocaleDateString()}</small>
                </div>
                ${comments.length > 0 ? `
                    <div class="comments-section mt-3">
                        <hr>
                        <h6 class="mb-3">最新评论</h6>
                        ${comments.slice(0, 2).map(comment => `
                            <div class="comment-item mb-2">
                                <div class="d-flex align-items-center">
                                    <small class="fw-bold me-2">${comment.name}:</small>
                                    <small>${comment.content}</small>
                                </div>
                            </div>
                        `).join('')}
                        ${comments.length > 2 ? `
                            <button class="btn btn-link btn-sm text-decoration-none p-0">
                                查看全部 ${comments.length} 条评论
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // 绑定评论按钮事件
    const commentBtn = postElement.querySelector('.comment-btn');
    if (commentBtn) {
        commentBtn.addEventListener('click', () => {
            const postId = commentBtn.getAttribute('data-post-id');
            openCommentModal(postId);
        });
    }

    return postElement;
}

// 提交新帖子
function submitPost() {
    // 获取表单数据
    const content = document.getElementById('postContent').value.trim();
    const categoryId = document.getElementById('postCategory')?.value;
    
    if (!content) {
        alert('请输入帖子内容');
        return;
    }
    
    if (!categoryId) {
        alert('请选择专业类别');
        return;
    }
    
    // 发送请求
    fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, category_id: categoryId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 发帖成功，清空表单
            document.getElementById('postContent').value = '';
            document.getElementById('postCategory').selectedIndex = 0;
            
            // 重新加载帖子列表
            loadPosts(currentCategoryId);
            
            // 显示成功消息
            alert('发布成功！');
        } else {
            alert(data.message || '发布失败，请稍后再试');
        }
    })
    .catch(error => {
        console.error('发布帖子失败:', error);
        alert('发布失败，请稍后再试');
    });
}

// 打开评论模态框
function openCommentModal(postId) {
    // 设置当前评论的帖子ID
    document.getElementById('commentPostId').value = postId;
    
    // 清空评论内容
    document.getElementById('commentContent').value = '';
    
    // 显示模态框
    const commentModal = new bootstrap.Modal(document.getElementById('commentModal'));
    commentModal.show();
}

// 提交评论
function submitComment() {
    // 获取评论数据
    const postId = document.getElementById('commentPostId').value;
    const content = document.getElementById('commentContent').value.trim();
    
    if (!content) {
        alert('请输入评论内容');
        return;
    }
    
    // 发送请求
    fetch(`/api/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 评论成功，关闭模态框
            const commentModal = bootstrap.Modal.getInstance(document.getElementById('commentModal'));
            commentModal.hide();
            
            // 重新加载帖子列表
            loadPosts(currentCategoryId);
        } else {
            alert(data.message || '评论失败，请稍后再试');
        }
    })
    .catch(error => {
        console.error('提交评论失败:', error);
        alert('评论失败，请稍后再试');
    });
}

// 渲染分页
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');

    let html = '';

    // 上一页按钮
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-disabled="${currentPage === 1}">上一页</a>
        </li>
    `;

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        } else if (
            i === currentPage - 2 ||
            i === currentPage + 2
        ) {
            html += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`;
        }
    }

    // 下一页按钮
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-disabled="${currentPage === totalPages}">下一页</a>
        </li>
    `;

    pagination.innerHTML = html;

    // 添加分页事件监听
    document.querySelectorAll('#pagination .page-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            if (this.getAttribute('aria-disabled') === 'true') return;

            currentPage = parseInt(this.getAttribute('data-page'));
            loadPosts(currentCategoryId);

            // 滚动到专业列表顶部
            document.querySelector('.search-bl').scrollIntoView({ behavior: 'smooth' });
        });
    });
}