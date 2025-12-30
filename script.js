console.log("Brototype Landing Page Loaded");

// Mobile Menu Placeholder
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Background Selection Logic
const btnIT = document.getElementById('btn-it');
const btnNonIT = document.getElementById('btn-non-it');
const statsNumber = document.getElementById('stats-number');
const statsLabel = document.getElementById('stats-label');
const statsCard = document.getElementById('stats-card');

if (btnIT && btnNonIT && statsNumber && statsLabel) {
    btnIT.addEventListener('click', (e) => {
        // Update buttons
        btnIT.classList.add('active');
        btnNonIT.classList.remove('active');

        // Update stats content
        statsNumber.innerText = "1052 Students";
        statsLabel.innerText = "With IT background Have Already Placed From Brocamp";

        // Trigger Confetti from stats card position
        triggerConfettiFromElement(statsCard);
    });

    btnNonIT.addEventListener('click', (e) => {
        // Update buttons
        btnNonIT.classList.add('active');
        btnIT.classList.remove('active');

        // Update stats content
        statsNumber.innerText = "1327 Students";
        statsLabel.innerText = "With Non-IT background Have Already Placed From Brocamp";

        // Trigger Confetti from stats card position
        triggerConfettiFromElement(statsCard);
    });
}

// Confetti Animation Logic
function triggerConfettiFromElement(element) {
    // Get element position relative to viewport
    const rect = element.getBoundingClientRect();
    // Calculate center of element as a fraction of viewport (0-1)
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height / 2) / window.innerHeight;

    var count = 50;
    var defaults = {
        origin: { x: originX, y: originY }
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}

// Hero CTA Scroll Logic
const heroBtn = document.querySelector('.hero-btn');
const formSection = document.querySelector('.form-section');

if (heroBtn) {
    heroBtn.addEventListener('click', () => {
        const popup = document.getElementById('scrollPopup');
        if (popup) {
            popup.classList.add('show');
        }
    });
}

// Form Submission Logic
const leadForm = document.getElementById('leadForm');

// Google Apps Script URL (Restored)
const scriptURL = 'https://script.google.com/macros/s/AKfycbxo1pJcZmYlnDeFUcbs5vR7i-oRAxN16vrdbd_Q0mrMChhCdRyeg0xJny5Z_EQ8vE-2Bw/exec';

// International Telephone Input Initialization
const phoneInput = document.querySelector("#phone");
let iti; // Instance variable

if (phoneInput) {
    iti = window.intlTelInput(phoneInput, {
        initialCountry: "in",
        separateDialCode: true,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
        preferredCountries: ["in", "ae", "us", "uk"],
        autoPlaceholder: "off",
    });
}

if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
        // Prevent default submission to validate first
        e.preventDefault();

        // Validate Phone Number
        if (iti && !iti.isValidNumber()) {
            let errorMsg = leadForm.querySelector('#main-phone-error-msg');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.id = 'main-phone-error-msg';
                errorMsg.style.color = '#dc143c';
                errorMsg.style.fontSize = '0.85rem';
                errorMsg.style.marginTop = '5px';
                errorMsg.style.fontWeight = '500';

                const phoneInput = leadForm.querySelector('#phone');
                if (phoneInput && phoneInput.parentNode) {
                    phoneInput.parentNode.parentNode.appendChild(errorMsg);
                }
            }
            errorMsg.innerText = "Please enter a valid phone number.";
            errorMsg.style.display = 'block';

            const phoneField = leadForm.querySelector('#phone');
            if (phoneField) phoneField.focus();
            return;
        } else {
            // Clear error if valid
            const errorMsg = leadForm.querySelector('#main-phone-error-msg');
            if (errorMsg) errorMsg.style.display = 'none';
        }

        // --- Zoho & Data Prep ---
        // 1. Update Phone Field with Full Number (for Zoho)
        if (iti) {
            const fullPhone = iti.getNumber();
            // We need to set the value of the actual input so standard POST sends it
            const phoneField = leadForm.querySelector('input[name="Phone"]');
            if (phoneField) phoneField.value = fullPhone;
        }

        // 2. Handle Name Splitting (Full Name -> First + Last)
        const fullNameInput = leadForm.querySelector('input[name="Last Name"]'); // We reused this ID
        const firstNameHidden = leadForm.querySelector('input[name="First Name"]');

        if (fullNameInput && firstNameHidden) {
            const rawName = fullNameInput.value.trim();
            const nameParts = rawName.split(' ');

            if (nameParts.length > 1) {
                // Determine First Name (Everything up to last word? Or First word?)
                // Standard: First Name is first word. Last Name is the rest.
                // Zoho provided form has First Name as mandatory. 
                // Let's use: First Name = First Word, Last Name = Rest.
                const fName = nameParts[0];
                const lName = nameParts.slice(1).join(' ');

                firstNameHidden.value = fName;
                fullNameInput.value = lName; // Update value for POST
            } else {
                // Single word
                firstNameHidden.value = "-"; // or "Unknown"
                fullNameInput.value = rawName;
            }
        }

        // 3. Submit to Zoho Iframe
        leadForm.submit();

        // 4. Background Sync to Google Sheets (Legacy Mapping)
        try {
            const googleFormData = new FormData();
            const nameVal = leadForm.querySelector('input[name="Last Name"]').value; // Inline form uses "Last Name" for full name
            const emailVal = leadForm.querySelector('input[name="Email"]').value;
            const phoneVal = iti ? iti.getNumber() : "";
            const bgSelect = leadForm.querySelector('select[name="background"]');

            googleFormData.append("fullName", nameVal);
            googleFormData.append("email", emailVal);
            googleFormData.append("phone", phoneVal);
            if (bgSelect) googleFormData.append("background", bgSelect.value);
            // Add timestamp
            googleFormData.append("date", new Date().toLocaleString());

            fetch(scriptURL, { method: 'POST', body: googleFormData })
                .catch(error => console.error('Google Sheet Sync Error:', error));
        } catch (err) {
            console.error("Sheet Prep Error:", err);
        }

        // 5. Show Success UI Immediately
        const formContent = document.querySelector('.form-content');
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success-message';
        successMessage.innerHTML = `
            <h3>Thank You!</h3>
            <p>Our career expert will contact you shortly.</p>
        `;

        // Hide form and show success
        leadForm.style.display = 'none';
        formContent.appendChild(successMessage);

        // Reset form fields after delay (optional, but form/iframe reload might handle it)
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
            }
            leadForm.style.display = 'block';
            leadForm.reset();
        }, 5000);
    });
}

// Video Cards Click Logic
// Video Cards Click Logic
const videoCards = document.querySelectorAll('.video-facade-card');
videoCards.forEach(card => {
    const video = card.querySelector('.story-thumb-video');
    const playBtn = card.querySelector('.play-button-small');
    const container = card.closest('.carousel-track-container');

    if (video) {
        const resetState = () => {
            video.controls = false; // Hide native controls
            if (playBtn) playBtn.style.display = ''; // Show custom play button
            if (container) container.dataset.isPlaying = "false"; // Resume Scroll
        };

        video.addEventListener('pause', resetState);
        video.addEventListener('ended', resetState);
    }

    card.addEventListener('click', function (e) {
        // Prevent click if user was dragging
        const container = this.closest('.carousel-track-container');
        if (container && container.dataset.wasDragging === "true") {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        const video = this.querySelector('.story-thumb-video');
        const playBtn = this.querySelector('.play-button-small');

        if (video) {
            // Unmute and Play
            video.muted = false;
            video.controls = true;
            video.play();

            // Hide Play Button
            if (playBtn) playBtn.style.display = 'none';

            // Ensure video stays full opacity
            video.style.opacity = '1';

            // LOCK AUTO-SCROLL & CENTER VIDEO
            if (container) {
                container.dataset.isPlaying = "true"; // Flag to stop auto-scroll loop

                // Calculate position to center the card
                // card.offsetLeft is relative to the track, we need to subtract container center
                const cardLeft = this.closest('li').offsetLeft;
                const cardWidth = this.closest('li').offsetWidth;
                const containerWidth = container.offsetWidth;

                const targetScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2);

                container.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Navbar Logic
const navbar = document.getElementById('mainNav');
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

// Sticky Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Optional: Animate hamburger to X
        mobileToggle.classList.toggle('open');
    });
}
// Video Carousel Hybrid Scroll (Auto + Manual)
const trackContainers = document.querySelectorAll('.carousel-track-container');

trackContainers.forEach(container => {
    const track = container.querySelector('.carousel-track');
    const isReverse = track.classList.contains('reverse-track');

    // Desktop: Continuous Marquee
    if (window.innerWidth > 768) {
        // Auto-scroll speed
        const speed = 1; // Pixels per frame

        // State
        let isPaused = false;
        let animationId;

        // Interaction Listeners
        container.addEventListener('mouseenter', () => isPaused = true);
        container.addEventListener('mouseleave', () => isPaused = false);

        function animate() {
            if (!isPaused && container.dataset.isPlaying !== "true") {
                const maxScroll = container.scrollWidth / 2;

                if (isReverse) {
                    container.scrollLeft -= speed;
                    if (container.scrollLeft <= 0) {
                        container.scrollLeft = maxScroll;
                    }
                } else {
                    container.scrollLeft += speed;
                    if (container.scrollLeft >= maxScroll) {
                        container.scrollLeft = 0;
                    }
                }
            }
            animationId = requestAnimationFrame(animate);
        }

        if (isReverse) {
            setTimeout(() => {
                container.scrollLeft = container.scrollWidth / 2;
            }, 100);
        }
        animate();
    } else {
        // Mobile: Snap Interval Scrolling (Like Course Carousel)
        let intervalId;
        const startMobileScroll = () => {
            clearInterval(intervalId);
            intervalId = setInterval(() => {
                if (container.dataset.isPlaying === "true") return;

                const cardWidth = container.querySelector('.carousel-slide').offsetWidth; // 50vw
                const scrollAmount = cardWidth; // Scroll 1 item at a time

                if (isReverse) {
                    // Reverse Logic for Mobile
                    if (container.scrollLeft <= 0) {
                        container.scrollTo({ left: container.scrollWidth / 2, behavior: 'auto' }); // Jump to end silently
                    } else {
                        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                    }
                } else {
                    // Forward Logic
                    /* 
                       Logic: check if we are at the "end" of the first set.
                       Since we have duplicated items, maxScroll is roughly half total width.
                    */
                    const maxScroll = container.scrollWidth / 2;
                    if (container.scrollLeft >= maxScroll) {
                        container.scrollTo({ left: 0, behavior: 'auto' }); // Jump to start silently
                    } else {
                        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    }
                }
            }, 3000);
        };

        // Initialize Reverse Position
        if (isReverse) {
            setTimeout(() => {
                container.scrollTo({ left: container.scrollWidth / 2, behavior: 'auto' });
            }, 100);
        }

        startMobileScroll();

        // Pause on Touch
        container.addEventListener('touchstart', () => clearInterval(intervalId), { passive: true });
        container.addEventListener('touchend', () => {
            setTimeout(startMobileScroll, 4000);
        });
    }

    // --- Drag/Manual Scroll Implementation (Shared) ---
    let isDown = false;
    let startX;
    let scrollLeft;
    let checkDragThreshold = false;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        checkDragThreshold = true;
        container.dataset.wasDragging = "false";
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
        setTimeout(() => {
            container.dataset.wasDragging = "false";
        }, 50);
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;

        if (checkDragThreshold && Math.abs(x - startX) > 5) {
            container.dataset.wasDragging = "true";
            checkDragThreshold = false;
        }
        container.scrollLeft = scrollLeft - walk;
    });
});

// Hero Image Auto-Slider (Fade Effect - 6 Seconds) & Santa Sync
const heroTrack = document.querySelector('.hero-slider-track');
const santaWrapper = document.querySelector('.santa-video-wrapper');
const santaVideo = document.querySelector('.santa-video');

if (heroTrack) {
    let heroIndex = 0;
    const heroSlides = document.querySelectorAll('.hero-slide');
    const totalHeroSlides = heroSlides.length;

    // Ensure first slide is active initially
    if (totalHeroSlides > 0) {
        heroSlides[0].classList.add('active');
    }

    // Function to play santa animation (Linked to slide change)
    const playSantaCycle = () => {
        // Disable on mobile/tablet (Save resources)
        if (window.innerWidth <= 992) return;

        if (santaWrapper && santaVideo) {
            // Wait 2 seconds after slide change, then peek
            setTimeout(() => {
                santaWrapper.classList.add('show');
                santaVideo.play().catch(e => { /* Ignore autoplay block */ });

                // Hide after 4 seconds (Slower peek duration)
                setTimeout(() => {
                    santaWrapper.classList.remove('show');
                    // Reset video after fade out
                    setTimeout(() => {
                        santaVideo.pause();
                        santaVideo.currentTime = 0;
                    }, 3000);
                }, 4000);
            }, 2000);
        }
    };

    // Initial run (Wait 2s for first slide hold)
    setTimeout(playSantaCycle, 100);

    setInterval(() => {
        // Remove active class from current
        heroSlides[heroIndex].classList.remove('active');

        // Move to next
        heroIndex = (heroIndex + 1) % totalHeroSlides;

        // Add active class to next
        heroSlides[heroIndex].classList.add('active');

        // Trigger Santa for this new slide
        playSantaCycle();

    }, 6000); // 6 seconds
}

// Scroll Popup Logic
const scrollPopup = document.getElementById('scrollPopup');
const closeBtn = document.querySelector('.close-btn-new');
const popupForm = document.getElementById('popupForm');

if (scrollPopup && closeBtn) {
    const showPopupOnScroll = () => {
        // Show popup after scrolling 300px
        if (window.scrollY > 300) {
            scrollPopup.classList.add('show');
            // Remove listener so it acts ONLY ONCE per page load
            window.removeEventListener('scroll', showPopupOnScroll);
        }
    };

    window.addEventListener('scroll', showPopupOnScroll);

    // Close Button
    closeBtn.addEventListener('click', () => {
        scrollPopup.classList.remove('show');
    });

    // Close on Outside Click
    window.addEventListener('click', (e) => {
        if (e.target === scrollPopup) {
            scrollPopup.classList.remove('show');
        }
    });
}

// Popup Phone Input Init
const popupPhone = document.querySelector("#popupPhoneNew");
let itiPopup;

if (popupPhone) {
    itiPopup = window.intlTelInput(popupPhone, {
        initialCountry: "in",
        separateDialCode: true,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
        preferredCountries: ["in", "ae", "us", "uk"],
        autoPlaceholder: "off",
    });
}

// Popup Form Submission
if (popupForm) {
    popupForm.addEventListener('submit', function (e) {
        // Prevent default to validate
        e.preventDefault();

        // Validate Phone Number
        if (itiPopup && !itiPopup.isValidNumber()) {
            let errorMsg = popupForm.querySelector('#phone-error-msg');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.id = 'phone-error-msg';
                errorMsg.style.color = '#dc143c';
                errorMsg.style.fontSize = '0.85rem';
                errorMsg.style.marginTop = '5px';
                errorMsg.style.fontWeight = '500';

                const phoneInput = popupForm.querySelector('#popupPhoneNew');
                if (phoneInput && phoneInput.parentNode) {
                    phoneInput.parentNode.parentNode.appendChild(errorMsg);
                }
            }
            errorMsg.innerText = "Please enter a valid phone number.";
            errorMsg.style.display = 'block';

            const phoneField = popupForm.querySelector('#popupPhoneNew');
            if (phoneField) phoneField.focus();
            return;
        } else {
            const errorMsg = popupForm.querySelector('#phone-error-msg');
            if (errorMsg) errorMsg.style.display = 'none';
        }

        // --- Zoho Data Prep ---
        if (itiPopup) {
            const fullPhone = itiPopup.getNumber();
            // Important: Update 'Phone' input value
            const phoneField = popupForm.querySelector('input[name="Phone"]');
            if (phoneField) phoneField.value = fullPhone;
        }

        // Submit to Zoho Iframe
        popupForm.submit();

        // --- Google Sheets Sync (Legacy Mapping) ---
        try {
            const googleFormData = new FormData();
            const fName = popupForm.querySelector('input[name="First Name"]').value;
            const lName = popupForm.querySelector('input[name="Last Name"]').value;
            const emailVal = popupForm.querySelector('input[name="Email"]').value;
            const phoneVal = itiPopup ? itiPopup.getNumber() : "";
            const bgSelect = popupForm.querySelector('select[name="background"]');
            const langSelect = popupForm.querySelector('select[name="LEADCF33"]');

            googleFormData.append("fullName", `${fName} ${lName}`);
            googleFormData.append("email", emailVal);
            googleFormData.append("phone", phoneVal);
            if (bgSelect) googleFormData.append("background", bgSelect.value);
            if (langSelect) googleFormData.append("language", langSelect.value);

            fetch(scriptURL, { method: 'POST', body: googleFormData })
                .catch(error => console.error('Google Sheet Sync Error:', error));
        } catch (err) {
            console.error("Sheet Prep Error:", err);
        }

        // --- UI Updates ---
        const popupContent = scrollPopup.querySelector('.popup-content-new');
        const form = popupContent.querySelector('form');
        const header = popupContent.querySelector('.popup-header-new');

        let successMsg = popupContent.querySelector('.popup-success-msg');
        if (!successMsg) {
            successMsg = document.createElement('div');
            successMsg.className = 'popup-success-msg';
            successMsg.style.textAlign = 'center';
            successMsg.style.padding = '40px 20px';
            successMsg.innerHTML = `
                <h3 style="color: #fff; margin-bottom: 10px;">Thank You!</h3>
                <p style="color: rgba(255, 255, 255, 0.7);">We will contact you shortly.</p>
            `;
            popupContent.appendChild(successMsg);
        }

        form.style.display = 'none';
        header.style.display = 'none';
        successMsg.style.display = 'block';
        popupContent.style.backgroundColor = '#000000'; // Make card black

        // Reset and Restore after 5 seconds
        setTimeout(() => {
            if (successMsg) successMsg.style.display = 'none';
            if (form) form.style.display = 'block';
            if (header) header.style.display = 'block';
            if (popupContent) popupContent.style.backgroundColor = ''; // Restore default
            form.reset();
            form.querySelector('button').disabled = false;
            // scrollPopup.classList.remove('show'); // Optional: Close popup
        }, 5000);
    });
}

// Scroll Reveal Animation Logic
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('section, .course-card, .story-card, .hero-text, .video-content-text, h2');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
});

// Mobile Course Carousel Auto-Scroll
// Mobile Course Carousel Auto-Scroll
window.addEventListener('load', () => {
    const courseGrid = document.querySelector('.course-grid');
    if (courseGrid) {
        let courseInterval;

        const startCourseAutoScroll = () => {
            // Only active on mobile
            if (window.innerWidth > 768) {
                clearInterval(courseInterval);
                return;
            }

            clearInterval(courseInterval);
            courseInterval = setInterval(() => {
                const card = courseGrid.querySelector('.course-card');
                if (!card) return;

                const cardWidth = card.offsetWidth;
                const gap = 20; // 20px gap from CSS
                const itemWidth = cardWidth + gap;

                // Current Card Index
                const currentIndex = Math.round(courseGrid.scrollLeft / itemWidth);
                const nextIndex = currentIndex + 1;
                const totalCards = courseGrid.querySelectorAll('.course-card').length;

                // Check if we reached the last card (or beyond)
                if (nextIndex >= totalCards) {
                    courseGrid.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    courseGrid.scrollTo({ left: nextIndex * itemWidth, behavior: 'smooth' });
                }
            }, 3000);
        };

        const stopCourseAutoScroll = () => clearInterval(courseInterval);

        // Initial Start
        startCourseAutoScroll();

        // Handle Resize
        window.addEventListener('resize', startCourseAutoScroll);

        // Pause on Interaction
        courseGrid.addEventListener('touchstart', stopCourseAutoScroll, { passive: true });
        courseGrid.addEventListener('touchend', () => {
            // Ensure the user has finished their gesture before restarting
            setTimeout(startCourseAutoScroll, 4000);
        });

        // Navigation Buttons Logic
        const prevBtn = document.querySelector('.nav-btn.prev');
        const nextBtn = document.querySelector('.nav-btn.next');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                stopCourseAutoScroll();
                const card = courseGrid.querySelector('.course-card');
                const scrollAmount = card ? card.offsetWidth + 20 : 300;
                courseGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                setTimeout(startCourseAutoScroll, 4000); // Restart auto-scroll after delay
            });

            nextBtn.addEventListener('click', () => {
                stopCourseAutoScroll();
                const card = courseGrid.querySelector('.course-card');
                const scrollAmount = card ? card.offsetWidth + 20 : 300;
                courseGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                setTimeout(startCourseAutoScroll, 4000); // Restart auto-scroll after delay
            });
        }

        // Also pause on mouse interaction (desktop dev testing)
        courseGrid.addEventListener('mouseenter', stopCourseAutoScroll);
        courseGrid.addEventListener('mouseleave', startCourseAutoScroll);
    }
});
// --- Optimization: Pause Videos when Scrolled Out of View ---
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            const video = entry.target;
            if (!video.paused) {
                video.pause();
            }
        }
    });
}, { threshold: 0.1 }); // Pause if less than 10% visible

document.querySelectorAll('video').forEach(video => {
    videoObserver.observe(video);
});
