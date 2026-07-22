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
    const cube = document.getElementById('playCube');

    // El recorrido. Ahora el entrenador es quien EXPLICA la app: en cada
    // sección suelta varias frases, y va señalando lo que te cuenta.
    // Por eso las secciones ya casi no llevan texto propio.
    const SCRIPT = {
        entrenador: [
            { pose: 'wave',  text: 'Ey. Soy yo, el que va dentro de la app.' },
            { pose: 'squat', text: 'Miro lo que entrenas y te digo qué tal lo llevas. Sin palabros raros.' },
        ],
        features: [
            { pose: 'point-up', text: 'Esto es lo que hace: acabas la serie, lo dices en voz alta y queda apuntado.' },
            { pose: 'point-up', text: 'También metes a tus colegas, os picáis y subís de rango según lo fuertes que estéis.' },
            { pose: 'think',    text: 'Y si te escaqueas, te doy la brasa. Con cariño, pero te la doy.' },
            { pose: 'point-up', text: 'Ah, y en el gimnasio funciona sin cobertura. Que ya sabemos cómo son los sótanos.' },
        ],
        screenshots: [
            { pose: 'point-up', text: 'Mira, así se ve por dentro. Nada de rellenar casillas entre series.' },
            { pose: 'walk',     text: 'Rutinas, historial, progreso, amigos... todo a un toque.' },
        ],
        'how-it-works': [
            { pose: 'think', text: 'El truco no tiene truco: tocas el micro y hablas.' },
            { pose: 'point-up', text: 'Yo te lo convierto en series, repes y kilos, y te lo dejo colocado en tu día.' },
            { pose: 'walk',  text: 'Tú a lo tuyo, que te queda otra serie.' },
        ],
        rangos: [
            { pose: 'point-up', text: 'Y esto es lo que vas desbloqueando según te pones fuerte.' },
            { pose: 'cheer',    text: 'De bronce a maestro. Yo tardé lo mío, no te voy a mentir.' },
        ],
    };
    const FINAL = [
        { pose: 'point-up', text: 'Pues ya está, eso es todo. Es gratis.' },
        { pose: 'point-up', text: '¿Ves ese botón de ahí? Dale y nos vemos dentro.', target: true },
    ];

    let dismissed = false;
    let shown = false;
    let currentKey = null;

    let timer = null;

    /** Encadena las frases de una parada, una cada pocos segundos. */
    function play(key, lines, isFinal) {
        if (dismissed || currentKey === key) return;
        currentKey = key;
        clearTimeout(timer);
        guide.hidden = false;
        if (!shown) {
            requestAnimationFrame(() => guide.classList.add('is-in'));
            shown = true;
        }

        let i = 0;
        const step = () => {
            const entry = lines[i];
            // Reiniciar la animación del bocadillo en cada frase
            bubble.style.animation = 'none';
            void bubble.offsetWidth;
            bubble.style.animation = '';
            bubble.textContent = entry.text;
            guide.dataset.pose = entry.pose;
            cta.hidden = !(isFinal && i === lines.length - 1);

            // Al señalarte el botón de descarga, este se enciende
            if (cube) cube.classList.toggle('is-target', !!entry.target);

            i += 1;
            if (i < lines.length) {
                // Le damos tiempo a leer: cuanto más larga la frase, más rato
                timer = setTimeout(step, 2600 + entry.text.length * 38);
            }
        };
        step();
    }

    // Cada sección con guion se convierte en una parada
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const key = e.target.id;
            if (SCRIPT[key]) play(key, SCRIPT[key], false);
        });
    }, { threshold: 0.35 });

    Object.keys(SCRIPT).forEach(id => {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
    });

    // El remate: al llegar a la sección de descarga te señala el botón
    const end = document.getElementById('descarga') || document.querySelector('.footer');
    if (end) {
        new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) play('final', FINAL, true);
            });
        }, { threshold: 0.35 }).observe(end);
    }

    closeBtn.addEventListener('click', () => {
        dismissed = true;
        clearTimeout(timer);
        if (cube) cube.classList.remove('is-target');
        guide.classList.remove('is-in');
        setTimeout(() => { guide.hidden = true; }, 450);
    });
});
