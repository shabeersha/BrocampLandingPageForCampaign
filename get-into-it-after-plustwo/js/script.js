// Initialize Lenis Smooth Scroll only on desktop
let lenis;
if (window.innerWidth > 768) {
    lenis = new Lenis({
        lerp: 0.1, // Simpler, faster linear interpolation
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        smoothWheel: true,
        smoothTouch: false,
    });

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
}





// FAQ Accordion
const accordionBtns = document.querySelectorAll('.accordion-btn');
accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const content = item.querySelector('.accordion-content');
        const isActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.accordion-item').forEach(i => {
            i.classList.remove('active');
            i.querySelector('.accordion-content').style.maxHeight = null;
            i.querySelector('.accordion-btn').setAttribute('aria-expanded', 'false');
        });

        // Open clicked if wasn't active
        if (!isActive) {
            item.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});



// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

const handleNavbarScroll = (scrollPos) => {
    if (scrollPos > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
};

if (lenis) {
    lenis.on('scroll', (e) => {
        handleNavbarScroll(e.scroll);
    });
} else {
    window.addEventListener('scroll', () => {
        handleNavbarScroll(window.scrollY);
    });
}

// Video Carousel Auto-Scroll
const carousel = document.querySelector('.video-carousel');
let isPaused = false;
let autoScrollEnabled = true;

if (carousel) {
    // Clone items for infinite loop illusion
    const items = Array.from(carousel.children);
    items.forEach(item => {
        const clone = item.cloneNode(true);
        carousel.appendChild(clone);
    });

    let scrollAmount = carousel.scrollLeft;
    const scrollSpeed = 0.5; // Smooth scroll speed
    let animationId;
    let isVisible = false;

    // Only run auto-scroll when carousel is visible
    const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(carousel);

    function autoScroll() {
        if (!isPaused && autoScrollEnabled && isVisible) {
            scrollAmount += scrollSpeed;
            if (scrollAmount >= carousel.scrollWidth / 2) {
                scrollAmount = 0;
            }
            carousel.scrollLeft = scrollAmount;
        }
        animationId = requestAnimationFrame(autoScroll);
    }
    animationId = requestAnimationFrame(autoScroll);

    carousel.addEventListener('scroll', () => {
        if (isPaused) {
            scrollAmount = carousel.scrollLeft;
        }
    });

    const pauseScroll = () => isPaused = true;
    const resumeScroll = () => {
        isPaused = false;
        scrollAmount = carousel.scrollLeft;
    };

    carousel.addEventListener('mouseenter', pauseScroll);
    carousel.addEventListener('mouseleave', resumeScroll);
    carousel.addEventListener('touchstart', pauseScroll, { passive: true });
    carousel.addEventListener('touchend', resumeScroll, { passive: true });
}

// Inline Video Player Logic
document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', function () {
        const videoSrc = this.getAttribute('data-video');
        const thumb = this.querySelector('.video-thumb');
        if (this.classList.contains('playing')) return;

        document.querySelectorAll('.video-card.playing').forEach(otherCard => {
            const otherVideo = otherCard.querySelector('video');
            if (otherVideo) {
                otherVideo.pause();
                otherVideo.remove();
            }
            otherCard.classList.remove('playing');
        });

        this.classList.add('playing');
        const video = document.createElement('video');
        video.src = videoSrc;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.onended = () => {
            video.remove();
            this.classList.remove('playing');
            autoScrollEnabled = true;
        };
        thumb.appendChild(video);
        autoScrollEnabled = false;

        // Auto-scroll to center on mobile/desktop when playing
        this.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    });
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Initialize animations after all assets are loaded
window.addEventListener('load', () => {
    // Reveal sections with staggered children
    const sections = document.querySelectorAll('section');

    sections.forEach((section) => {
        const title = section.querySelector('.section-title');
        const subtitle = section.querySelector('.section-subtitle');
        const cards = section.querySelectorAll('.benefit-card, .stat, .step, .testimonial, .video-card, .day-card, .accordion-item, .pricing-card');

        if (title) {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: "top 95%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 40,
                duration: 1,
                ease: "expo.out"
            });
        }

        if (subtitle) {
            gsap.from(subtitle, {
                scrollTrigger: {
                    trigger: subtitle,
                    start: "top 95%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 30,
                duration: 1,
                delay: 0.2,
                ease: "expo.out"
            });
        }

        if (cards.length > 0) {
            gsap.from(cards, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    toggleActions: "play none none none",
                    onEnter: () => {
                        // Fail-safe: ensure opacity is 1 if animation completes or triggered
                        gsap.to(cards, { opacity: 1, duration: 0.5 });
                    }
                },
                opacity: 0,
                y: 50,
                duration: 1,
                stagger: 0.1,
                ease: "back.out(1.7)"
            });
        }
    });




    // Hero Matched Animation
    if (document.querySelector('.hero-match-container')) {
        gsap.utils.toArray('.hm-step').forEach((step, i) => {
            gsap.from(step.querySelectorAll('.hm-card, .hm-content'), {
                scrollTrigger: {
                    trigger: step,
                    start: 'top 85%'
                },
                opacity: 0,
                y: 50,
                duration: 1,
                stagger: 0.2,
                ease: "power4.out",
                clearProps: "all"
            });
        });

        // Reveal Blended CTA
        gsap.from('.blended-cta', {
            scrollTrigger: {
                trigger: '.blended-cta',
                start: 'top 85%'
            },
            opacity: 0,
            y: 40,
            duration: 1,
            ease: "power2.out",
            delay: 0.2
        });
    }




    // Final refresh for all ScrollTriggers
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 100);
});

// Specialized animations logic
const heroTL = gsap.timeline({ delay: 0.2 });

if (document.querySelector('.hero-glass-card')) {
    heroTL.from('.hero-glass-card', { opacity: 0, x: -100, duration: 1.2, ease: "power4.out" })
        .from('.hero-badge', { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" }, "-=0.8")
        .from('.hero-content h1', { opacity: 0, y: 40, duration: 1, ease: "power4.out" }, "-=0.6")
        .from('.hero-subheading', { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" }, "-=0.6")
        .from('.hero-bullets li', { opacity: 0, x: -20, stagger: 0.1, duration: 0.5, ease: "power2.out" }, "-=0.4")
        .from('.hero-cta-group', { opacity: 0, scale: 0.9, duration: 0.8, ease: "back.out(1.7)" }, "-=0.3");
}

if (document.querySelector('.video-container')) {
    gsap.from('.video-container', {
        opacity: 0,
        x: 100,
        scale: 0.8,
        rotateY: -20,
        duration: 1.5,
        delay: 0.5,
        ease: "power4.out"
    });
}




// Modal Logic
const modal = document.getElementById('registration-modal');
const modalBtns = document.querySelectorAll('.btn-trigger-modal');
const closeBtns = document.querySelectorAll('.modal-close, .modal-overlay, .modal-close-btn');
const registrationForm = document.getElementById('registration-form');
const registrationFormContent = document.getElementById('registration-form-content');
const successMessage = document.getElementById('success-message');

const openModal = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
};

const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
    // Reset form and message state after closing
    setTimeout(() => {
        registrationForm.reset();
        registrationFormContent.style.display = 'block';
        successMessage.style.display = 'none';
        document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
    }, 300);
};

modalBtns.forEach(btn => btn.addEventListener('click', openModal));
modalBtns.forEach(btn => btn.addEventListener('click', openModal));

// Specific Close Modal Logic
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// Overlay closing - only if NOT successful state
document.querySelector('.modal-overlay').addEventListener('click', () => {
    if (successMessage.style.display !== 'block') {
        closeModal();
    }
});

// Initialize intl-tel-input
const phoneInput = document.querySelector("#mobile");
let iti;
if (phoneInput) {
    iti = window.intlTelInput(phoneInput, {
        initialCountry: "in",
        separateDialCode: true,
        dropdownContainer: document.body,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    // Fix for Lenis scroll hijacking - Robust check
    const addLenisPrevent = () => {
        const countryList = document.querySelector('.iti__country-list');
        if (countryList) {
            countryList.setAttribute('data-lenis-prevent', '');
        } else {
            // Retry briefly if not found immediately (though it should be sync)
            setTimeout(addLenisPrevent, 50);
        }
    };
    addLenisPrevent();

    // New: Handle scroll on modal to close/blur dropdown to prevent floating
    const modalContent = document.querySelector('.modal');
    if (modalContent) {
        modalContent.addEventListener('scroll', () => {
            if (iti) {
                // Determine if the dropdown is open by checking if the input has the 'iti__open' class? 
                // Actually intl-tel-input doesn't expose an easy 'isOpen' method, but we can check standard classes or just blur.
                // Or use the public method to close if available, but v17 doesn't have a simple close() method exposed easily without accessing private instance data usually.
                // Hacking: trigger a click on body or blur the input.
                phoneInput.blur();
                // internal method if accessible, or just let blur handle it (standard behavior usually closes on blur)
            }
        }, { passive: true });
    }
}

// Form Validation and Submission
registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Populate hidden country code field
    if (iti) {
        const countryData = iti.getSelectedCountryData();
        const hiddenInput = document.getElementById("hiddenCountryCode");
        if (hiddenInput && countryData.dialCode) {
            hiddenInput.value = "+" + countryData.dialCode;
        }
    }

    let isValid = true;
    const formData = new FormData(registrationForm);
    const data = Object.fromEntries(formData.entries());


    // Simple validation
    const validateField = (id, condition) => {
        const field = document.getElementById(id);
        const group = field.closest('.form-group');
        if (!condition) {
            group.classList.add('error');
            isValid = false;
        } else {
            group.classList.remove('error');
        }
    };

    validateField('full-name', data['full-name'].trim() !== '');
    validateField('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data['email']));
    // validateField('mobile', /^[0-9]{10}$/.test(data['mobile'])); // Old strict 10 digit check
    validateField('mobile', /^[0-9]{7,15}$/.test(data['mobile'])); // More lenient for international
    validateField('currentStatus', data['currentStatus'] && data['currentStatus'] !== '');



    if (isValid) {
        // Optimistic UI: Show success immediately
        registrationFormContent.style.display = 'none';
        successMessage.style.display = 'block';

        // THE CLOUDFLARE WORKER URL
        const WORKER_URL = 'https://ig-ml.quiet-dew-3468.workers.dev/';

        fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            console.log('Submission Success:', result);
        })
        .catch(error => {
            console.error('Submission Error:', error);
        });
    }
});

// UTM Parameter Population (Keeping this as it only reads URL and fills hidden fields)
document.addEventListener('DOMContentLoaded', () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const form = document.getElementById('registration-form');

        if (form) {
            // List of tracking parameters to look for
            const trackingParams = [
                'zf_referrer_name', 'zf_redirect_url', 'zc_gad',
                'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                'utm_id', 'utm_adgroup', 'utm_matchtype', 'utm_audience',
                'utm_adgroupid', 'ref', 'utm_network', 'utm_placement', 'utm_hp'
            ];

            trackingParams.forEach(param => {
                let value = urlParams.get(param);
                if (value) {
                    // Check for utm_source="Meta" and replace it
                    if (param === 'utm_source' && value === 'Meta') {
                        value = 'admeta malayalam';
                    }

                    const input = form.querySelector(`input[name="${param}"]`);
                    if (input) {
                        input.value = value;
                    }
                }
            });
        }
    } catch (e) {
        console.error('Error populating tracking parameters:', e);
    }
});
