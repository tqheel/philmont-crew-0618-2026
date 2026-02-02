/**
 * Philmont Crew 618 SPA - Application Logic
 * Converts markdown documents to an interactive single-page application
 */

// ==========================================
// Configuration
// ==========================================

const CONFIG = {
    documents: {
        'advisors-guide': {
            path: '2025-Advisors-Guide/2025-Advisors-Guide.md',
            imageBase: '2025-Advisors-Guide/',
            title: "Advisor's Guidebook"
        },
        'guidebook': {
            path: '2025-Guidebook-to-Adventure/2025-Guidebook-to-Adventure.md',
            imageBase: '2025-Guidebook-to-Adventure/',
            title: 'Guidebook to Adventure'
        },
        'parents-guide': {
            path: 'Parents-Guide/Parents-Guide.md',
            imageBase: 'Parents-Guide/',
            title: "Parent's Peace of Mind Guide"
        }
    }
};

// ==========================================
// State Management
// ==========================================

const state = {
    currentDoc: 'home',
    currentSectionIndex: 0,
    documents: {},
    sections: {}
};

// ==========================================
// DOM Elements
// ==========================================

const elements = {
    sidebar: document.getElementById('sidebar'),
    menuBtn: document.getElementById('menuBtn'),
    overlay: document.getElementById('overlay'),
    toc: document.getElementById('toc'),
    docTabs: document.getElementById('docTabs'),
    content: document.getElementById('content'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    pageIndicator: document.getElementById('pageIndicator'),
    navFooter: document.getElementById('navFooter')
};

// ==========================================
// Markdown Processing
// ==========================================

/**
 * Parse markdown content into sections based on # headers
 */
function parseMarkdownSections(markdown, docKey) {
    const lines = markdown.split('\n');
    const sections = [];
    let currentSection = null;
    let frontMatter = [];
    let inFrontMatter = true;
    
    const imageBase = CONFIG.documents[docKey]?.imageBase || '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for top-level header (# Header)
        const headerMatch = line.match(/^#\s+(.+)$/);
        
        if (headerMatch) {
            inFrontMatter = false;
            
            // Save previous section
            if (currentSection) {
                sections.push(currentSection);
            }
            
            // Start new section
            currentSection = {
                title: headerMatch[1].trim(),
                level: 1,
                content: [line],
                index: sections.length + (frontMatter.length > 0 ? 1 : 0)
            };
        } else if (currentSection) {
            currentSection.content.push(line);
        } else if (inFrontMatter) {
            frontMatter.push(line);
        }
    }
    
    // Don't forget the last section
    if (currentSection) {
        sections.push(currentSection);
    }
    
    // Process front matter as first section if exists
    const result = [];
    
    if (frontMatter.length > 0) {
        // Check if there's meaningful content in front matter
        const frontMatterContent = frontMatter.join('\n').trim();
        if (frontMatterContent) {
            result.push({
                title: 'Introduction',
                level: 0,
                content: frontMatter,
                index: 0
            });
        }
    }
    
    // Add all sections
    sections.forEach((section, idx) => {
        section.index = result.length;
        result.push(section);
    });
    
    return result;
}

/**
 * Fix image paths in markdown content
 */
function fixImagePaths(markdown, docKey) {
    const imageBase = CONFIG.documents[docKey]?.imageBase || '';
    
    // Replace relative image paths with correct paths
    return markdown.replace(
        /!\[([^\]]*)\]\(images\//g,
        `![$1](${imageBase}images/`
    );
}

/**
 * Render markdown to HTML
 */
function renderMarkdown(markdown, docKey) {
    // Fix image paths before rendering
    const fixedMarkdown = fixImagePaths(markdown, docKey);
    
    // Configure marked options
    marked.setOptions({
        breaks: false,
        gfm: true
    });
    
    return marked.parse(fixedMarkdown);
}

// ==========================================
// Navigation Functions
// ==========================================

/**
 * Update the table of contents sidebar
 */
function updateTOC(sections) {
    elements.toc.innerHTML = '';
    
    sections.forEach((section, index) => {
        const button = document.createElement('button');
        button.className = `toc-item${index === state.currentSectionIndex ? ' active' : ''}`;
        button.textContent = section.title;
        button.addEventListener('click', () => navigateToSection(index));
        elements.toc.appendChild(button);
    });
}

/**
 * Navigate to a specific section
 */
function navigateToSection(index) {
    const sections = state.sections[state.currentDoc];
    if (!sections || index < 0 || index >= sections.length) return;
    
    state.currentSectionIndex = index;
    
    // Update content
    const section = sections[index];
    const markdown = section.content.join('\n');
    elements.content.innerHTML = renderMarkdown(markdown, state.currentDoc);
    
    // Update TOC active state
    const tocItems = elements.toc.querySelectorAll('.toc-item');
    tocItems.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    // Update navigation buttons
    updateNavButtons();
    
    // Scroll to top of content
    elements.content.scrollTop = 0;
    document.querySelector('.content-wrapper').scrollTop = 0;
    window.scrollTo(0, 0);
    
    // Update URL hash
    window.history.replaceState(null, '', `#${state.currentDoc}/${index}`);
}

/**
 * Update prev/next button states
 */
function updateNavButtons() {
    const sections = state.sections[state.currentDoc];
    const total = sections ? sections.length : 0;
    
    elements.prevBtn.disabled = state.currentSectionIndex <= 0;
    elements.nextBtn.disabled = state.currentSectionIndex >= total - 1;
    elements.pageIndicator.textContent = `Page ${state.currentSectionIndex + 1} of ${total}`;
}

/**
 * Navigate to previous section
 */
function navigatePrev() {
    if (state.currentSectionIndex > 0) {
        navigateToSection(state.currentSectionIndex - 1);
    }
}

/**
 * Navigate to next section
 */
function navigateNext() {
    const sections = state.sections[state.currentDoc];
    if (sections && state.currentSectionIndex < sections.length - 1) {
        navigateToSection(state.currentSectionIndex + 1);
    }
}

// ==========================================
// Document Loading
// ==========================================

/**
 * Load a markdown document
 */
async function loadDocument(docKey) {
    if (state.documents[docKey]) {
        return state.documents[docKey];
    }
    
    const docConfig = CONFIG.documents[docKey];
    if (!docConfig) return null;
    
    try {
        const response = await fetch(docConfig.path);
        if (!response.ok) throw new Error(`Failed to load ${docConfig.path}`);
        
        const markdown = await response.text();
        state.documents[docKey] = markdown;
        state.sections[docKey] = parseMarkdownSections(markdown, docKey);
        
        return markdown;
    } catch (error) {
        console.error(`Error loading document ${docKey}:`, error);
        return null;
    }
}

/**
 * Switch to a different document
 */
async function switchDocument(docKey) {
    // Update tab states
    const tabs = elements.docTabs.querySelectorAll('.doc-tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.doc === docKey);
    });
    
    state.currentDoc = docKey;
    state.currentSectionIndex = 0;
    
    if (docKey === 'home') {
        renderHomePage();
        return;
    }
    
    // Load document if needed
    await loadDocument(docKey);
    
    const sections = state.sections[docKey];
    if (sections && sections.length > 0) {
        updateTOC(sections);
        navigateToSection(0);
        elements.navFooter.style.display = 'flex';
    }
    
    // Close mobile sidebar if on mobile
    if (window.innerWidth <= 1024) {
        closeSidebar();
    }
}

// ==========================================
// Home Page
// ==========================================

/**
 * Render the home page
 */
function renderHomePage() {
    elements.toc.innerHTML = '';
    elements.navFooter.style.display = 'none';
    
    elements.content.innerHTML = `
        <div class="home-hero">
            <img src="hero-image.png" alt="Philmont Scout Ranch - Tooth of Time" class="home-hero-image">
            <h1 class="home-title">Philmont Crew 618</h1>
            <p class="home-subtitle">Planning and Preparation</p>
        </div>
        
        <div class="crew-info">
            <h2>🏕️ June 2026 Expedition</h2>
            <p>Welcome to our crew's planning hub! Use the resources below to prepare for an unforgettable adventure at Philmont Scout Ranch.</p>
        </div>
        
        <div class="home-cards">
            <div class="home-card" onclick="switchDocument('advisors-guide')">
                <img src="hero-image.png" alt="Advisor's Guide" class="home-card-image">
                <h3 class="home-card-title">Advisor's Guidebook</h3>
                <p class="home-card-description">Essential information for adult advisors including registration, leadership requirements, crew organization, and trek preparation.</p>
            </div>
            
            <div class="home-card" onclick="switchDocument('guidebook')">
                <img src="parents-image.jpg" alt="Guidebook to Adventure" class="home-card-image">
                <h3 class="home-card-title">Guidebook to Adventure</h3>
                <p class="home-card-description">Complete guide for all participants covering equipment, hiking skills, camping procedures, program features, and more.</p>
            </div>
            
            <div class="home-card" onclick="switchDocument('parents-guide')">
                <img src="trail-image.png" alt="Parent's Guide" class="home-card-image">
                <h3 class="home-card-title">Parent's Peace of Mind Guide</h3>
                <p class="home-card-description">A reassuring guide for parents covering safety protocols, staff training, medical support, and emergency procedures.</p>
            </div>
        </div>
    `;
}

// ==========================================
// Sidebar Functions
// ==========================================

function openSidebar() {
    elements.sidebar.classList.add('open');
    elements.overlay.classList.add('active');
    elements.sidebar.classList.remove('collapsed');
}

function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.overlay.classList.remove('active');
}

function toggleSidebar() {
    if (window.innerWidth <= 1024) {
        if (elements.sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    } else {
        elements.sidebar.classList.toggle('collapsed');
    }
}

// ==========================================
// Event Listeners
// ==========================================

function initEventListeners() {
    // Tab switching
    elements.docTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.doc-tab');
        if (tab) {
            switchDocument(tab.dataset.doc);
        }
    });
    
    // Navigation buttons
    elements.prevBtn.addEventListener('click', navigatePrev);
    elements.nextBtn.addEventListener('click', navigateNext);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (state.currentDoc === 'home') return;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            navigatePrev();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            navigateNext();
        }
    });
    
    // Sidebar toggle
    elements.menuBtn.addEventListener('click', toggleSidebar);
    elements.overlay.addEventListener('click', closeSidebar);
    
    // Handle hash changes
    window.addEventListener('hashchange', handleHashChange);
}

/**
 * Handle URL hash changes for direct navigation
 */
function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    
    const [docKey, sectionIndex] = hash.split('/');
    
    if (docKey && CONFIG.documents[docKey]) {
        switchDocument(docKey).then(() => {
            if (sectionIndex !== undefined) {
                navigateToSection(parseInt(sectionIndex, 10));
            }
        });
    } else if (docKey === 'home') {
        switchDocument('home');
    }
}

// ==========================================
// Initialization
// ==========================================

async function init() {
    // Initialize event listeners
    initEventListeners();
    
    // Check for hash in URL
    const hash = window.location.hash.slice(1);
    
    if (hash) {
        handleHashChange();
    } else {
        // Show home page by default
        renderHomePage();
    }
    
    // Preload documents in background
    Object.keys(CONFIG.documents).forEach(docKey => {
        loadDocument(docKey);
    });
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
