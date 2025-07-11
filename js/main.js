document.addEventListener('DOMContentLoaded', function() {
    // 欢迎区域动画效果
    const welcomeSection = document.getElementById('welcome');
    if (welcomeSection) {
        const welcomeElements = welcomeSection.querySelectorAll('h2, p, .btn');
        welcomeElements.forEach((element, index) => {
            element.classList.add('animate__animated');
            element.classList.add('animate__fadeInUp');
            element.style.animationDelay = `${index * 0.2}s`;
        });
    }
    
    // 加载统计数据
    loadStats();
    
    // 计数器动画函数
    function loadStats() {
        // 从后端获取统计数据
        fetch('/api/stats')
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.json();
            })
            .then(data => {
                console.log('获取到的统计数据:', data); // 添加日志，便于调试
                
                // 确保数据有效
                if (!data || typeof data !== 'object') {
                    throw new Error('获取到的数据格式不正确');
                }
                
                // 更新计数器目标值
                document.querySelectorAll('.counter').forEach(counter => {
                    const category = counter.nextElementSibling.textContent.trim();
                    if (category === '专业解读') {
                        counter.setAttribute('data-target', data.majorsCount || 0);
                    } else if (category === '经验分享') {
                        counter.setAttribute('data-target', data.postsCount || 0);
                    } else if (category === '用户数量') {
                        counter.setAttribute('data-target', data.usersCount || 0);
                    }
                });
                
                // 启动计数器动画
                animateCounters();
            })
            .catch(error => {
                console.error('获取统计数据失败:', error);
                // 如果获取失败，使用默认值0
                document.querySelectorAll('.counter').forEach(counter => {
                    counter.setAttribute('data-target', 0);
                });
                // 仍然启动动画（使用默认值）
                animateCounters();
            });
    }
    
    // 计数器动画效果
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        const speed = 200; // 动画速度
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            // 重置计数器初始值为0，确保每次都从0开始计数
            counter.innerText = 0;
            const increment = Math.ceil(target / speed);
            
            function updateCount() {
                const count = +counter.innerText;
                if (count < target) {
                    counter.innerText = Math.min(count + increment, target);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            }
            
            updateCount();
        });
    }
    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 返回顶部按钮
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 添加淡入效果
    const fadeElements = document.querySelectorAll('.feature-card, .major-card, .testimonial-item, .senior-card');
    
    if (fadeElements.length > 0) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        fadeElements.forEach(element => {
            fadeObserver.observe(element);
        });
    }
    
    // 热门专业轮播初始化
    var swiper = new Swiper('.ztjjbox .swiper-container', {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 3,
        initialSlide: 2,
        loop: true,
        loopedSlides: 6,        
        direction: 'horizontal', 
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        speed: 600,             
        coverflowEffect: {
            rotate: 30,
            stretch: -30,
            depth: 300,
            modifier: 1,        
            slideShadows: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            beforeInit: function() {
                // 初始化前的处理
            },
            slideChangeTransitionStart: function() {
                // 确保过渡开始时的正确性
            }
        },
        // 移除之前的问题参数
        watchSlidesProgress: false,
        watchSlidesVisibility: false,
        slideToClickedSlide: false
    });
});