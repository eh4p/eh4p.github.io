// ============================================
// MAIN NAVIGATION - Single Screen Navigation
// ============================================
(function() {
  'use strict';

  const navItems = document.querySelectorAll('.nav-item');
  const sectionWrappers = document.querySelectorAll('.section-wrapper');

  if (!navItems.length || !sectionWrappers.length) return;

  let currentSection = 'hero';
  let isTransitioning = false;

  // Navigate to a specific section
  function navigateToSection(sectionId) {
    if (isTransitioning || sectionId === currentSection) return;

    isTransitioning = true;

    // Update nav items
    navItems.forEach(item => {
      const isActive = item.dataset.section === sectionId;
      item.classList.toggle('active', isActive);
    });

    // Update section wrappers
    sectionWrappers.forEach(wrapper => {
      const isActive = wrapper.dataset.section === sectionId;
      wrapper.classList.toggle('active', isActive);
    });

    // Trigger animations in the new section
    const activeWrapper = document.querySelector(`.section-wrapper[data-section="${sectionId}"]`);
    if (activeWrapper) {
      const animatedElements = activeWrapper.querySelectorAll('.fade-in, .fade-in-sm, .fade-in-left, .fade-in-right');
      animatedElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 50);
      });
    }

    currentSection = sectionId;

    // Reset transition lock after animation completes
    setTimeout(() => {
      isTransitioning = false;
    }, 500);
  }

  // Handle nav item clicks
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.dataset.section;
      navigateToSection(sectionId);
    });

    // Keyboard navigation
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const sectionId = item.dataset.section;
        navigateToSection(sectionId);
      }
    });
  });

  // Keyboard arrow navigation
  document.addEventListener('keydown', (e) => {
    const sections = ['hero', 'overview', 'experience', 'projects', 'education', 'contact'];
    const currentIndex = sections.indexOf(currentSection);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
      navigateToSection(sections[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(currentIndex - 1, 0);
      navigateToSection(sections[prevIndex]);
    }
  });

  // Initialize - show animations for hero section
  const heroWrapper = document.querySelector('.section-wrapper[data-section="hero"]');
  if (heroWrapper) {
    const animatedElements = heroWrapper.querySelectorAll('.fade-in, .fade-in-sm, .fade-in-left, .fade-in-right');
    setTimeout(() => {
      animatedElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 100);
      });
    }, 100);
  }

  // Expose navigateToSection globally for potential external use
  window.navigateToSection = navigateToSection;
})();

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
  const currentBadge = document.querySelector('.current-badge');
  const companyPanelsWrapper = document.querySelector('.company-panels-wrapper');

  if (!companyBtns.length) return;

  let activeCompanyIndex = null;
  let positions = [];

  function updatePositions() {
    if (!lineContainer) return;
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
  if (lineContainer) {
    setTimeout(updatePositions, 100);

    // Also recalculate after fonts load
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setTimeout(updatePositions, 50);
      });
    }
  }

  // Recalculate on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (lineContainer) updatePositions();
      // Update active position if any company is selected
      const activeBtn = document.querySelector('.company-btn.active');
      if (activeBtn && lineContainer) {
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
            // Keep badge visible and positioned at Freelance
            if (currentBadge) {
              currentBadge.style.left = `${positions[activeIndex]}%`;
              currentBadge.classList.add('visible');
            }
          } else {
            horizontalProgress.classList.remove('complete');
            movingCircle.classList.remove('complete');
            // Hide badge for other companies
            if (currentBadge) {
              currentBadge.classList.remove('visible');
            }
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

    if (lineContainer) {
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
        // Show current badge when Freelance is clicked
        if (currentBadge) {
          currentBadge.style.left = `${positions[index]}%`;
          currentBadge.classList.add('visible');
        }
      } else {
        horizontalProgress.classList.remove('complete');
        // Hide current badge when other companies are clicked
        if (currentBadge) {
          currentBadge.classList.remove('visible');
        }
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

    activeCompanyIndex = index;

    // Update mobile carousel state
    updateExpMobileCarousel(index);
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

  // ============================================
  // Mobile Carousel Functionality
  // ============================================
  const expCarouselPrev = document.getElementById('expCarouselPrev');
  const expCarouselNext = document.getElementById('expCarouselNext');
  const expCarouselDots = document.getElementById('expCarouselDots');

  if (expCarouselDots && companyPanels.length > 0) {
    // Create dots for each company
    companyPanels.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot';
      dot.setAttribute('data-index', index);
      dot.addEventListener('click', () => {
        scrollToCompany(index);
      });
      expCarouselDots.appendChild(dot);
    });
  }

  // Update mobile carousel state (dots and button states)
  function updateExpMobileCarousel(index) {
    const dots = expCarouselDots?.querySelectorAll('.carousel-dot');
    if (dots) {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    // Update button states
    if (expCarouselPrev) {
      expCarouselPrev.disabled = index === 0;
    }
    if (expCarouselNext) {
      expCarouselNext.disabled = index === companyPanels.length - 1;
    }
  }

  // Scroll to a specific company (mobile)
  function scrollToCompany(index) {
    if (index < 0 || index >= companyPanels.length) return;

    const targetPanel = companyPanels[index];

    // Scroll the carousel to the target panel
    targetPanel.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    // Update active state
    selectCompany(index);
  }

  // Previous button click
  if (expCarouselPrev) {
    expCarouselPrev.addEventListener('click', () => {
      const newIndex = Math.max(0, (activeCompanyIndex ?? 0) - 1);
      scrollToCompany(newIndex);
    });
  }

  // Next button click
  if (expCarouselNext) {
    expCarouselNext.addEventListener('click', () => {
      const newIndex = Math.min(companyPanels.length - 1, (activeCompanyIndex ?? 0) + 1);
      scrollToCompany(newIndex);
    });
  }

  // Handle scroll-based position detection for mobile
  let scrollTimeout;
  companyPanelsWrapper?.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Find which panel is most visible
      const wrapperRect = companyPanelsWrapper.getBoundingClientRect();
      const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      companyPanels.forEach((panel, index) => {
        const panelRect = panel.getBoundingClientRect();
        const panelCenter = panelRect.left + panelRect.width / 2;
        const distance = Math.abs(panelCenter - wrapperCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Update if a different panel is now most visible
      if (closestIndex !== activeCompanyIndex) {
        const clickedBtn = companyBtns[closestIndex];
        const companyKey = clickedBtn.dataset.company;

        // Remove active class from all buttons and panels
        companyBtns.forEach(btn => btn.classList.remove('active'));
        companyPanels.forEach(panel => panel.classList.remove('active'));

        // Add active class to clicked button
        clickedBtn.classList.add('active');

        // Show corresponding panel
        const targetPanel = document.querySelector(`.company-panel[data-company="${companyKey}"]`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }

        activeCompanyIndex = closestIndex;
        updateExpMobileCarousel(closestIndex);
      }
    }, 100);
  });

  // Initialize first company as active on mobile
  function initExpMobileCarousel() {
    if (window.innerWidth <= 768) {
      // Select first company on mobile
      selectCompany(0);
    } else {
      // On desktop, reset to no selection
      activeCompanyIndex = null;
      companyBtns.forEach(btn => {
        btn.classList.remove('active');
      });
      companyPanels.forEach(panel => {
        panel.classList.remove('active');
      });
    }
  }

  // Initialize on load and resize
  initExpMobileCarousel();
  let expResizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(expResizeTimeout);
    expResizeTimeout = setTimeout(initExpMobileCarousel, 150);
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
  const projectDetailsInner = document.querySelector('.project-details-inner');

  if (!projectsRing || !projectItems.length) return;

  let currentRotation = 0; // 0, 1, or 2 (representing 0, 120, 240 degrees)
  let activeProjectIndex = null;

  // Handle project item click (desktop only)
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

    // Update mobile carousel state
    updateMobileCarousel(index);
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

  // ============================================
  // Mobile Carousel Functionality
  // ============================================
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const carouselDots = document.getElementById('carouselDots');

  if (carouselDots && projectDetailContents.length > 0) {
    // Create dots for each project
    projectDetailContents.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot';
      dot.setAttribute('data-index', index);
      dot.addEventListener('click', () => {
        scrollToProject(index);
      });
      carouselDots.appendChild(dot);
    });
  }

  // Update mobile carousel state (dots and button states)
  function updateMobileCarousel(index) {
    const dots = carouselDots?.querySelectorAll('.carousel-dot');
    if (dots) {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    // Update button states
    if (carouselPrev) {
      carouselPrev.disabled = index === 0;
    }
    if (carouselNext) {
      carouselNext.disabled = index === projectDetailContents.length - 1;
    }
  }

  // Scroll to a specific project (mobile)
  function scrollToProject(index) {
    if (index < 0 || index >= projectDetailContents.length) return;

    const targetContent = projectDetailContents[index];
    const targetItem = projectItems[index];

    // Scroll the carousel to the target content card
    targetContent.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    // Update active state for desktop elements too
    selectProject(index);
  }

  // Previous button click
  if (carouselPrev) {
    carouselPrev.addEventListener('click', () => {
      const newIndex = Math.max(0, (activeProjectIndex ?? 0) - 1);
      scrollToProject(newIndex);
    });
  }

  // Next button click
  if (carouselNext) {
    carouselNext.addEventListener('click', () => {
      const newIndex = Math.min(projectDetailContents.length - 1, (activeProjectIndex ?? 0) + 1);
      scrollToProject(newIndex);
    });
  }

  // Handle scroll-based position detection for mobile
  let scrollTimeout;
  projectDetailsInner?.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Find which card is most visible
      const innerRect = projectDetailsInner.getBoundingClientRect();
      const innerCenter = innerRect.left + innerRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      projectDetailContents.forEach((content, index) => {
        const contentRect = content.getBoundingClientRect();
        const contentCenter = contentRect.left + contentRect.width / 2;
        const distance = Math.abs(contentCenter - innerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Update if a different card is now most visible
      if (closestIndex !== activeProjectIndex) {
        // Just update the active state without re-scrolling
        const clickedItem = projectItems[closestIndex];

        // Remove active class from all items
        projectItems.forEach(item => {
          item.classList.remove('active');
        });

        // Add active class to clicked item
        clickedItem.classList.add('active');

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

        activeProjectIndex = closestIndex;
        updateMobileCarousel(closestIndex);
      }
    }, 100);
  });

  // Initialize first project as active on mobile and tablets
  function initMobileCarousel() {
    if (window.innerWidth <= 1024) {
      // Select first project on mobile
      selectProject(0);
    } else {
      // On desktop, reset to no selection
      activeProjectIndex = null;
      projectItems.forEach(item => {
        item.classList.remove('active');
      });
      projectDetailContents.forEach(content => {
        content.classList.remove('active');
      });
    }
  }

  // Initialize on load and resize
  initMobileCarousel();
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initMobileCarousel, 150);
  });
})();

// Education Section - Mobile Carousel Navigation
(function() {
  'use strict';

  const timelineItems = document.querySelectorAll('.timeline-item');
  const eduItemsWrapper = document.querySelector('.education-items-wrapper');
  const eduCarouselPrev = document.getElementById('eduCarouselPrev');
  const eduCarouselNext = document.getElementById('eduCarouselNext');
  const eduCarouselDots = document.getElementById('eduCarouselDots');

  if (!timelineItems.length) return;

  let activeEducationIndex = null;

  // Create dots for each education item
  if (eduCarouselDots && timelineItems.length > 0) {
    timelineItems.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot';
      dot.setAttribute('data-index', index);
      dot.addEventListener('click', () => {
        scrollToEducation(index);
      });
      eduCarouselDots.appendChild(dot);
    });
  }

  // Function to select an education item
  function selectEducation(index) {
    const targetItem = timelineItems[index];

    // Remove active class from all items
    timelineItems.forEach(item => item.classList.remove('active'));

    // Add active class to selected item
    targetItem.classList.add('active');

    activeEducationIndex = index;

    // Update mobile carousel state
    updateEduMobileCarousel(index);
  }

  // Update mobile carousel state (dots and button states)
  function updateEduMobileCarousel(index) {
    const dots = eduCarouselDots?.querySelectorAll('.carousel-dot');
    if (dots) {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    // Update button states
    if (eduCarouselPrev) {
      eduCarouselPrev.disabled = index === 0;
    }
    if (eduCarouselNext) {
      eduCarouselNext.disabled = index === timelineItems.length - 1;
    }
  }

  // Scroll to a specific education item (mobile)
  function scrollToEducation(index) {
    if (index < 0 || index >= timelineItems.length) return;

    const targetItem = timelineItems[index];

    // Scroll the carousel to the target item
    targetItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    // Update active state
    selectEducation(index);
  }

  // Previous button click
  if (eduCarouselPrev) {
    eduCarouselPrev.addEventListener('click', () => {
      const newIndex = Math.max(0, (activeEducationIndex ?? 0) - 1);
      scrollToEducation(newIndex);
    });
  }

  // Next button click
  if (eduCarouselNext) {
    eduCarouselNext.addEventListener('click', () => {
      const newIndex = Math.min(timelineItems.length - 1, (activeEducationIndex ?? 0) + 1);
      scrollToEducation(newIndex);
    });
  }

  // Handle scroll-based position detection for mobile
  let scrollTimeout;
  eduItemsWrapper?.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Find which item is most visible
      const wrapperRect = eduItemsWrapper.getBoundingClientRect();
      const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      timelineItems.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(itemCenter - wrapperCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Update if a different item is now most visible
      if (closestIndex !== activeEducationIndex) {
        const targetItem = timelineItems[closestIndex];

        // Remove active class from all items
        timelineItems.forEach(item => item.classList.remove('active'));

        // Add active class to closest item
        targetItem.classList.add('active');

        activeEducationIndex = closestIndex;
        updateEduMobileCarousel(closestIndex);
      }
    }, 100);
  });

  // Initialize first education item as active on mobile
  function initEduMobileCarousel() {
    if (window.innerWidth <= 768) {
      // Select first education item on mobile
      selectEducation(0);
    } else {
      // On desktop, reset to no selection
      activeEducationIndex = null;
      timelineItems.forEach(item => {
        item.classList.remove('active');
      });
    }
  }

  // Initialize on load and resize
  initEduMobileCarousel();
  let eduResizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(eduResizeTimeout);
    eduResizeTimeout = setTimeout(initEduMobileCarousel, 150);
  });
})();
