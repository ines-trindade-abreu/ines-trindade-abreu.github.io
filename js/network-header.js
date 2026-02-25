/* ============================================================
   NETWORK HEADER — D3.js Force-Directed Graph
   Used on: research.html, portfolio.html

   Requires D3 v7 in <head>:
   <script src="https://d3js.org/d3.v7.min.js"></script>
   <script src="js/network-header.js" defer></script>

   Reads CSS variables so it responds correctly to dark/light
   mode without needing to be re-initialised.
   ============================================================ */


/* ============================================================
   CONFIGURATION
   Adjust node/link counts and physics here.
   ============================================================ */

const NETWORK_CONFIG = {
  NODE_COUNT:     52,
  LINK_COUNT:     70,
  GROUP_COUNT:     5,
  NODE_RADIUS_MIN: 4,
  NODE_RADIUS_MAX: 9,
  LINK_DISTANCE:  70,
  CHARGE_STRENGTH:-90,
  COLLISION_PAD:  14,
  ALPHA_DECAY:     0.025,
  VELOCITY_DECAY:  0.4,
};

/* Palette — matches CSS variables for light AND dark mode.
   These are read at runtime so toggling data-theme is enough. */
function getPalette() {
  const style = getComputedStyle(document.documentElement);
  return {
    nodeColors: [
      style.getPropertyValue('--green-dark').trim()  || '#2D5016',
      style.getPropertyValue('--purpura').trim()     || '#6B2D6B',
      style.getPropertyValue('--teal').trim()        || '#2A6B6B',
      style.getPropertyValue('--gold').trim()        || '#C9A84C',
      style.getPropertyValue('--green-mid').trim()   || '#3E7B27',
    ],
    linkColor:   style.getPropertyValue('--border-color').trim() || '#C4B49A',
    nodeStroke:  style.getPropertyValue('--bg-card').trim()      || '#FAF7F2',
  };
}


/* ============================================================
   GRAPH BUILDER
   ============================================================ */

function buildGraph() {
  // Weighted sizes: most nodes small, a few hubs larger
  function nodeRadius() {
    return Math.random() < 0.15
      ? NETWORK_CONFIG.NODE_RADIUS_MAX
      : NETWORK_CONFIG.NODE_RADIUS_MIN + Math.random() * 3;
  }

  const nodes = Array.from({ length: NETWORK_CONFIG.NODE_COUNT }, (_, i) => ({
    id:    i,
    group: Math.floor(Math.random() * NETWORK_CONFIG.GROUP_COUNT),
    r:     nodeRadius(),
  }));

  // Ensure no self-links and no duplicates
  const linkSet = new Set();
  const links   = [];

  while (links.length < NETWORK_CONFIG.LINK_COUNT) {
    const s = Math.floor(Math.random() * NETWORK_CONFIG.NODE_COUNT);
    const t = Math.floor(Math.random() * NETWORK_CONFIG.NODE_COUNT);
    const key = `${Math.min(s,t)}-${Math.max(s,t)}`;
    if (s !== t && !linkSet.has(key)) {
      linkSet.add(key);
      links.push({ source: s, target: t });
    }
  }

  return { nodes, links };
}


/* ============================================================
   INIT NETWORK HEADER
   Call once per page; pass the container element's id.
   ============================================================ */

function initNetworkHeader(containerId) {
  const container = document.getElementById(containerId);
  if (!container || typeof d3 === 'undefined') return;

  const W = container.offsetWidth;
  const H = container.offsetHeight;

  const { nodes, links } = buildGraph();
  const palette = getPalette();

  const colorScale = d3.scaleOrdinal()
    .domain(d3.range(NETWORK_CONFIG.GROUP_COUNT))
    .range(palette.nodeColors);

  /* SVG canvas */
  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width',  W)
    .attr('height', H)
    .attr('aria-hidden', 'true');

  /* Force simulation */
  const simulation = d3.forceSimulation(nodes)
    .force('link',      d3.forceLink(links)
                          .id(d => d.id)
                          .distance(NETWORK_CONFIG.LINK_DISTANCE))
    .force('charge',    d3.forceManyBody()
                          .strength(NETWORK_CONFIG.CHARGE_STRENGTH))
    .force('center',    d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(d => d.r + NETWORK_CONFIG.COLLISION_PAD))
    .force('x',         d3.forceX(W / 2).strength(0.05))
    .force('y',         d3.forceY(H / 2).strength(0.05))
    .alphaDecay(NETWORK_CONFIG.ALPHA_DECAY)
    .velocityDecay(NETWORK_CONFIG.VELOCITY_DECAY);

  /* Links */
  const link = svg.append('g')
    .attr('class', 'network-links')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke',         palette.linkColor)
    .attr('stroke-opacity', 0.45)
    .attr('stroke-width',   1.2);

  /* Nodes */
  const node = svg.append('g')
    .attr('class', 'network-nodes')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r',            d => d.r)
    .attr('fill',         d => colorScale(d.group))
    .attr('stroke',       palette.nodeStroke)
    .attr('stroke-width', 1.5)
    .attr('cursor',       'grab')
    .call(
      d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.25).restart();
          d.fx = d.x;
          d.fy = d.y;
          d3.select(event.sourceEvent.target).attr('cursor', 'grabbing');
        })
        .on('drag', (event, d) => {
          d.fx = Math.max(d.r, Math.min(W - d.r, event.x));
          d.fy = Math.max(d.r, Math.min(H - d.r, event.y));
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          d3.select(event.sourceEvent.target).attr('cursor', 'grab');
        })
    );

  /* Subtle hover glow */
  node
    .on('mouseenter', function(event, d) {
      d3.select(this)
        .transition().duration(150)
        .attr('r', d.r + 3)
        .attr('stroke-width', 2.5);
    })
    .on('mouseleave', function(event, d) {
      d3.select(this)
        .transition().duration(150)
        .attr('r', d.r)
        .attr('stroke-width', 1.5);
    });

  /* Tick */
  simulation.on('tick', () => {
    // Clamp nodes inside canvas
    nodes.forEach(d => {
      d.x = Math.max(d.r, Math.min(W - d.r, d.x));
      d.y = Math.max(d.r, Math.min(H - d.r, d.y));
    });

    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  });

  /* Re-read palette when theme toggle fires,
     so colors update without a page reload.   */
  const themeObserver = new MutationObserver(() => {
    const p = getPalette();
    link.attr('stroke', p.linkColor);
    node.attr('stroke', p.nodeStroke);
    // Node fills update via colorScale which re-reads CSS vars
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  /* Graceful resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newW = container.offsetWidth;
      const newH = container.offsetHeight;
      svg.attr('width', newW).attr('height', newH);
      simulation
        .force('center', d3.forceCenter(newW / 2, newH / 2))
        .force('x', d3.forceX(newW / 2).strength(0.05))
        .force('y', d3.forceY(newH / 2).strength(0.05))
        .alpha(0.3)
        .restart();
    }, 200);
  });
}


/* ============================================================
   AUTO-INIT
   Fires on DOMContentLoaded if the container exists.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('network-header')) {
    initNetworkHeader('network-header');
  }
});
