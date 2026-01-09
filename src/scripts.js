// Universal Scroll-Triggered Animations
(function() {
  'use strict';

  // Select all elements with fade-in classes
  const animatedElements = document.querySelectorAll(
    '.fade-in, .fade-in-sm, .fade-in-left, .fade-in-right'
  );

  if (!animatedElements.length) return;

  // Create Intersection Observer for scroll-triggered animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  animatedElements.forEach(element => {
    observer.observe(element);
  });

  // Fallback for older browsers - check on scroll
  const checkElements = () => {
    const triggerBottom = window.innerHeight * 0.9;

    animatedElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;

      if (elementTop < triggerBottom) {
        element.classList.add('visible');
      }
    });
  };

  // Initial check
  checkElements();

  // Throttled scroll listener
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = requestAnimationFrame(checkElements);
  });
})();

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

  // Update connector line widths based on individual item scroll position
  const updateConnectorLines = () => {
    const windowHeight = window.innerHeight;
    const triggerZone = windowHeight * 0.7; // Point where line reaches full width

    timelineItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const itemTop = itemRect.top;
      const itemCenter = itemRect.top + itemRect.height / 2;

      // Calculate progress: 0 when item is at bottom of viewport, 1 when centered
      let progress = 1 - (itemCenter / triggerZone);
      progress = Math.max(0, Math.min(1, progress));

      // Apply easing for smoother animation (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Calculate width from 40px (initial) to calc(50% - 60px) (final)
      const minWidth = 40;
      const maxWidth = item.offsetWidth / 2 - 60;
      const currentWidth = minWidth + (maxWidth - minWidth) * easedProgress;

      // Set CSS variable for the connector line width
      item.style.setProperty('--connector-width', `${currentWidth}px`);

      // Also add visible class for other animations
      if (progress > 0) {
        item.classList.add('visible');
      }
    });
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
    updateConnectorLines();
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
  window.addEventListener('resize', () => {
    updateProgressLine();
    updateConnectorLines();
  });

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
          const progressWidth = activeIndex === companyBtns.length - 1 ? 100 : targetPosition;
          movingCircle.style.left = `${targetPosition}%`;
          horizontalProgress.style.width = `${progressWidth}%`;

          // Maintain green color for Freelance on resize
          if (activeIndex === companyBtns.length - 1) {
            horizontalProgress.classList.add('complete');
            movingCircle.classList.add('complete');
            activeBtn.classList.add('complete');
          } else {
            horizontalProgress.classList.remove('complete');
            movingCircle.classList.remove('complete');
          }
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

    // Add complete class for Freelance (green color)
    companyBtns.forEach(btn => btn.classList.remove('complete'));
    if (index === companyBtns.length - 1) {
      clickedBtn.classList.add('complete');
    }

    // Show corresponding panel
    const targetPanel = document.querySelector(`.company-panel[data-company="${companyKey}"]`);
    if (targetPanel) {
      targetPanel.classList.add('active');

      // Staggered animation for list items
      const listItems = targetPanel.querySelectorAll('.company-achievements li');
      listItems.forEach((item, i) => {
        item.style.transitionDelay = `${i * 0.1}s`;
      });
    }

    // Reset transition delays for all inactive panels
    companyPanels.forEach(panel => {
      if (!panel.classList.contains('active')) {
        const items = panel.querySelectorAll('.company-achievements li');
        items.forEach(item => {
          item.style.transitionDelay = '0s';
        });
      }
    });

    // Update moving circle position
    const targetPosition = positions[index];
    movingCircle.style.left = `${targetPosition}%`;
    movingCircle.classList.add('visible');
    movingCircle.classList.add('active');

    // Add complete class to circle for Freelance (green color)
    if (index === companyBtns.length - 1) {
      movingCircle.classList.add('complete');
    } else {
      movingCircle.classList.remove('complete');
    }

    // Update progress line (fill up to selected position, or 100% for last item)
    const progressWidth = index === companyBtns.length - 1 ? 100 : targetPosition;
    horizontalProgress.style.width = `${progressWidth}%`;

    // Add green color when last job (Freelance) is selected
    if (index === companyBtns.length - 1) {
      horizontalProgress.classList.add('complete');
    } else {
      horizontalProgress.classList.remove('complete');
    }

    // Update line dots
    lineDots.forEach((dot, dotIndex) => {
      if (dotIndex <= index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
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

// Projects Section - Circular Carousel
(function() {
  'use strict';

  const projectsRing = document.getElementById('projectsRing');
  const projectItems = document.querySelectorAll('.project-item');
  const projectDetailsPanel = document.getElementById('projectDetails');
  const projectDetailContents = document.querySelectorAll('.project-detail-content');
  const carouselContainer = document.querySelector('.projects-carousel-container');
  const centerProjectName = document.getElementById('centerProjectName');

  if (!projectsRing || !projectItems.length) return;

  let currentRotation = 0; // 0, 1, or 2 (representing 0, 120, 240 degrees)
  let activeProjectIndex = null;

  // Handle project item click
  projectItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      selectProject(index);
    });

    // Keyboard accessibility
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectProject(index);
      }
    });

    item.setAttribute('tabindex', '0');
  });

  function selectProject(index) {
    const targetRotation = index;
    const clickedItem = projectItems[index];
    const projectName = clickedItem.dataset.name;

    // Update current rotation
    currentRotation = targetRotation;

    // Set the rotation attribute for CSS
    projectsRing.setAttribute('data-rotation', currentRotation.toString());

    // Remove active class from all items
    projectItems.forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to clicked item
    clickedItem.classList.add('active');

    // Update center project name
    centerProjectName.textContent = projectName;
    centerProjectName.classList.add('visible');

    // Expand the carousel to the left
    carouselContainer.classList.add('expanded');

    // Activate the details panel
    projectDetailsPanel.classList.add('active');

    // Hide all detail contents
    projectDetailContents.forEach(content => {
      content.classList.remove('active');
    });

    // Show the selected project details
    const projectKey = clickedItem.dataset.project;
    const targetContent = document.querySelector(`.project-detail-content[data-project="${projectKey}"]`);
    if (targetContent) {
      targetContent.classList.add('active');
    }

    activeProjectIndex = index;
  }

  // Animate items in on scroll
  const projectsSection = document.querySelector('.projects');
  if (projectsSection) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.2
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate in project items with stagger
          projectItems.forEach((item, i) => {
            setTimeout(() => {
              item.style.opacity = '1';
            }, i * 150);
          });

          sectionObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    sectionObserver.observe(projectsSection);
  }

  // Set initial state for project items
  projectItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transition = 'opacity 0.5s ease';
  });
})();
