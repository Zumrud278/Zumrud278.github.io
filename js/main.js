// Handles shared navigation and the client-side contact form demo.
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.nav-links a');
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  const nameInput = contactForm.querySelector('[name="name"]');
  const emailInput = contactForm.querySelector('[name="email"]');
  const messageInput = contactForm.querySelector('[name="message"]');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const feedback = document.querySelector('.contact-form-feedback');

  if (nameInput && emailInput && messageInput && submitButton && feedback) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      feedback.hidden = true;
      feedback.textContent = '';

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !email || !emailInput.validity.valid || !message) {
        feedback.textContent = 'Please enter your name, a valid email address, and a message.';
        feedback.hidden = false;
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      window.setTimeout(() => {
        feedback.textContent = `Thanks, ${name}! Your message was received.`;
        feedback.hidden = false;
        nameInput.value = '';
        emailInput.value = '';
        messageInput.value = '';
        submitButton.disabled = false;
        submitButton.textContent = 'Send it';
      }, 1000);
    });
  }
}

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
