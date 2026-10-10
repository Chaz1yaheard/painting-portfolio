let paintings = [];
let current = 0;
let lastFocused = null;
let renderedColumns = 0;

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

/* Lightbox */
function showPainting(index) {
  current = (index + paintings.length) % paintings.length;
  const p = paintings[current];
  lightboxImg.src = p.image;
  lightboxImg.alt = p.title;
  lightboxCaption.textContent = p.title;
}

function openLightbox(index) {
  lastFocused = document.activeElement;
  showPainting(index);
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lb-close').focus();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lb-prev').addEventListener('click', () => showPainting(current - 1));
lightbox.querySelector('.lb-next').addEventListener('click', () => showPainting(current + 1));

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPainting(current - 1);
  if (e.key === 'ArrowRight') showPainting(current + 1);
});

let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) showPainting(current + (dx < 0 ? 1 : -1));
});

/* Fade-in on scroll */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

/* Gallery */
function columnCount() {
  const w = window.innerWidth;
  if (w > 800) return 3;
  if (w > 480) return 2;
  return 1;
}

function renderGallery(animate) {
  const gallery = document.getElementById('gallery');
  const n = columnCount();
  renderedColumns = n;
  gallery.innerHTML = '';

  const cols = [];
  for (let c = 0; c < n; c++) {
    const col = document.createElement('div');
    col.className = 'gallery-col';
    gallery.appendChild(col);
    cols.push(col);
  }

  const items = [];
  paintings.forEach((painting, i) => {
    const item = document.createElement('div');
    item.className = 'painting';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'View ' + painting.title);

    const img = document.createElement('img');
    img.src = painting.image;
    img.alt = painting.title;
    img.decoding = 'async';

    const caption = document.createElement('p');
    caption.textContent = painting.title;

    item.append(img, caption);
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });

    cols[i % n].appendChild(item);
    items.push(item);
  });

  if (!animate) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  // Wait two frames so the invisible starting state is painted first,
  // then start watching each painting once its image has loaded
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      items.forEach((el, i) => {
        el.style.transitionDelay = `${(i % n) * 0.1}s`;
        const img = el.querySelector('img');
        const watch = () => observer.observe(el);
        if (img.complete) {
          watch();
        } else {
          img.addEventListener('load', watch, { once: true });
          img.addEventListener('error', watch, { once: true });
        }
      });
    });
  });
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (paintings.length && columnCount() !== renderedColumns) {
      renderGallery(false);
    }
  }, 150);
});

async function loadGallery() {
  try {
    const response = await fetch('content/paintings.json');
    const data = await response.json();
    paintings = data.paintings || [];
    renderGallery(true);
  } catch (err) {
    document.getElementById('gallery').textContent =
      'The gallery could not load. Refresh the page to try again.';
  }
}

loadGallery();