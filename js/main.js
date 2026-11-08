const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.nav-links a');

if (menuToggle && siteNav) {
  document.body.classList.add('js-enabled');

  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Close navigation menu' : 'Open navigation menu'
    );
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
    });
  });
}

const aboutTabs = document.querySelectorAll('[role="tab"]');

aboutTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    activateAboutTab(tab);
  });

  tab.addEventListener('keydown', (event) => {
    let nextIndex = index;

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % aboutTabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + aboutTabs.length) % aboutTabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = aboutTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    activateAboutTab(aboutTabs[nextIndex]);
    aboutTabs[nextIndex].focus();
  });
});

function activateAboutTab(activeTab) {
  aboutTabs.forEach((tab) => {
    const isActive = tab === activeTab;
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;

    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.hidden = !isActive;
  });
}
