document.addEventListener('DOMContentLoaded', function() {
    // 获取当前页面的路径
    const currentPath = window.location.pathname;
    
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // 移除所有激活状态
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // 根据当前路径设置激活状态
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // 处理首页的特殊情况
        if (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('index.html'))) {
            link.classList.add('active');
        }
        // 处理其他页面
        else if (currentPath.includes(href) && href !== 'index.html') {
            link.classList.add('active');
        }
    });
});