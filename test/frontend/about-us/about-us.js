// Get modal elements
const modal = document.getElementById('contactModal');
const openBtn = document.getElementById('openModalBtn');
const footerContactBtn = document.getElementById('footerContactBtn');
const closeBtn = document.getElementById('closeModalBtn');
const contactForm = document.getElementById('contactForm');

// Open modal function
function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close modal function
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Open modal on button clicks
openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
});

footerContactBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
});

// Close modal on close button click
closeBtn.addEventListener('click', closeModal);

// Close modal when clicking outside the container
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on ESC key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Handle form submission
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Log form data (replace with actual form submission logic)
    console.log('Form submitted:', { name, email, message });
    
    // Show success message
    alert('Thank you for reaching out! We will get back to you soon.');
    
    // Reset form and close modal
    this.reset();
    closeModal();
});