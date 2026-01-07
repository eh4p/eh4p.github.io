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

// Experience Section - Horizontal Timeline Navigation
(function() {
  'use strict';

  const companyBtns = document.querySelectorAll('.company-btn');
  const companyPanels = document.querySelectorAll('.company-panel');
  const movingCircle = document.querySelector('.moving-circle');
  const horizontalProgress = document.querySelector('.horizontal-progress');
  const lineDots = document.querySelectorAll('.line-dot');
  const lineContainer = document.querySelector('.horizontal-line-container');

  if (!companyBtns.length || !lineContainer) return;

  // Calculate positions dynamically based on button positions
  let positions = [];

  function updatePositions() {
    positions = [];
    const containerRect = lineContainer.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const containerWidth = containerRect.width;

    companyBtns.forEach(btn => {
      const btnRect = btn.getBoundingClientRect();
      const btnCenter = btnRect.left + btnRect.width / 2;
      const relativePosition = ((btnCenter - containerLeft) / containerWidth) * 100;
      positions.push(Math.max(5, Math.min(95, relativePosition)));
    });

    // Update line dot positions
    lineDots.forEach((dot, index) => {
      if (index < positions.length) {
        dot.style.left = `${positions[index]}%`;
      }
    });
  }

  // Initial position calculation (delayed for layout to settle)
  setTimeout(updatePositions, 100);

  // Also recalculate after fonts load
  if (document.fonts) {
    document.fonts.ready.then(() => {
      setTimeout(updatePositions, 50);
    });
  }

  // Recalculate on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updatePositions();
      // Update active position if any company is selected
      const activeBtn = document.querySelector('.company-btn.active');
      if (activeBtn) {
        const activeIndex = Array.from(companyBtns).indexOf(activeBtn);
        if (activeIndex >= 0) {
          const targetPosition = positions[activeIndex];
          movingCircle.style.left = `${targetPosition}%`;
          horizontalProgress.style.width = `${targetPosition}%`;
        }
      }
    }, 150);
  });

  // Handle company button clicks
  companyBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      selectCompany(index);
    });

    // Keyboard accessibility
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCompany(index);
      }
    });
  });

  // Function to select a company
  function selectCompany(index) {
    const clickedBtn = companyBtns[index];
    const companyKey = clickedBtn.dataset.company;

    // Remove active class from all buttons and panels
    companyBtns.forEach(btn => btn.classList.remove('active'));
    companyPanels.forEach(panel => panel.classList.remove('active'));
    lineDots.forEach(dot => dot.classList.remove('active'));

    // Add active class to clicked button
    clickedBtn.classList.add('active');

    // Show corresponding panel
    const targetPanel = document.querySelector(`.company-panel[data-company="${companyKey}"]`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Update moving circle position
    const targetPosition = positions[index];
    movingCircle.style.left = `${targetPosition}%`;
    movingCircle.classList.add('visible');
    movingCircle.classList.add('active');

    // Update progress line (fill up to selected position)
    horizontalProgress.style.width = `${targetPosition}%`;

    // Update line dots
    lineDots.forEach((dot, dotIndex) => {
      if (dotIndex <= index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Brief flash effect on the panel
    if (targetPanel) {
      targetPanel.style.background = 'rgba(255, 255, 255, 0.1)';
      setTimeout(() => {
        targetPanel.style.background = '';
      }, 300);
    }
  }

  // Handle clicks on line dots
  lineDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      selectCompany(index);
    });

    dot.style.cursor = 'pointer';
  });

  // Scroll-based animation for the experience section
  const experienceSection = document.querySelector('.experience');
  if (experienceSection) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate in elements
          companyBtns.forEach((btn, i) => {
            setTimeout(() => {
              btn.style.opacity = '1';
              btn.style.transform = 'translateY(0)';
            }, i * 100);
          });

          // Show the horizontal line with animation
          const horizontalLine = document.querySelector('.horizontal-line');
          if (horizontalLine) {
            horizontalLine.style.width = '0';
            setTimeout(() => {
              horizontalLine.style.width = '100%';
            }, 100);
          }

          sectionObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    sectionObserver.observe(experienceSection);
  }

  // Set initial state for company buttons (hidden for animation)
  companyBtns.forEach(btn => {
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(10px)';
    btn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
})();

