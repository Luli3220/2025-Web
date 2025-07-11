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