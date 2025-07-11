// 论坛页面JavaScript

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
    
    // 绑定分类按钮点击事件
    const categoryButtons = document.querySelectorAll('.btn-outline-primary');
    categoryButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 根据按钮索引加载对应分类的帖子
            if (index === 0) {
                // 全部分类
                loadPosts();
            } else {
                // 专业类别对应的ID（根据按钮顺序和数据库中的类别ID对应）
                // 工学类对应8，计算机类也是工学类，所以使用8
                // 经济类对应2，医学类对应10，文学类对应5，法学类对应3，教育类对应4，理学类对应7，艺术类对应12
                const categoryMap = [null, 8, 2, 10, 5, 3, 4, 7, 12];
                loadPosts(categoryMap[index]);
            }
        });
    });
    
    // 加载专业类别下拉菜单
    loadCategorySelect();
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
    let url = '/api/forum/posts';
    if (categoryId) {
        url += `?category_id=${categoryId}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // 隐藏加载提示
            loadingElement.classList.add('d-none');
            
            if (data.length === 0) {
                // 没有帖子，显示提示信息
                noPostsMessage.classList.remove('d-none');
                return;
            } else {
                noPostsMessage.classList.add('d-none');
            }
            
            // 清空现有内容（除了加载提示和无帖子提示）
            const existingPosts = postsContainer.querySelectorAll('.post-item');
            existingPosts.forEach(post => post.remove());
            
            // 添加帖子到列表
            data.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            });
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
    postElement.className = 'post-item';
    postElement.dataset.postId = post.post_id;
    
    // 帖子头部（作者信息）
    const postHeader = document.createElement('div');
    postHeader.className = 'post-header';
    
    const authorInfo = document.createElement('div');
    authorInfo.className = 'd-flex justify-content-between align-items-center';
    
    const authorName = document.createElement('div');
    authorName.className = 'post-author';
    authorName.textContent = post.name;
    
    const postMeta = document.createElement('div');
    postMeta.className = 'post-meta';
    
    // 格式化日期
    const postDate = new Date(post.post_time);
    const formattedDate = postDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    postMeta.textContent = formattedDate;
    
    authorInfo.appendChild(authorName);
    authorInfo.appendChild(postMeta);
    
    // 学校和专业信息（如果有）
    const schoolMajorInfo = document.createElement('div');
    schoolMajorInfo.className = 'small text-muted mt-1';
    
    if (post.school || post.major) {
        let infoText = '';
        if (post.school) infoText += post.school;
        if (post.school && post.major) infoText += ' · ';
        if (post.major) infoText += post.major;
        schoolMajorInfo.textContent = infoText;
    }
    
    postHeader.appendChild(authorInfo);
    postHeader.appendChild(schoolMajorInfo);
    
    // 帖子内容
    const postContent = document.createElement('div');
    postContent.className = 'post-content';
    postContent.textContent = post.content;
    
    // 帖子底部（评论按钮）
    const postFooter = document.createElement('div');
    postFooter.className = 'post-footer';
    
    const commentBtn = document.createElement('button');
    commentBtn.className = 'btn btn-sm comment-btn';
    commentBtn.innerHTML = '<i class="far fa-comment"></i> 评论';
    commentBtn.addEventListener('click', function() {
        openCommentModal(post.post_id);
    });
    
    postFooter.appendChild(commentBtn);
    
    // 评论区域（如果有评论）
    if (post.comments && post.comments.length > 0) {
        const commentsSection = document.createElement('div');
        commentsSection.className = 'comments-section';
        
        // 解析评论（假设comments是JSON字符串）
        let comments = [];
        try {
            comments = JSON.parse(post.comments);
        } catch (e) {
            console.error('解析评论失败:', e);
        }
        
        comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            
            const commentHeader = document.createElement('div');
            commentHeader.className = 'd-flex justify-content-between';
            
            const commentAuthor = document.createElement('span');
            commentAuthor.className = 'comment-author';
            commentAuthor.textContent = comment.name;
            
            const commentTime = document.createElement('span');
            commentTime.className = 'comment-time';
            const commentDate = new Date(comment.time);
            commentTime.textContent = commentDate.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            commentHeader.appendChild(commentAuthor);
            commentHeader.appendChild(commentTime);
            
            const commentContent = document.createElement('div');
            commentContent.className = 'comment-content';
            commentContent.textContent = comment.content;
            
            commentItem.appendChild(commentHeader);
            commentItem.appendChild(commentContent);
            
            commentsSection.appendChild(commentItem);
        });
        
        postFooter.appendChild(commentsSection);
    }
    
    // 组装帖子元素
    postElement.appendChild(postHeader);
    postElement.appendChild(postContent);
    postElement.appendChild(postFooter);
    
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
            loadPosts();
        } else {
            alert(data.message || '评论失败，请稍后再试');
        }
    })
    .catch(error => {
        console.error('提交评论失败:', error);
        alert('评论失败，请稍后再试');
    });
}
