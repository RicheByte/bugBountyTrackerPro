// Workflow Builder Component

class WorkflowBuilder {
    constructor(workflow = null) {
        this.workflow = workflow || this.createEmptyWorkflow();
        this.templateSelector = new TemplateSelector('workflow');
        this.draggedStep = null;
        this.onChange = null;
    }

    createEmptyWorkflow() {
        return {
            id: Date.now().toString(),
            name: '',
            description: '',
            category: 'custom',
            steps: [],
            createdAt: new Date().toISOString(),
            isTemplate: false
        };
    }

    applyTemplate(template) {
        if (!template) return;
        
        this.workflow = {
            ...this.createEmptyWorkflow(),
            name: template.name,
            description: template.description,
            category: template.category,
            steps: JSON.parse(JSON.stringify(template.steps)),
            estimatedTime: template.estimatedTime,
            difficulty: template.difficulty
        };
    }

    renderBuilder(container) {
        const completedSteps = this.workflow.steps.filter(s => s.completed).length;
        const totalSteps = this.workflow.steps.length;
        const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

        const html = `
            <div class="workflow-builder">
                <div class="workflow-header">
                    <input type="text" 
                           id="workflowName" 
                           value="${this.workflow.name}" 
                           placeholder="Workflow Name" 
                           class="workflow-title-input">
                    <div class="workflow-meta">
                        <span class="progress-indicator">${completedSteps}/${totalSteps} Steps</span>
                        <div class="progress-bar-small">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>

                <div class="workflow-toolbar">
                    <button id="saveWorkflow" class="btn btn-primary">💾 Save</button>
                    <button id="exportWorkflow" class="btn btn-secondary">📥 Export</button>
                    <button id="deleteWorkflow" class="btn btn-danger">🗑️ Delete</button>
                    <button id="executeWorkflow" class="btn btn-success">▶️ Start</button>
                </div>

                <div class="workflow-description-section">
                    <textarea id="workflowDescription" 
                              rows="3" 
                              class="form-input" 
                              placeholder="Workflow description...">${this.workflow.description}</textarea>
                </div>

                <div class="workflow-steps-container">
                    <div class="steps-header">
                        <h4>Workflow Steps</h4>
                        <button id="addWorkflowStep" class="btn btn-primary btn-sm">+ Add Step</button>
                    </div>
                    <div id="workflowSteps" class="workflow-steps">
                        ${this.workflow.steps.length === 0 ? 
                            '<p class="empty-state">No steps yet. Add your first step!</p>' :
                            this.workflow.steps.map((step, index) => this.renderStep(step, index)).join('')
                        }
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.bindEvents(container);
    }

    renderStep(step, index) {
        const typeIcons = {
            command: '💻',
            manual: '👤',
            checklist: '✓'
        };

        const icon = typeIcons[step.type] || '📌';

        return `
            <div class="workflow-step ${step.completed ? 'completed' : ''}" 
                 data-step-index="${index}" 
                 draggable="true">
                <div class="step-handle">⋮⋮</div>
                <div class="step-main">
                    <div class="step-header-row">
                        <div class="step-number">${index + 1}</div>
                        <input type="checkbox" 
                               class="step-checkbox" 
                               ${step.completed ? 'checked' : ''}
                               data-step-index="${index}">
                        <span class="step-type-icon">${icon}</span>
                        <input type="text" 
                               class="step-title-input" 
                               value="${step.title || ''}" 
                               placeholder="Step title..."
                               data-step-index="${index}">
                        <button class="step-expand-btn" data-step-index="${index}">
                            ${step.expanded ? '▼' : '▶'}
                        </button>
                        <button class="step-delete-btn" data-step-index="${index}">×</button>
                    </div>

                    <div class="step-content" style="display: ${step.expanded ? 'block' : 'none'}">
                        <div class="step-field">
                            <label>Type:</label>
                            <select class="step-type-select form-input" data-step-index="${index}">
                                <option value="command" ${step.type === 'command' ? 'selected' : ''}>Command</option>
                                <option value="manual" ${step.type === 'manual' ? 'selected' : ''}>Manual</option>
                                <option value="checklist" ${step.type === 'checklist' ? 'selected' : ''}>Checklist</option>
                            </select>
                        </div>

                        <div class="step-field">
                            <label>Description:</label>
                            <textarea class="step-description form-input" 
                                      rows="2" 
                                      data-step-index="${index}"
                                      placeholder="Describe what this step does...">${step.description || ''}</textarea>
                        </div>

                        ${step.type === 'command' ? `
                            <div class="step-field">
                                <label>Command:</label>
                                <textarea class="step-command form-input code-editor" 
                                          rows="3" 
                                          data-step-index="${index}"
                                          placeholder="Enter command...">${step.command || ''}</textarea>
                            </div>
                        ` : ''}

                        ${step.type === 'checklist' && step.checklist ? `
                            <div class="step-field">
                                <label>Checklist Items:</label>
                                <div class="step-checklist">
                                    ${step.checklist.map((item, itemIndex) => `
                                        <div class="checklist-item">
                                            <input type="text" 
                                                   class="checklist-item-input form-input" 
                                                   value="${item}"
                                                   data-step-index="${index}"
                                                   data-item-index="${itemIndex}">
                                        </div>
                                    `).join('')}
                                    <button class="add-checklist-item-btn btn-sm btn-outline" data-step-index="${index}">+ Add Item</button>
                                </div>
                            </div>
                        ` : ''}

                        <div class="step-field">
                            <label>Tools:</label>
                            <input type="text" 
                                   class="step-tools form-input" 
                                   value="${step.tools ? step.tools.join(', ') : ''}"
                                   data-step-index="${index}"
                                   placeholder="e.g., nmap, burp, sqlmap">
                        </div>

                        <div class="step-field">
                            <label>Estimated Time:</label>
                            <input type="text" 
                                   class="step-time form-input" 
                                   value="${step.estimatedTime || ''}"
                                   data-step-index="${index}"
                                   placeholder="e.g., 10-20 mins">
                        </div>

                        <div class="step-field">
                            <label>Notes:</label>
                            <textarea class="step-notes form-input" 
                                      rows="3" 
                                      data-step-index="${index}"
                                      placeholder="Additional notes...">${step.notes || ''}</textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents(container) {
        // Name and description
        const nameInput = container.querySelector('#workflowName');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.workflow.name = e.target.value;
                this.triggerChange();
            });
        }

        const descInput = container.querySelector('#workflowDescription');
        if (descInput) {
            descInput.addEventListener('input', (e) => {
                this.workflow.description = e.target.value;
                this.triggerChange();
            });
        }

        // Add step button
        const addStepBtn = container.querySelector('#addWorkflowStep');
        if (addStepBtn) {
            addStepBtn.addEventListener('click', () => {
                this.addStep();
                this.renderBuilder(container.parentElement);
            });
        }

        // Step events
        this.bindStepEvents(container);

        // Drag and drop
        this.bindDragEvents(container);

        // Toolbar
        const saveBtn = container.querySelector('#saveWorkflow');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }

        const exportBtn = container.querySelector('#exportWorkflow');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.export());
        }

        const deleteBtn = container.querySelector('#deleteWorkflow');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.delete());
        }

        const executeBtn = container.querySelector('#executeWorkflow');
        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.execute());
        }
    }

    bindStepEvents(container) {
        // Step checkboxes
        container.querySelectorAll('.step-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.stepIndex);
                this.workflow.steps[index].completed = e.target.checked;
                this.triggerChange();
                this.renderBuilder(container.parentElement);
            });
        });

        // Expand/collapse
        container.querySelectorAll('.step-expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.stepIndex);
                this.workflow.steps[index].expanded = !this.workflow.steps[index].expanded;
                this.renderBuilder(container.parentElement);
            });
        });

        // Delete step
        container.querySelectorAll('.step-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.stepIndex);
                if (confirm('Delete this step?')) {
                    this.workflow.steps.splice(index, 1);
                    this.triggerChange();
                    this.renderBuilder(container.parentElement);
                }
            });
        });

        // Step title
        container.querySelectorAll('.step-title-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.stepIndex);
                this.workflow.steps[index].title = e.target.value;
                this.triggerChange();
            });
        });

        // Step type
        container.querySelectorAll('.step-type-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.stepIndex);
                this.workflow.steps[index].type = e.target.value;
                if (e.target.value === 'checklist' && !this.workflow.steps[index].checklist) {
                    this.workflow.steps[index].checklist = [''];
                }
                this.triggerChange();
                this.renderBuilder(container.parentElement);
            });
        });

        // Other step fields
        ['description', 'command', 'tools', 'estimatedTime', 'notes'].forEach(field => {
            container.querySelectorAll(`.step-${field.toLowerCase()}`).forEach(elem => {
                elem.addEventListener('input', (e) => {
                    const index = parseInt(e.target.dataset.stepIndex);
                    if (field === 'tools') {
                        this.workflow.steps[index][field] = e.target.value.split(',').map(t => t.trim());
                    } else {
                        this.workflow.steps[index][field] = e.target.value;
                    }
                    this.triggerChange();
                });
            });
        });
    }

    bindDragEvents(container) {
        const steps = container.querySelectorAll('.workflow-step');
        
        steps.forEach(step => {
            step.addEventListener('dragstart', (e) => {
                this.draggedStep = parseInt(step.dataset.stepIndex);
                step.classList.add('dragging');
            });

            step.addEventListener('dragend', (e) => {
                step.classList.remove('dragging');
                this.draggedStep = null;
            });

            step.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(container, e.clientY);
                const dragging = container.querySelector('.dragging');
                if (afterElement == null) {
                    container.querySelector('#workflowSteps').appendChild(dragging);
                } else {
                    container.querySelector('#workflowSteps').insertBefore(dragging, afterElement);
                }
            });

            step.addEventListener('drop', (e) => {
                e.preventDefault();
                const targetIndex = parseInt(step.dataset.stepIndex);
                if (this.draggedStep !== null && this.draggedStep !== targetIndex) {
                    this.moveStep(this.draggedStep, targetIndex);
                    this.renderBuilder(container.parentElement);
                }
            });
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.workflow-step:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    addStep() {
        const newStep = {
            id: this.workflow.steps.length + 1,
            title: '',
            type: 'manual',
            description: '',
            completed: false,
            expanded: true,
            tools: [],
            estimatedTime: '',
            notes: ''
        };
        this.workflow.steps.push(newStep);
        this.triggerChange();
    }

    moveStep(fromIndex, toIndex) {
        const [removed] = this.workflow.steps.splice(fromIndex, 1);
        this.workflow.steps.splice(toIndex, 0, removed);
        this.reorderStepIds();
        this.triggerChange();
    }

    reorderStepIds() {
        this.workflow.steps.forEach((step, index) => {
            step.id = index + 1;
        });
    }

    exportToChecklist() {
        return {
            title: this.workflow.name,
            description: this.workflow.description,
            tasks: this.workflow.steps.map(step => ({
                id: `workflow-${step.id}`,
                description: step.title,
                notes: step.description,
                completed: step.completed
            }))
        };
    }

    triggerChange() {
        if (this.onChange) {
            this.onChange(this.workflow);
        }
    }

    save() {
        const validation = validateWorkflow(this.workflow);
        if (!validation.isValid) {
            alert('Validation errors:\n' + validation.errors.join('\n'));
            return false;
        }
        this.triggerChange();
        return true;
    }

    export() {
        downloadWorkflow(this.workflow, 'markdown');
    }

    delete() {
        if (confirm('Delete this workflow?')) {
            if (this.onDelete) {
                this.onDelete(this.workflow.id);
            }
        }
    }

    execute() {
        alert('Workflow execution tracking coming soon!');
    }

    getData() {
        return this.workflow;
    }

    setData(workflow) {
        this.workflow = workflow;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkflowBuilder;
}
