/**
 * WelcomeScreen.js
 * First-time user onboarding and welcome modal
 */

class WelcomeScreen {
    constructor() {
        this.hasSeenWelcome = this.checkWelcomeStatus();
        this.modal = null;
    }

    checkWelcomeStatus() {
        // Check if user has seen the welcome screen before
        return localStorage.getItem('hasSeenWelcome') === 'true';
    }

    shouldShow() {
        return !this.hasSeenWelcome;
    }

    show() {
        this.createModal();
        this.render();
        this.bindEvents();
        
        // Show the modal with animation
        setTimeout(() => {
            this.modal.classList.add('visible');
        }, 100);
    }

    createModal() {
        // Create modal element
        this.modal = document.createElement('div');
        this.modal.className = 'welcome-modal-overlay';
        this.modal.id = 'welcomeModal';
        document.body.appendChild(this.modal);
    }

    render() {
        this.modal.innerHTML = `
            <div class="welcome-modal">
                <button class="welcome-close" aria-label="Close">&times;</button>
                
                <div class="welcome-content" id="welcomeContent">
                    ${this.renderStep1()}
                </div>
            </div>
        `;
    }

    renderStep1() {
        return `
            <div class="welcome-step" data-step="1">
                <div class="welcome-hero">
                    <div class="welcome-icon">🎯</div>
                    <h1>Welcome to Bug Bounty Tracker Pro!</h1>
                    <p class="welcome-subtitle">Your all-in-one security testing and vulnerability management platform</p>
                </div>

                <div class="welcome-features">
                    <div class="feature-card">
                        <div class="feature-icon">✅</div>
                        <h3>Comprehensive Checklists</h3>
                        <p>Follow industry-standard testing methodologies with detailed checklists</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">📝</div>
                        <h3>Vulnerability Documentation</h3>
                        <p>Create professional writeups with CVSS scoring and severity tracking</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">🔄</div>
                        <h3>Custom Workflows</h3>
                        <p>Build and save testing workflows for different scenarios</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <h3>Export Reports</h3>
                        <p>Generate PDF reports to submit your findings professionally</p>
                    </div>
                </div>

                <div class="welcome-actions">
                    <button class="btn btn-primary btn-lg" data-action="quick-start">
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.97 5.97a.75.75 0 011.07 1.05l-3.99 4.99a.75.75 0 01-1.08.02L4.324 8.384a.75.75 0 111.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 01.02-.022z"/>
                        </svg>
                        Get Started
                    </button>
                    <button class="btn btn-secondary btn-lg" data-action="tour">
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.93 4.97l2.9 2.9a.5.5 0 010 .7l-2.9 2.9a.5.5 0 01-.85-.35V5.32a.5.5 0 01.85-.35z"/>
                        </svg>
                        Take a Tour
                    </button>
                </div>

                <div class="welcome-footer">
                    <label class="checkbox-label">
                        <input type="checkbox" id="dontShowAgain">
                        <span>Don't show this again</span>
                    </label>
                </div>
            </div>
        `;
    }

    renderQuickStart() {
        return `
            <div class="welcome-step" data-step="2">
                <div class="welcome-header">
                    <button class="btn-back" data-action="back">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z"/>
                        </svg>
                        Back
                    </button>
                    <h2>🚀 Quick Start</h2>
                </div>

                <div class="quick-start-options">
                    <div class="option-card" data-action="create-first-project">
                        <div class="option-icon">➕</div>
                        <h3>Create Your First Project</h3>
                        <p>Start fresh with a guided project setup. We'll help you configure everything step by step.</p>
                        <button class="btn btn-primary">Create New Project</button>
                    </div>

                    <div class="option-card" data-action="load-sample">
                        <div class="option-icon">📚</div>
                        <h3>Load Sample Project</h3>
                        <p>Explore a pre-configured project to see how everything works.</p>
                        <button class="btn btn-secondary">Load Sample</button>
                    </div>

                    <div class="option-card" data-action="load-existing">
                        <div class="option-icon">📂</div>
                        <h3>Load Existing Project</h3>
                        <p>Continue working on a project you've already started.</p>
                        <button class="btn btn-secondary">Load Project</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTour() {
        return `
            <div class="welcome-step tour-step" data-step="3">
                <div class="welcome-header">
                    <button class="btn-back" data-action="back">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z"/>
                        </svg>
                        Back
                    </button>
                    <h2>📖 Quick Tour</h2>
                </div>

                <div class="tour-content">
                    <div class="tour-section">
                        <div class="tour-number">1</div>
                        <div class="tour-info">
                            <h3>Dashboard</h3>
                            <p>Your command center. See project stats, recent activity, and quick actions all in one place.</p>
                        </div>
                    </div>

                    <div class="tour-section">
                        <div class="tour-number">2</div>
                        <div class="tour-info">
                            <h3>Checklist</h3>
                            <p>Follow comprehensive testing checklists organized by category. Track your progress and add notes as you go.</p>
                        </div>
                    </div>

                    <div class="tour-section">
                        <div class="tour-number">3</div>
                        <div class="tour-info">
                            <h3>Writeups</h3>
                            <p>Document vulnerabilities with professional writeups. Include CVSS scores, severity ratings, and detailed reproduction steps.</p>
                        </div>
                    </div>

                    <div class="tour-section">
                        <div class="tour-number">4</div>
                        <div class="tour-info">
                            <h3>Workflows</h3>
                            <p>Create and save custom testing workflows. Reuse them across projects to save time.</p>
                        </div>
                    </div>

                    <div class="tour-section">
                        <div class="tour-number">5</div>
                        <div class="tour-info">
                            <h3>Notes</h3>
                            <p>Capture quick thoughts, findings, and observations. Tag and search your notes easily.</p>
                        </div>
                    </div>
                </div>

                <div class="tour-actions">
                    <button class="btn btn-primary btn-lg" data-action="start-testing">
                        Start Testing Now
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Close button
        const closeBtn = this.modal.querySelector('.welcome-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Action buttons
        this.modal.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action) {
                this.handleAction(action);
            }
        });

        // Don't show again checkbox
        const checkbox = this.modal.querySelector('#dontShowAgain');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.markAsSeen();
                }
            });
        }

        // ESC key to close
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    handleAction(action) {
        const contentEl = this.modal.querySelector('#welcomeContent');
        
        switch(action) {
            case 'quick-start':
                contentEl.innerHTML = this.renderQuickStart();
                break;
                
            case 'tour':
                contentEl.innerHTML = this.renderTour();
                break;
                
            case 'back':
                contentEl.innerHTML = this.renderStep1();
                break;
                
            case 'create-first-project':
                this.hide();
                this.dispatchEvent('create-project');
                break;
                
            case 'load-sample':
                this.hide();
                this.dispatchEvent('load-sample');
                break;
                
            case 'load-existing':
                this.hide();
                this.dispatchEvent('load-project');
                break;
                
            case 'start-testing':
                this.hide();
                this.dispatchEvent('create-project');
                break;
        }
    }

    dispatchEvent(eventName) {
        const event = new CustomEvent('welcome-action', {
            detail: { action: eventName },
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    hide() {
        if (this.modal) {
            this.modal.classList.remove('visible');
            
            setTimeout(() => {
                if (this.modal && this.modal.parentNode) {
                    this.modal.parentNode.removeChild(this.modal);
                }
                this.modal = null;
            }, 300);
        }

        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
        }
    }

    markAsSeen() {
        localStorage.setItem('hasSeenWelcome', 'true');
        this.hasSeenWelcome = true;
    }

    reset() {
        localStorage.removeItem('hasSeenWelcome');
        this.hasSeenWelcome = false;
    }
}

// Make it globally available
if (typeof window !== 'undefined') {
    window.WelcomeScreen = WelcomeScreen;
}
