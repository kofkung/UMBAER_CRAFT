/**
 * Umbaer Craft - Minecraft Skin Shop
 * JavaScript functionality with animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initOrderForm();
    initFileUpload();
    initGalleryFilter();
    initModal();
    initServiceTypeChange();
    initScrollReveal();
    initParallax();
});

// ================================
// Navigation
// ================================
// ================================
// Navigation
// ================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const logoLink = document.querySelector('#navbar a[href="#"], #navbar a[href="index.html"]');

    // Logo Click Logic
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

            if (isHomePage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // If on order page, default href="index.html" handles it
            }
        });
    }

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled', 'shadow-lg', 'shadow-black/20');
                navbar.classList.remove('py-4');
                navbar.classList.add('py-3');
            } else {
                navbar.classList.remove('scrolled', 'shadow-lg', 'shadow-black/20');
                navbar.classList.remove('py-3');
                navbar.classList.add('py-4');
            }
        });
    }
}

function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const overlay = document.getElementById('mobile-overlay');

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        if (navToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    navLinks.forEach((link, index) => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';

            // Reset hamburger
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });

        // Stagger animation for mobile menu items
        link.style.transitionDelay = `${index * 100}ms`;
    });

    // Close on overlay click
    if (overlay) {
        overlay.addEventListener('click', () => {
            navToggle.click();
        });
    }
}

// ================================
// Smooth Scroll & Page Transitions
// ================================
function initSmoothScroll() {
    // Handle anchors on the same page
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Ignore empty anchors

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle initial scroll from URL hash
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
}

// ================================
// Order Form
// ================================
function initOrderForm() {
    const form = document.getElementById('order-form');
    const skinScale = document.getElementById('skin-scale');
    const skinPart = document.getElementById('skin-part');
    const partGroup = document.getElementById('part-group');
    const priceDisplay = document.getElementById('price-display');
    const estimatedPrice = document.getElementById('estimated-price');

    if (!form) return;

    // Real-time price calculation
    function updatePrice() {
        const scale = skinScale?.value;
        const part = skinPart?.value;

        if (scale && part) {
            const price = calculatePrice(scale, part);
            if (priceDisplay && estimatedPrice) {
                priceDisplay.classList.remove('hidden');
                estimatedPrice.textContent = '฿' + price;
            }
        } else if (scale === 'figura') {
            if (priceDisplay && estimatedPrice) {
                priceDisplay.classList.remove('hidden');
                estimatedPrice.textContent = '฿100';
            }
        } else {
            if (priceDisplay) priceDisplay.classList.add('hidden');
        }
    }

    // Handle scale change
    if (skinScale) {
        skinScale.addEventListener('change', () => {
            if (skinScale.value === 'figura') {
                if (partGroup) {
                    partGroup.style.opacity = '0.5';
                    partGroup.style.pointerEvents = 'none';
                }
                if (skinPart) skinPart.value = '';
            } else {
                if (partGroup) {
                    partGroup.style.opacity = '1';
                    partGroup.style.pointerEvents = 'auto';
                }
            }
            updatePrice();
        });
    }

    if (skinPart) {
        skinPart.addEventListener('change', updatePrice);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateForm(form)) {
            // Get form data
            const scale = skinScale?.value || '';
            const part = skinPart?.value || 'full';

            // Calculate price
            const price = calculatePrice(scale, part);

            // Show payment modal
            showPaymentModal(scale, part, price);
        }
    });
}

// Price calculation based on scale and part
function calculatePrice(scale, part) {
    // Prices: { scale: { full, head, body } }
    const prices = {
        '64': { 'full': 30, 'head': 15, 'body': 15 },
        '128': { 'full': 40, 'head': 20, 'body': 20 },
        '512': { 'full': 140, 'head': 70, 'body': 70 },
        '1024': { 'full': 200, 'head': 110, 'body': 110 },
        '2048': { 'full': 280, 'head': 150, 'body': 150 },
        'figura': { 'full': 100, 'head': 100, 'body': 100 }
    };

    if (scale === 'figura') {
        return 100;
    }

    return prices[scale]?.[part] || 30;
}

// Payment Modal Functions
function showPaymentModal(scale, part, price) {
    const modal = document.getElementById('payment-modal');
    if (!modal) return;

    // Update order summary
    const scaleNames = {
        '64': '64x64',
        '128': '128x128',
        '512': '512x512',
        '1024': '1024x1024',
        '2048': '2048x2048',
        'figura': 'Figura Model'
    };

    const partNames = {
        'full': 'ทั้งตัว',
        'head': 'หัว',
        'body': 'ตัว'
    };

    document.getElementById('payment-service').textContent = scaleNames[scale] || scale;
    document.getElementById('payment-scale').textContent = scale === 'figura' ? 'Custom 3D' : (partNames[part] || part);
    document.getElementById('payment-total').textContent = '฿' + price;

    // Reset payment selection
    document.querySelectorAll('.payment-method').forEach(m => {
        m.classList.remove('border-amber-500', 'bg-amber-500/10');
        m.querySelector('.payment-check').innerHTML = '';
    });
    document.getElementById('qr-display').classList.add('hidden');
    document.getElementById('bank-display').classList.add('hidden');

    // Show modal
    modal.classList.remove('opacity-0', 'invisible');
    modal.classList.add('opacity-100', 'visible');
    modal.querySelector('.bg-neutral-900').classList.remove('scale-95');
    modal.querySelector('.bg-neutral-900').classList.add('scale-100');
    document.body.style.overflow = 'hidden';

    // Initialize payment method selection
    initPaymentMethods();
}

function initPaymentMethods() {
    const methods = document.querySelectorAll('.payment-method');
    const qrDisplay = document.getElementById('qr-display');
    const bankDisplay = document.getElementById('bank-display');

    methods.forEach(method => {
        method.addEventListener('click', function () {
            // Remove active from all
            methods.forEach(m => {
                m.classList.remove('border-amber-500', 'bg-amber-500/10');
                m.querySelector('.payment-check').innerHTML = '';
            });

            // Add active to clicked
            this.classList.add('border-amber-500', 'bg-amber-500/10');
            this.querySelector('.payment-check').innerHTML = '<div class="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>';

            const methodType = this.dataset.method;

            // Show appropriate display
            if (methodType === 'bank') {
                qrDisplay.classList.add('hidden');
                bankDisplay.classList.remove('hidden');
            } else {
                bankDisplay.classList.add('hidden');
                qrDisplay.classList.remove('hidden');
            }

            // Show slip upload section
            const slipSection = document.getElementById('slip-upload-section');
            if (slipSection) {
                slipSection.classList.remove('hidden');
            }
        });
    });

    // Initialize slip upload
    initSlipUpload();
}

function initSlipUpload() {
    const slipUpload = document.getElementById('slip-upload');
    const slipInput = document.getElementById('slip-input');
    const slipPlaceholder = document.getElementById('slip-placeholder');
    const slipPreview = document.getElementById('slip-preview');
    const slipImage = document.getElementById('slip-image');
    const removeSlip = document.getElementById('remove-slip');

    if (!slipUpload || !slipInput) return;

    slipUpload.addEventListener('click', () => {
        slipInput.click();
    });

    slipInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                slipImage.src = event.target.result;
                slipPlaceholder.classList.add('hidden');
                slipPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    if (removeSlip) {
        removeSlip.addEventListener('click', (e) => {
            e.stopPropagation();
            slipInput.value = '';
            slipImage.src = '';
            slipPreview.classList.add('hidden');
            slipPlaceholder.classList.remove('hidden');
        });
    }
}

function hidePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.classList.remove('opacity-100', 'visible');
        modal.classList.add('opacity-0', 'invisible');
        modal.querySelector('.bg-neutral-900').classList.remove('scale-100');
        modal.querySelector('.bg-neutral-900').classList.add('scale-95');
        document.body.style.overflow = '';
    }
}

// Initialize payment modal buttons
document.addEventListener('DOMContentLoaded', () => {
    const closePayment = document.getElementById('close-payment');
    const confirmPayment = document.getElementById('confirm-payment');
    const paymentModal = document.getElementById('payment-modal');

    if (closePayment) {
        closePayment.addEventListener('click', hidePaymentModal);
    }

    if (confirmPayment) {
        confirmPayment.addEventListener('click', async () => {
            // Check if payment method selected
            const selected = document.querySelector('.payment-method.border-amber-500');
            if (!selected) {
                alert('กรุณาเลือกช่องทางการชำระเงิน');
                return;
            }

            // Get payment method
            const paymentMethod = selected.dataset.method;
            const slipFile = document.getElementById('slip-input').files[0];

            if (!slipFile) {
                alert('กรุณาแนบสลิปการโอนเงิน');
                return;
            }

            // Show loading state
            const originalText = confirmPayment.innerHTML;
            confirmPayment.innerHTML = '<span class="animate-pulse">⏳ กำลังส่งข้อมูล...</span>';
            confirmPayment.disabled = true;

            try {
                await sendOrderToDiscord(paymentMethod, slipFile);

                hidePaymentModal();

                // Show success modal
                setTimeout(() => {
                    showSuccessModal();

                    // Reset form
                    const form = document.getElementById('order-form');
                    if (form) {
                        form.reset();
                        clearImagePreviews();
                        // Reset upload/payment UI
                        document.getElementById('slip-image').src = '';
                        document.getElementById('slip-preview').classList.add('hidden');
                        document.getElementById('slip-placeholder').classList.remove('hidden');
                    }
                }, 300);
            } catch (error) {
                console.error('Error sending order:', error);
                alert('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + error.message);
            } finally {
                confirmPayment.innerHTML = originalText;
                confirmPayment.disabled = false;
            }
        });
    }

    if (paymentModal) {
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                hidePaymentModal();
            }
        });
    }
});

// Discord Webhook Configuration
// Backend API Configuration
// 🔴 Debugging: Use full URL to bypass proxy issues
const API_URL = '/api/order';

async function sendOrderToDiscord(paymentMethod, slipFile) {
    console.log('🚀 sendOrderToDiscord called');
    alert('DEBUG: กำลังเริ่มส่งข้อมูล... (Check 1)');

    const formData = new FormData();

    // Get form values
    const name = document.getElementById('customer-name').value;
    const discordId = document.getElementById('discord-id').value;
    const scale = document.getElementById('skin-scale').value;
    const part = document.getElementById('skin-part').value || '-';

    // Scale & Part names for display
    const scaleNames = {
        '64': '64x64', '128': '128x128', '512': '512x512',
        '1024': '1024x1024', '2048': '2048x2048', 'figura': 'Figura Model'
    };
    const partNames = { 'full': 'ทั้งตัว', 'head': 'หัว', 'body': 'ตัว', '-': '-' };
    const methodNames = { 'promptpay': 'PromptPay', 'bank': 'โอนผ่านธนาคาร', 'truemoney': 'True Money Wallet' };

    // Append text data
    formData.append('name', name);
    formData.append('discordId', discordId);
    formData.append('scale', scaleNames[scale] || scale);
    formData.append('part', partNames[part] || part);
    formData.append('price', document.getElementById('estimated-price').innerText);
    formData.append('paymentMethod', methodNames[paymentMethod] || paymentMethod);

    // Append files
    formData.append('slip', slipFile);

    // Reference files
    const refFiles = document.getElementById('reference-images').files;
    if (refFiles.length > 0) {
        for (let i = 0; i < Math.min(refFiles.length, 5); i++) {
            formData.append('references', refFiles[i]);
        }
    }

    try {
        console.log('Sending fetch request to:', API_URL);
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Unknown Server Error');
        }

        alert('DEBUG: ส่งข้อมูลสำเร็จ! (Success)');

    } catch (error) {
        console.error('Fetch Error:', error);
        alert('❌ DEBUG ERROR: ' + error.message);
        throw error;
    }
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('opacity-0', 'invisible');
        modal.classList.add('opacity-100', 'visible');
        const content = modal.querySelector('.bg-neutral-900');
        if (content) {
            content.classList.remove('scale-90');
            content.classList.add('scale-100');
        }
        document.body.style.overflow = 'hidden';
    }
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('border-red-500', 'ring-2', 'ring-red-500/20');

            // Shake animation
            field.classList.add('animate-shake');
            setTimeout(() => field.classList.remove('animate-shake'), 500);

            field.addEventListener('input', () => {
                field.classList.remove('border-red-500', 'ring-2', 'ring-red-500/20');
            }, { once: true });
        }
    });

    return isValid;
}

// ================================
// Service Type Change
// ================================
function initServiceTypeChange() {
    const serviceType = document.getElementById('service-type');
    const scaleGroup = document.getElementById('scale-group');
    const skinScale = document.getElementById('skin-scale');

    if (!serviceType || !scaleGroup) return;

    serviceType.addEventListener('change', () => {
        if (serviceType.value === 'figura') {
            scaleGroup.style.opacity = '0';
            scaleGroup.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                scaleGroup.style.display = 'none';
            }, 300);
            skinScale.removeAttribute('required');
        } else {
            scaleGroup.style.display = 'block';
            setTimeout(() => {
                scaleGroup.style.opacity = '1';
                scaleGroup.style.transform = 'translateY(0)';
            }, 10);
            skinScale.setAttribute('required', '');
            updateScaleOptions(serviceType.value);
        }
    });

    // Add transition styles
    if (scaleGroup) {
        scaleGroup.style.transition = 'opacity 0.3s, transform 0.3s';
    }
}

function updateScaleOptions(serviceType) {
    const skinScale = document.getElementById('skin-scale');
    const options = skinScale.querySelectorAll('option');

    options.forEach(option => {
        option.style.display = 'block';
    });

    switch (serviceType) {
        case 'standard':
            options.forEach(option => {
                if (['256', '512', '1024', '2048'].includes(option.value)) {
                    option.style.display = 'none';
                }
            });
            break;
        case 'hd':
            options.forEach(option => {
                if (['64', '128', '1024', '2048'].includes(option.value)) {
                    option.style.display = 'none';
                }
            });
            break;
        case 'ultra-hd':
            options.forEach(option => {
                if (['64', '128', '256', '512'].includes(option.value)) {
                    option.style.display = 'none';
                }
            });
            break;
    }

    skinScale.value = '';
}

// ================================
// File Upload
// ================================
function initFileUpload() {
    const fileInput = document.getElementById('reference-images');
    const fileUpload = document.getElementById('file-upload');
    const previewContainer = document.getElementById('image-preview');

    if (!fileInput || !previewContainer) return;

    let uploadedFiles = [];

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);

        files.forEach((file, index) => {
            if (file.type.startsWith('image/') && uploadedFiles.length < 5) {
                uploadedFiles.push(file);
                createImagePreview(file, previewContainer, uploadedFiles, index);
            }
        });
    });

    // Drag and drop with visual feedback
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.classList.add('border-violet-500', 'bg-violet-500/10', 'scale-[1.02]');
    });

    fileUpload.addEventListener('dragleave', () => {
        fileUpload.classList.remove('border-violet-500', 'bg-violet-500/10', 'scale-[1.02]');
    });

    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.classList.remove('border-violet-500', 'bg-violet-500/10', 'scale-[1.02]');

        const files = Array.from(e.dataTransfer.files);
        files.forEach((file, index) => {
            if (file.type.startsWith('image/') && uploadedFiles.length < 5) {
                uploadedFiles.push(file);
                createImagePreview(file, previewContainer, uploadedFiles, index);
            }
        });
    });
}

function createImagePreview(file, container, filesArray, index) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item relative w-20 h-20 rounded-lg overflow-hidden opacity-0 scale-90 transition-all duration-300';
        previewItem.style.animationDelay = `${index * 100}ms`;

        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = file.name;
        img.className = 'w-full h-full object-cover';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center transition-colors duration-200';
        removeBtn.innerHTML = '×';
        removeBtn.type = 'button';

        removeBtn.addEventListener('click', () => {
            previewItem.classList.add('scale-0', 'opacity-0');
            setTimeout(() => {
                const idx = filesArray.indexOf(file);
                if (idx > -1) filesArray.splice(idx, 1);
                previewItem.remove();
            }, 300);
        });

        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        container.appendChild(previewItem);

        // Trigger animation
        requestAnimationFrame(() => {
            previewItem.classList.remove('opacity-0', 'scale-90');
            previewItem.classList.add('opacity-100', 'scale-100');
        });
    };

    reader.readAsDataURL(file);
}

function clearImagePreviews() {
    const previewContainer = document.getElementById('image-preview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
}

// ================================
// Gallery Filter
// ================================
function initGalleryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (!filterBtns.length || !galleryItems.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button with animation
            filterBtns.forEach(b => {
                b.classList.remove('from-violet-500', 'to-cyan-500', 'bg-gradient-to-r');
                b.classList.add('bg-white/5', 'text-white/60', 'border', 'border-white/10');
            });
            btn.classList.remove('bg-white/5', 'text-white/60', 'border', 'border-white/10');
            btn.classList.add('from-violet-500', 'to-cyan-500', 'bg-gradient-to-r', 'text-white');

            const filter = btn.dataset.filter;

            // Filter items with stagger animation
            galleryItems.forEach((item, index) => {
                item.style.transitionDelay = `${index * 50}ms`;

                if (filter === 'all' || item.dataset.category === filter) {
                    item.classList.remove('hidden', 'scale-0', 'opacity-0');
                    item.classList.add('scale-100', 'opacity-100');
                } else {
                    item.classList.add('scale-0', 'opacity-0');
                    setTimeout(() => {
                        if (!item.classList.contains('scale-100')) {
                            item.classList.add('hidden');
                        }
                    }, 300);
                }
            });
        });
    });
}

// ================================
// Modal
// ================================
function initModal() {
    const closeBtn = document.getElementById('close-modal');
    const modal = document.getElementById('success-modal');

    if (!closeBtn || !modal) return;

    closeBtn.addEventListener('click', () => {
        hideModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            hideModal();
        }
    });
}

function showModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('opacity-0', 'invisible');
        modal.classList.add('opacity-100', 'visible');
        const content = modal.querySelector('.bg-neutral-900');
        if (content) {
            content.classList.remove('scale-90');
            content.classList.add('scale-100');
        }
        document.body.style.overflow = 'hidden';
    }
}

function hideModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('opacity-100', 'visible');
        modal.classList.add('opacity-0', 'invisible');
        const content = modal.querySelector('.bg-neutral-900');
        if (content) {
            content.classList.remove('scale-100');
            content.classList.add('scale-90');
        }
        document.body.style.overflow = '';
    }
}

// ================================
// Counter Animation
// ================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    };

    updateCounter();
}

// Initialize counters when they come into view
const counters = document.querySelectorAll('[data-counter]');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.counter);
            animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

// ================================
// Scroll Reveal Animation
// ================================
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    // Trigger once on load
    revealOnScroll();
}

// ================================
// Parallax Effect
// ================================
function initParallax() {
    const heroSection = document.getElementById('home');
    if (!heroSection) return;

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;

        // Simple parallax for hero background elements if any
        // Note: Main content uses Reveal, so we keep this subtle
    });

    // Mouse Parallax for floating elements
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        document.querySelectorAll('.animate-float').forEach((el, index) => {
            const speed = (index + 1) * 10;
            const x = (mouseX * speed);
            const y = (mouseY * speed);
            // We use transform in CSS animation, so this might conflict.
            // Better to skip if it conflicts, or use a wrapper.
            // For now, let's just leave it empty or simple to avoid breaking layout.
        });
    });
}
