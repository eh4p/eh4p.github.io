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

  // Handle dot clicks
  const timelineDots = document.querySelectorAll('.timeline-dot');

  timelineDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const parentItem = dot.closest('.timeline-item');

      // Remove active class from all items
      timelineItems.forEach(item => {
        item.classList.remove('active');
      });

      // Add active class to clicked item
      parentItem.classList.add('active');

      // Smooth scroll to the item's card
      const card = parentItem.querySelector('.timeline-content');
      if (card) {
        card.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      // Trigger flash effect on the card
      if (card) {
        card.style.background = 'rgba(255, 255, 255, 0.2)';
        setTimeout(() => {
          card.style.background = '';
        }, 300);
      }
    });
  });
})();

// Experience section interactions
(function() {
  'use strict';

  const experienceItems = document.querySelectorAll('.experience-item');
  const experienceTimeline = document.querySelector('.experience-timeline');
  const movingCircle = document.querySelector('.experience-moving-circle');

  if (!experienceTimeline || !movingCircle) return;

  // Function to move the circle to a specific item
  const moveCircleToItem = (item) => {
    const timelineRect = experienceTimeline.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    // Calculate the top position relative to the timeline
    const relativeTop = itemRect.top - timelineRect.top + (itemRect.height / 2);

    // Move the circle
    movingCircle.style.top = `${relativeTop}px`;
  };

  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe all experience items
  experienceItems.forEach(item => {
    observer.observe(item);
  });

  // Handle company box clicks
  const companyBoxes = document.querySelectorAll('.experience-company-box');

  companyBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const parentItem = box.closest('.experience-item');
      const wasActive = parentItem.classList.contains('active');

      // Remove active class from all items
      experienceItems.forEach(item => {
        item.classList.remove('active');
      });

      // If it wasn't active before, activate it
      if (!wasActive) {
        parentItem.classList.add('active');

        // Move the circle to this item
        moveCircleToItem(parentItem);

        // Smooth scroll to the details
        const details = parentItem.querySelector('.experience-details');
        if (details) {
          details.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      } else {
        // If it was active, move circle back to first item
        const firstItem = experienceItems[0];
        if (firstItem) {
          moveCircleToItem(firstItem);
        }
      }
    });
  });

  // Initialize circle position to first item on load
  window.addEventListener('load', () => {
    if (experienceItems.length > 0) {
      moveCircleToItem(experienceItems[0]);
    }
  });

  // Update circle position on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      const activeItem = document.querySelector('.experience-item.active');
      if (activeItem) {
        moveCircleToItem(activeItem);
      } else if (experienceItems.length > 0) {
        moveCircleToItem(experienceItems[0]);
      }
    }, 100);
  });
})();
