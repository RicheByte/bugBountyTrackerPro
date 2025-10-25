// Template Selector Component

class TemplateSelector {
    constructor(type = 'writeup') {
        this.type = type; // 'writeup', 'workflow', or 'note'
        this.templates = [];
        this.selectedTemplate = null;
        this.onSelect = null; // Callback function
    }

    /**
     * Load templates from JSON file
     */
    async loadTemplates() {
        try {
            let response;
            switch (this.type) {
                case 'writeup':
                    response = await fetch('src/data/writeup-templates.json');
                    const writeupData = await response.json();
                    this.templates = writeupData.templates;
                    break;
                case 'workflow':
                    response = await fetch('src/data/workflow-templates.json');
                    const workflowData = await response.json();
                    this.templates = workflowData.workflows;
                    break;
                case 'note':
                    response = await fetch('src/data/note-templates.json');
                    const noteData = await response.json();
                    this.templates = noteData.templates;
                    break;
            }
            return this.templates;
        } catch (error) {
            console.error('Failed to load templates:', error);
            return [];
        }
    }

    /**
     * Render template selector UI
     */
    renderUI(container) {
        const html = `
            <div class="template-selector">
                <div class="template-selector-header">
                    <h4>Select Template</h4>
                    <button class="close-template-selector">×</button>
                </div>
                
                <div class="template-search">
                    <input type="text" 
                           id="templateSearch" 
                           placeholder="Search templates..." 
                           class="form-input">
                </div>

                <div class="templates-grid" id="templatesGrid">
                    ${this.templates.length === 0 ? 
                        '<p class="empty-message">No templates available</p>' :
                        this.renderTemplateCards()
                    }
                </div>

                <div class="template-actions">
                    <button id="useTemplate" class="btn btn-primary" disabled>Use Template</button>
                    <button id="cancelTemplate" class="btn btn-outline">Start Blank</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.bindEvents(container);
    }

    /**
     * Render template cards
     */
    renderTemplateCards(filter = '') {
        const filtered = filter 
            ? this.templates.filter(t => 
                t.name.toLowerCase().includes(filter.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(filter.toLowerCase())) ||
                (t.type && t.type.toLowerCase().includes(filter.toLowerCase()))
              )
            : this.templates;

        if (filtered.length === 0) {
            return '<p class="empty-message">No templates match your search</p>';
        }

        return filtered.map(template => this.renderTemplateCard(template)).join('');
    }

    /**
     * Render a single template card
     */
    renderTemplateCard(template) {
        const severityBadge = template.severity 
            ? `<span class="severity-badge severity-${template.severity}">${template.severity}</span>`
            : '';
        
        const categoryBadge = template.category 
            ? `<span class="category-badge">${template.category}</span>`
            : '';

        const typeBadge = template.type 
            ? `<span class="type-badge">${template.type}</span>`
            : '';

        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-card-header">
                    <h5>${template.name}</h5>
                    <div class="template-badges">
                        ${severityBadge}
                        ${categoryBadge}
                        ${typeBadge}
                    </div>
                </div>
                <div class="template-card-body">
                    ${template.description ? `<p>${template.description}</p>` : ''}
                    ${this.renderTemplatePreview(template)}
                </div>
            </div>
        `;
    }

    /**
     * Render template preview based on type
     */
    renderTemplatePreview(template) {
        switch (this.type) {
            case 'writeup':
                return `
                    <div class="template-preview">
                        <small><strong>Sections:</strong> Summary, Steps, PoC, Impact, Remediation</small>
                    </div>
                `;
            case 'workflow':
                const steps = template.steps ? template.steps.length : 0;
                const time = template.estimatedTime || 'Variable';
                return `
                    <div class="template-preview">
                        <small><strong>Steps:</strong> ${steps} | <strong>Time:</strong> ${time}</small>
                    </div>
                `;
            case 'note':
                const tags = template.tags ? template.tags.slice(0, 3).join(', ') : '';
                return `
                    <div class="template-preview">
                        ${tags ? `<small><strong>Tags:</strong> ${tags}</small>` : ''}
                    </div>
                `;
            default:
                return '';
        }
    }

    /**
     * Bind events
     */
    bindEvents(container) {
        // Template card selection
        const cards = container.querySelectorAll('.template-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active class from all cards
                cards.forEach(c => c.classList.remove('active'));
                // Add active class to clicked card
                card.classList.add('active');
                
                // Enable use button
                const useBtn = container.querySelector('#useTemplate');
                useBtn.disabled = false;

                // Store selected template
                const templateId = card.dataset.templateId;
                this.selectedTemplate = this.templates.find(t => t.id === templateId);
            });
        });

        // Search
        const searchInput = container.querySelector('#templateSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const grid = container.querySelector('#templatesGrid');
                grid.innerHTML = this.renderTemplateCards(e.target.value);
                
                // Re-bind events after re-rendering
                this.bindEvents(container);
            });
        }

        // Use template button
        const useBtn = container.querySelector('#useTemplate');
        if (useBtn) {
            useBtn.addEventListener('click', () => {
                if (this.selectedTemplate && this.onSelect) {
                    this.onSelect(this.selectedTemplate);
                }
            });
        }

        // Cancel button
        const cancelBtn = container.querySelector('#cancelTemplate');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (this.onSelect) {
                    this.onSelect(null); // null indicates blank/cancel
                }
            });
        }

        // Close button
        const closeBtn = container.querySelector('.close-template-selector');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                container.style.display = 'none';
            });
        }
    }

    /**
     * Show template selector
     */
    async show(container, onSelectCallback) {
        this.onSelect = onSelectCallback;
        
        if (this.templates.length === 0) {
            await this.loadTemplates();
        }
        
        this.renderUI(container);
        container.style.display = 'block';
    }

    /**
     * Hide template selector
     */
    hide(container) {
        container.style.display = 'none';
        this.selectedTemplate = null;
    }

    /**
     * Get template by ID
     */
    getTemplate(templateId) {
        return this.templates.find(t => t.id === templateId);
    }

    /**
     * Get templates by category
     */
    getTemplatesByCategory(category) {
        return this.templates.filter(t => t.category === category);
    }

    /**
     * Get templates by type
     */
    getTemplatesByType(type) {
        return this.templates.filter(t => t.type === type);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateSelector;
}
