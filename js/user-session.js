// 用户会话管理
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录
    function checkUserLogin() {
        fetch('/api/user/current')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.user) {
                    // 用户已登录，显示用户信息
                    displayUserInfo(data.user);
                } else {
                    // 用户未登录，如果当前不是登录页面，则不做任何操作
                    // 注释掉重定向代码，避免未登录时强制跳转到登录页面
                    // if (!window.location.pathname.includes('/login.html')) {
                    //     window.location.href = '/login.html';
                    // }
                }
            })
            .catch(error => {
                console.error('获取用户信息失败:', error);
            });
    }

    // 显示用户信息
    function displayUserInfo(user) {
        // 根据页面结构选择合适的导航栏右侧元素
        let navbarRight = document.querySelector('.navbar-right .navbar-nav');
        if (!navbarRight) {
            // 适配seniors.html页面的不同结构
            navbarRight = document.querySelector('.navbar-nav.ms-auto:last-child');
        }
        if (!navbarRight) return;

        navbarRight.innerHTML = '';

        const userDropdown = document.createElement('li');
        userDropdown.className = 'nav-item dropdown';
        
        const firstLetter = user.nickname ? user.nickname.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();
        
        userDropdown.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="user-avatar d-inline-block">${firstLetter}</div>
                <span>${user.nickname || user.username}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
                <li class="px-3 py-2 text-center border-bottom">
                    <h6 class="mb-0">${user.nickname || user.username}</h6>
                    <small class="text-muted">${user.school ? user.school + (user.major ? ' · ' + user.major : '') : '未设置学校和专业'}</small>
                </li>
                <li><a class="dropdown-item py-2" href="#"><i class="fas fa-user me-2"></i>个人资料</a></li>
                <li><a class="dropdown-item py-2" href="#"><i class="fas fa-bookmark me-2"></i>我的收藏</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item py-2 logout-btn" href="javascript:void(0);"><i class="fas fa-sign-out-alt me-2"></i>退出登录</a></li>
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

    // 如果不是登录页面，则检查用户登录状态
    if (!window.location.pathname.includes('/login.html')) {
        checkUserLogin();
    }
});