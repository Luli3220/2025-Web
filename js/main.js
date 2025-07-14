document.addEventListener('DOMContentLoaded', function() {
    // 学途说头像选择功能
    const seniorAvatars = document.querySelectorAll('.senior-avatar');
    if (seniorAvatars.length > 0) {
        seniorAvatars.forEach(avatar => {
            avatar.addEventListener('click', function() {
                // 获取当前选中的学长/学姐ID
                const seniorId = this.getAttribute('data-senior');
                
                // 移除所有头像的active类
                seniorAvatars.forEach(item => item.classList.remove('active'));
                
                // 为当前点击的头像添加active类
                this.classList.add('active');
                
                // 隐藏所有内容
                const testimonialItems = document.querySelectorAll('.testimonial-item');
                testimonialItems.forEach(item => item.classList.remove('active'));
                
                // 显示对应内容
                const activeContent = document.querySelector(`.testimonial-item[data-senior="${seniorId}"]`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
    }
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
        speed: 800,             // 增加过渡速度，使动画更流畅
        coverflowEffect: {
            rotate: 20,          // 减小旋转角度
            stretch: -20,        // 减小拉伸效果
            depth: 200,          // 减小深度，降低3D效果复杂度
            modifier: 1,        
            slideShadows: false,  // 关闭阴影效果，提高性能
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            beforeInit: function() {
                // 预加载图片，提高性能
                const slides = document.querySelectorAll('.ztjjbox .swiper-slide img');
                slides.forEach(img => {
                    if(img.getAttribute('src')) {
                        const preloadImg = new Image();
                        preloadImg.src = img.getAttribute('src');
                    }
                });
            },
            slideChangeTransitionStart: function() {
                // 使用transform硬件加速
                const slides = document.querySelectorAll('.ztjjbox .swiper-slide');
                slides.forEach(slide => {
                    slide.style.willChange = 'transform';
                });
            },
            slideChangeTransitionEnd: function() {
                // 过渡结束后释放资源
                const slides = document.querySelectorAll('.ztjjbox .swiper-slide');
                slides.forEach(slide => {
                    slide.style.willChange = 'auto';
                });
            }
        },
        // 移除之前的问题参数
        watchSlidesProgress: false,
        watchSlidesVisibility: false,
        slideToClickedSlide: false
    });
    
    // 优化常见问题部分的性能
    const accordionButtons = document.querySelectorAll('.accordion-button');
    if (accordionButtons.length > 0) {
        // 使用事件委托减少事件监听器数量
        document.getElementById('faqAccordion')?.addEventListener('click', function(e) {
            // 检查点击的是否是accordion按钮
            const button = e.target.closest('.accordion-button');
            if (!button) return;
            
            // 使用requestAnimationFrame优化动画性能
            requestAnimationFrame(() => {
                // 动画处理逻辑在这里
            });
        }, { passive: true }); // 使用passive事件提高滚动性能
    }
});