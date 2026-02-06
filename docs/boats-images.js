(() => {
  const isBoatDetail = window.location.pathname.includes('/flotta/');
  const base = isBoatDetail ? '../' : '';

  const map = {
    'zar49': `${base}assets/img/FotoGommone/FotGommone1.jpg`,
    'zar65': `${base}assets/img/FotoGommone/FotGommone6.jpg`,
    'zar50-2025': `${base}assets/img/FotoGommone/FotGommone5.jpg`,
    'zar53': `${base}assets/img/FotoGommone/FotGommone19.jpg`,
  };

  window.BOAT_IMAGE_MAP = map;
  window.getBoatImage = (id) => map[id] || '';
})();
