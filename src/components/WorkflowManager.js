// Workflow Manager Component
// Manages workflows list and builder in the UI

class WorkflowManager {
    constructor(contentContainer, listContainer) {
        this.contentContainer = contentContainer;
        this.listContainer = listContainer;
        this.workflows = [];
        this.currentWorkflow = null;
        this.onUpdate = null;
        
        this.init();
    }

    init() {
        this.renderEmptyState();
    }

    loadWorkflows(workflows, onUpdate) {
        this.workflows = workflows || [];
        this.onUpdate = onUpdate;
        this.renderList();
        
        if (this.workflows.length === 0) {
            this.renderEmptyState();
        }
    }

    createNew() {
        const newWorkflow = {
            id: Date.now().toString(),
            title: 'New Workflow',
            description: '',
            steps: [
                { id: '1', type: 'action', title: 'First Step', description: '', completed: false }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.workflows.push(newWorkflow);
        this.currentWorkflow = newWorkflow;
        this.renderList();
        this.renderBuilder();
        this.notifyUpdate();
    }

    editWorkflow(id) {
        const workflow = this.workflows.find(w => w.id === id);
        if (workflow) {
            this.currentWorkflow = workflow;
            this.renderBuilder();
        }
    }

    deleteWorkflow(id) {
        if (confirm('Are you sure you want to delete this workflow?')) {
            this.workflows = this.workflows.filter(w => w.id !== id);
            if (this.currentWorkflow && this.currentWorkflow.id === id) {
                this.currentWorkflow = null;
                this.renderEmptyState();
            }
            this.renderList();
            this.notifyUpdate();
        }
    }

    saveCurrentWorkflow() {
        if (!this.currentWorkflow) return;

        this.currentWorkflow.title = document.getElementById('workflowTitle')?.value || '';
        this.currentWorkflow.description = document.getElementById('workflowDescription')?.value || '';
        this.currentWorkflow.updatedAt = new Date().toISOString();

        // Save step data
        const stepCards = document.querySelectorAll('.step-card');
        this.currentWorkflow.steps = Array.from(stepCards).map((card, index) => {
            const stepId = card.dataset.stepId;
            const step = this.currentWorkflow.steps.find(s => s.id === stepId) || {};
            
            return {
                id: stepId,
                type: step.type || 'action',
                title: card.querySelector('.step-title-input')?.value || '',
                description: card.querySelector('.step-description-input')?.value || '',
                completed: card.querySelector('.step-checkbox input')?.checked || false
            };
        });

        this.renderList();
        this.notifyUpdate();
    }

    renderList() {
        if (this.workflows.length === 0) {
            this.listContainer.innerHTML = '<div class="empty-state"><p>No workflows yet</p></div>';
            return;
        }

        const html = this.workflows.map(workflow => {
            const completedSteps = workflow.steps.filter(s => s.completed).length;
            const totalSteps = workflow.steps.length;
            const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

            return `
                <div class="workflow-card ${workflow.id === this.currentWorkflow?.id ? 'active' : ''}" 
                     data-id="${workflow.id}">
                    <div class="workflow-card-title">${this.escapeHtml(workflow.title)}</div>
                    <div class="workflow-card-meta">
                        <span>${totalSteps} steps</span>
                        <span>${completedSteps} completed</span>
                    </div>
                    <div class="workflow-progress">
                        <div class="workflow-progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        this.listContainer.innerHTML = html;

        this.listContainer.querySelectorAll('.workflow-card').forEach(card => {
            card.addEventListener('click', () => {
                this.editWorkflow(card.dataset.id);
            });
        });
    }

    renderBuilder() {
        if (!this.currentWorkflow) {
            this.renderEmptyState();
            return;
        }

        const w = this.currentWorkflow;

        const html = `
            <div class="workflow-builder">
                <div class="workflow-header">
                    <input type="text" id="workflowTitle" value="${this.escapeHtml(w.title)}" 
                           placeholder="Workflow Title" class="workflow-title-input">
                    <textarea id="workflowDescription" class="form-input workflow-description-input" rows="2" 
                              placeholder="Workflow description...">${this.escapeHtml(w.description)}</textarea>
                </div>

                <div class="workflow-toolbar">
                    <button id="saveWorkflow" class="btn btn-primary">Save</button>
                    <button id="deleteWorkflow" class="btn btn-danger btn-sm">Delete</button>
                    <button id="exportWorkflow" class="btn btn-secondary btn-sm">Export</button>
                    <div class="step-type-buttons">
                        <button id="addActionStep" class="btn btn-outline btn-sm">+ Action</button>
                        <button id="addCheckStep" class="btn btn-outline btn-sm">+ Check</button>
                        <button id="addNoteStep" class="btn btn-outline btn-sm">+ Note</button>
                    </div>
                </div>

                <div class="workflow-steps" id="workflowSteps">
                    ${w.steps.map((step, index) => this.renderStepCard(step, index)).join('')}
                </div>
            </div>
        `;

        this.contentContainer.innerHTML = html;
        this.bindBuilderEvents();
    }

    renderStepCard(step, index) {
        return `
            <div class="step-card ${step.completed ? 'completed' : ''}" data-step-id="${step.id}">
                <div class="step-header">
                    <div class="step-left">
                        <span class="step-number">${index + 1}</span>
                        <span class="step-type ${step.type}">${step.type}</span>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-outline btn-sm remove-step-btn" data-step-id="${step.id}">Delete</button>
                    </div>
                </div>
                <div class="step-content">
                    <input type="text" class="form-input step-title-input" value="${this.escapeHtml(step.title)}" 
                           placeholder="Step title">
                    <textarea class="form-input step-description-input" rows="3" 
                              placeholder="Step description...">${this.escapeHtml(step.description)}</textarea>
                    <div class="step-checkbox">
                        <input type="checkbox" id="step-${step.id}" ${step.completed ? 'checked' : ''}>
                        <label for="step-${step.id}">Mark as completed</label>
                    </div>
                </div>
            </div>
        `;
    }

    bindBuilderEvents() {
        // Auto-save on title change (debounced)
        let titleSaveTimeout;
        document.getElementById('workflowTitle')?.addEventListener('input', (e) => {
            if (this.currentWorkflow) {
                this.currentWorkflow.title = e.target.value;
                this.currentWorkflow.updatedAt = new Date().toISOString();
                this.renderList();
                
                clearTimeout(titleSaveTimeout);
                titleSaveTimeout = setTimeout(() => {
                    this.notifyUpdate();
                }, 500);
            }
        });

        // Auto-save on description change (debounced)
        let descSaveTimeout;
        document.getElementById('workflowDescription')?.addEventListener('input', (e) => {
            if (this.currentWorkflow) {
                this.currentWorkflow.description = e.target.value;
                this.currentWorkflow.updatedAt = new Date().toISOString();
                
                clearTimeout(descSaveTimeout);
                descSaveTimeout = setTimeout(() => {
                    this.notifyUpdate();
                }, 1000);
            }
        });

        // Save
        document.getElementById('saveWorkflow')?.addEventListener('click', () => {
            this.saveCurrentWorkflow();
            alert('Workflow saved!');
        });

        // Delete
        document.getElementById('deleteWorkflow')?.addEventListener('click', () => {
            if (this.currentWorkflow) {
                this.deleteWorkflow(this.currentWorkflow.id);
            }
        });

        // Export
        document.getElementById('exportWorkflow')?.addEventListener('click', () => {
            this.exportWorkflow();
        });

        // Add steps
        document.getElementById('addActionStep')?.addEventListener('click', () => {
            this.addStep('action');
        });

        document.getElementById('addCheckStep')?.addEventListener('click', () => {
            this.addStep('check');
        });

        document.getElementById('addNoteStep')?.addEventListener('click', () => {
            this.addStep('note');
        });

        // Remove steps
        document.querySelectorAll('.remove-step-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stepId = e.target.dataset.stepId;
                this.removeStep(stepId);
            });
        });
    }

    addStep(type) {
        if (!this.currentWorkflow) return;

        const newStep = {
            id: Date.now().toString(),
            type: type,
            title: '',
            description: '',
            completed: false
        };

        this.currentWorkflow.steps.push(newStep);
        this.renderBuilder();
    }

    removeStep(stepId) {
        if (!this.currentWorkflow) return;
        if (this.currentWorkflow.steps.length === 1) {
            alert('A workflow must have at least one step');
            return;
        }

        this.currentWorkflow.steps = this.currentWorkflow.steps.filter(s => s.id !== stepId);
        this.renderBuilder();
    }

    exportWorkflow() {
        if (!this.currentWorkflow) return;

        const markdown = `# ${this.currentWorkflow.title}

${this.currentWorkflow.description}

## Steps

${this.currentWorkflow.steps.map((step, i) => `
### ${i + 1}. ${step.title} (${step.type})

${step.description}

- [${step.completed ? 'x' : ' '}] Completed
`).join('\n')}
`;

        this.downloadFile(markdown, `${this.currentWorkflow.title}.md`, 'text/markdown');
    }

    renderEmptyState() {
        this.contentContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔄</div>
                <h3>No Workflow Selected</h3>
                <p>Select a workflow from the list or create a new one</p>
            </div>
        `;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    notifyUpdate() {
        if (this.onUpdate) {
            this.onUpdate(this.workflows);
        }
    }
}
