// Timeline scroll animation
(function() {
  'use strict';

  const timeline = document.querySelector('.timeline');
  const timelineItems = document.querySelectorAll('.timeline-item');

  if (!timeline) return;

  // Create progress line element
  const progressLine = document.createElement('div');
  progressLine.className = 'timeline-progress-line';
  timeline.appendChild(progressLine);

  // Update progress line based on scroll
  const updateProgressLine = () => {
    const timelineRect = timeline.getBoundingClientRect();
    const timelineTop = timelineRect.top;
    const timelineHeight = timelineRect.height;
    const windowHeight = window.innerHeight;

    // Calculate how much of the timeline has been scrolled through
    let progress = (windowHeight - timelineTop) / (windowHeight + timelineHeight);

    // Clamp between 0 and 1
    progress = Math.max(0, Math.min(1, progress));

    // Update progress line height
    progressLine.style.height = `${progress * 100}%`;
  };

  // Use Intersection Observer for better performance
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -15% 0px',
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all timeline items
  timelineItems.forEach(item => {
    observer.observe(item);
  });

  // Fallback: Check items on scroll (for older browsers)
  const checkTimelineItems = () => {
    const triggerBottom = window.innerHeight * 0.85;

    timelineItems.forEach(item => {
      const itemTop = item.getBoundingClientRect().top;

      if (itemTop < triggerBottom) {
        item.classList.add('visible');
      }
    });
  };

  // Handle scroll events
  const onScroll = () => {
    updateProgressLine();
    checkTimelineItems();
  };

  // Initial check
  onScroll();

  // Listen for scroll events with throttling
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = requestAnimationFrame(onScroll);
  });

  // Also update on window resize
  window.addEventListener('resize', updateProgressLine);
})();
