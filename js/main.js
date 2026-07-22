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
 * Recorrido guiado: el entrenador conduce la página.
 *
 * Él va bajando por las secciones, ilumina la que está explicando y te
 * lo cuenta frase a frase (se avanza pulsando). Termina señalándote el
 * botón de descarga. Se puede saltar y se puede repetir.
 */
document.addEventListener('DOMContentLoaded', () => {
    const dim = document.getElementById('tourDim');
    const stage = document.getElementById('tourStage');
    if (!dim || !stage) return;

    const elText = document.getElementById('tourText');
    const elDots = document.getElementById('tourDots');
    const elNext = document.getElementById('tourNext');
    const elSkip = document.getElementById('tourSkip');
    const elCta = document.getElementById('tourCta');
    const cube = document.getElementById('playCube');

    // El guion. Cada paso dice a qué sección mirar, qué pose pone y qué dice.
    const STEPS = [
        { at: null,            pose: 'wave',  text: 'Ey, ¿qué tal? Soy el entrenador que va dentro de GymSpeak. Ven, que te enseño esto en un momento.' },
        { at: 'entrenador',    pose: 'squat', text: 'Este soy yo. Miro lo que entrenas y te digo cómo lo llevas, pero hablando claro: nada de gráficas raras ni palabros.' },
        { at: 'features',      pose: 'point', text: 'Empecemos por lo importante. Acabas la serie, lo dices en voz alta y queda apuntado. Ya está, eso es toda la app.' },
        { at: 'features',      pose: 'point', text: 'También puedes meter a tus colegas, picaros entre vosotros y subir de rango según lo fuertes que os pongáis.' },
        { at: 'features',      pose: 'think', text: 'Y si te escaqueas, te doy la brasa. Con cariño, pero te la doy. Tú decides cuánto aprieto.' },
        { at: 'features',      pose: 'point', text: 'Ah, y funciona sin cobertura. Que ya sabemos cómo son los sótanos de los gimnasios.' },
        { at: 'screenshots',   pose: 'point', text: 'Mira, así se ve por dentro. Rutinas, historial, progreso, amigos... todo a un toque.' },
        { at: 'how-it-works',  pose: 'think', text: 'El truco no tiene truco: tocas el micro, hablas, y yo te lo convierto en series, repes y kilos.' },
        { at: 'how-it-works',  pose: 'walk',  text: 'Te lo dejo colocado en tu día y tú sigues a lo tuyo, que te queda otra serie.' },
        { at: 'rangos',        pose: 'point', text: 'Y esto es lo que vas desbloqueando según te pones fuerte.' },
        { at: 'rangos',        pose: 'cheer', text: 'De bronce a maestro. Yo tardé lo mío en subir, no te voy a mentir.' },
        { at: 'descarga',      pose: 'point', text: 'Pues eso es todo. Es gratis, así que poco tienes que pensar.', target: true },
        { at: 'descarga',      pose: 'cheer', text: '¿Ves ese botón de ahí abajo? Dale y nos vemos dentro. Te espero.', target: true, last: true },
    ];

    let i = -1;
    let typer = null;
    let focused = null;
    let running = false;

    // Puntitos de progreso
    STEPS.forEach(() => elDots.appendChild(document.createElement('i')));
    const dots = [...elDots.children];

    function focus(id) {
        if (focused) focused.classList.remove('tour-focus');
        focused = null;
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('tour-focus');
        focused = el;
        // Él te baja la página hasta lo que te está enseñando
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function type(text) {
        clearInterval(typer);
        elText.textContent = '';
        let n = 0;
        typer = setInterval(() => {
            n += 1;
            elText.textContent = text.slice(0, n);
            if (n >= text.length) { clearInterval(typer); typer = null; }
        }, 16);
    }

    function show(n) {
        i = n;
        const step = STEPS[i];
        stage.dataset.pose = step.pose;
        type(step.text);
        dots.forEach((d, k) => d.classList.toggle('on', k <= i));

        // Solo movemos la página cuando cambia de sección
        if (!STEPS[i - 1] || STEPS[i - 1].at !== step.at) focus(step.at);

        if (cube) cube.classList.toggle('is-target', !!step.target);
        elCta.hidden = !step.last;
        elNext.hidden = !!step.last;
    }

    function next() {
        // Si aún está escribiendo, el primer clic completa la frase
        if (typer) {
            clearInterval(typer);
            typer = null;
            elText.textContent = STEPS[i].text;
            return;
        }
        if (i < STEPS.length - 1) show(i + 1);
        else stop();
    }

    function start() {
        if (running) return;
        running = true;
        dim.hidden = false;
        stage.hidden = false;
        // Con setTimeout y no requestAnimationFrame: rAF no dispara si la
        // pestaña no está componiendo (segundo plano), y el recorrido se
        // quedaría invisible con opacidad 0.
        setTimeout(() => {
            dim.classList.add('is-on');
            stage.classList.add('is-on');
        }, 20);
        show(0);
    }

    function stop() {
        running = false;
        clearInterval(typer);
        typer = null;
        dim.classList.remove('is-on');
        stage.classList.remove('is-on');
        if (focused) focused.classList.remove('tour-focus');
        if (cube) cube.classList.remove('is-target');
        setTimeout(() => { dim.hidden = true; stage.hidden = true; }, 500);
    }

    elNext.addEventListener('click', next);
    elSkip.addEventListener('click', stop);
    dim.addEventListener('click', next);
    document.addEventListener('keydown', (e) => {
        if (!running) return;
        if (e.key === 'Escape') stop();
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
    });

    // Botón para volver a verlo cuando ya lo has saltado
    const replay = document.getElementById('replayTour');
    if (replay) replay.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(start, 400); });

    // Arranca solo, dando un momento a que cargue la portada
    setTimeout(start, 900);
});
