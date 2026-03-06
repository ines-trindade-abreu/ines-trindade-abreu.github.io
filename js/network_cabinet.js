/* ============================================================
   CABINET OF CURIOSITIES PARTICLES — particles.js config
   Reads --navy and --navy-mid from CSS variables
   so colours follow the dark/light mode toggle.
============================================================ */

function getParticleColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    node: style.getPropertyValue('--navy').trim()     || '#1b2a4a',
    line: style.getPropertyValue('--navy-mid').trim() || '#2e4a7a',
    bg:   style.getPropertyValue('--bg-secondary').trim() || '#ede4d0',
  };
}

function initParticles() {
  const c = getParticleColors();
  particlesJS("particles-js", {
    "particles": {
      "number": { "value": 400, "density": { "enable": true, "value_area": 800 } },
      "color": { "value": c.node },
      "shape": {
        "type": "circle",
        "stroke": { "width": 0, "color": c.node },
        "polygon": { "nb_sides": 5 },
        "image": { "src": "", "width": 100, "height": 100 }
      },
      "opacity": {
        "value": 1, "random": false,
        "anim": { "enable": false, "speed": 2, "opacity_min": 0, "sync": false }
      },
      "size": {
        "value": 8, "random": true,
        "anim": { "enable": true, "speed": 20, "size_min": 0, "sync": false }
      },
      "line_linked": {
        "enable": true, "distance": 100,
        "color": c.line, "opacity": 0.6, "width": 1
      },
      "move": {
        "enable": true, "speed": 4, "direction": "none",
        "random": false, "straight": false,
        "out_mode": "out", "bounce": true,
        "attract": { "enable": false, "rotateX": 3000, "rotateY": 3000 }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": { "enable": true, "mode": "grab" },
        "onclick": { "enable": true, "mode": "push" },
        "resize": true
      },
      "modes": {
        "grab":    { "distance": 100, "line_linked": { "opacity": 1 } },
        "bubble":  { "distance": 200, "size": 80, "duration": 0.4, "opacity": 8, "speed": 2 },
        "repulse": { "distance": 200, "duration": 0.4 },
        "push":    { "particles_nb": 4 },
        "remove":  { "particles_nb": 2 }
      }
    },
    "retina_detect": true
  });
}

function destroyParticles() {
  if (window.pJSDom && window.pJSDom.length > 0) {
    window.pJSDom[0].pJS.fn.vendors.destroypJS();
    window.pJSDom = [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('particles-js')) return;

  initParticles();

  /* Re-init on theme toggle — same MutationObserver pattern as network-header.js */
  const themeObserver = new MutationObserver(() => {
    destroyParticles();
    initParticles();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
});

/* ---- stats.js config (remove counter in production) ---- */
/*var count_particles, stats, update;
stats = new Stats;
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);
count_particles = document.querySelector('.js-count-particles');
update = function() {
  stats.begin();
  stats.end();
  if (window.pJSDom[0] && window.pJSDom[0].pJS.particles.array) {
    count_particles.innerText = window.pJSDom[0].pJS.particles.array.length;
  }
  requestAnimationFrame(update);
};
requestAnimationFrame(update);*/