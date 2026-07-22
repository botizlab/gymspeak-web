/**
 * GymSpeak Landing Page Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once it has become visible
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    const fadeElements = document.querySelectorAll('.fade-in, .slide-up');
    
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

/**
 * El entrenador te acompaña por la página.
 * Según entras en cada sección, cambia de pose y te cuenta algo.
 * Al final, te anima a instalarla y enseña el botón de descarga.
 */
document.addEventListener('DOMContentLoaded', () => {
    const guide = document.getElementById('guide');
    if (!guide) return;

    const bubble = document.getElementById('guideBubble');
    const cta = document.getElementById('guideCta');
    const closeBtn = document.getElementById('guideClose');

    // Qué dice y qué hace en cada parada del recorrido
    const SCRIPT = {
        entrenador: { pose: 'squat', text: 'Ey, soy yo. Yo soy quien te va a decir cómo llevas los entrenos.' },
        features:   { pose: 'point', text: 'Mira, aquí está lo que hace. Poca cosa y bien hecha: hablas y queda apuntado.' },
        screenshots:{ pose: 'walk',  text: 'Así se ve por dentro. Sin menús eternos ni rellenar casillas.' },
        'how-it-works': { pose: 'think', text: 'Es tan tonto como parece: terminas la serie, lo dices, y ya está.' },
        rangos:     { pose: 'cheer', text: 'Y esto es lo que vas desbloqueando según te pones fuerte. Yo empecé en bronce, ¿eh?' },
    };
    const FINAL = { pose: 'cheer', text: '¡Venga, que te espero dentro! Dale y nos vemos en el gym.' };

    let dismissed = false;
    let shown = false;
    let currentKey = null;

    function say(key, entry, isFinal) {
        if (dismissed || currentKey === key) return;
        currentKey = key;
        guide.hidden = false;
        // Reiniciar la animación del bocadillo
        bubble.style.animation = 'none';
        void bubble.offsetWidth;
        bubble.style.animation = '';
        bubble.textContent = entry.text;
        guide.dataset.pose = entry.pose;
        cta.hidden = !isFinal;
        if (!shown) {
            requestAnimationFrame(() => guide.classList.add('is-in'));
            shown = true;
        }
    }

    // Cada sección con guion se convierte en una parada
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const key = e.target.id;
            if (SCRIPT[key]) say(key, SCRIPT[key], false);
        });
    }, { threshold: 0.35 });

    Object.keys(SCRIPT).forEach(id => {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
    });

    // Al llegar al pie: el remate, con el botón de descarga
    const footer = document.querySelector('.footer');
    if (footer) {
        new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) say('final', FINAL, true);
            });
        }, { threshold: 0.2 }).observe(footer);
    }

    closeBtn.addEventListener('click', () => {
        dismissed = true;
        guide.classList.remove('is-in');
        setTimeout(() => { guide.hidden = true; }, 450);
    });
});
