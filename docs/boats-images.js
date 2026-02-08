(() => {
  const isBoatDetail = window.location.pathname.includes('/flotta/');
  const base = isBoatDetail ? '../' : '';

  const map = {
    'zar49': `${base}assets/img/FotoGommone/49.jpg`,
    'zar65': `${base}assets/img/FotoGommone/65.jpg`,
    'zar50-2025': `${base}assets/img/30.jpg`,
    'zar53': `${base}assets/img/FotoGommone/53.jpeg`,
  };

  window.BOAT_IMAGE_MAP = map;
  window.getBoatImage = (id) => map[id] || '';
})();
