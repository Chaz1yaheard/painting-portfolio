function openLightbox(element) {
  const img = element.querySelector('img');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add('active');
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
}
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

async function loadGallery() {
  const response = await fetch('content/paintings.json');
  const data = await response.json();
  const gallery = document.getElementById('gallery');

  data.paintings.forEach(painting => {
    const div = document.createElement('div');
    div.className = 'painting';
    div.innerHTML = `<img src="${painting.image}" alt="${painting.title}"><p>${painting.title}</p>`;
    div.addEventListener('click', () => openLightbox(div));
    gallery.appendChild(div);
  });

  // Wait two frames so the browser paints the invisible starting state first
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.painting').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.08}s`;
        observer.observe(el);
      });
    });
  });
}

loadGallery();