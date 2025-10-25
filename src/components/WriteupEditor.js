// Writeup Editor Component

class WriteupEditor {
    constructor(writeup = null) {
        this.writeup = writeup || this.createEmptyWriteup();
        this.cvssCalculator = new CVSSCalculator();
        this.templateSelector = new TemplateSelector('writeup');
        this.onChange = null;
    }

    createEmptyWriteup() {
        return {
            id: Date.now().toString(),
            title: '',
            severity: 'medium',
            cvss: 0,
            cvssVector: '',
            type: '',
            status: 'draft',
            content: {
                summary: '',
                steps: [],
                poc: '',
                impact: '',
                remediation: '',
                references: []
            },
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    applyTemplate(template) {
        if (!template) return;
        
        this.writeup.type = template.type || '';
        this.writeup.severity = template.severity || 'medium';
        this.writeup.content = JSON.parse(JSON.stringify(template.structure));
    }

    renderEditor(container) {
        const html = `
            <div class="writeup-editor">
                <div class="writeup-header">
                    <input type="text" 
                           id="writeupTitle" 
                           value="${this.writeup.title}" 
                           placeholder="Writeup Title" 
                           class="writeup-title-input">
                    <div class="writeup-meta">
                        <select id="writeupStatus" class="form-input">
                            <option value="draft" ${this.writeup.status === 'draft' ? 'selected' : ''}>Draft</option>
                            <option value="review" ${this.writeup.status === 'review' ? 'selected' : ''}>Review</option>
                            <option value="submitted" ${this.writeup.status === 'submitted' ? 'selected' : ''}>Submitted</option>
                            <option value="accepted" ${this.writeup.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                            <option value="rejected" ${this.writeup.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                        <span class="severity-badge severity-${this.writeup.severity}">${this.writeup.severity.toUpperCase()}</span>
                        <span class="cvss-score">CVSS: ${this.writeup.cvss.toFixed(1)}</span>
                    </div>
                </div>

                <div class="writeup-toolbar">
                    <button id="saveWriteup" class="btn btn-primary">💾 Save</button>
                    <button id="exportWriteup" class="btn btn-secondary">📥 Export</button>
                    <button id="deleteWriteup" class="btn btn-danger">🗑️ Delete</button>
                    <button id="showCVSS" class="btn btn-outline">📊 CVSS Calculator</button>
                </div>

                <div class="writeup-content-editor">
                    <div class="editor-section">
                        <label>Vulnerability Type</label>
                        <input type="text" id="writeupType" value="${this.writeup.type}" placeholder="e.g., XSS, IDOR, SQL Injection" class="form-input">
                    </div>

                    <div class="editor-section">
                        <label>Summary</label>
                        <textarea id="writeupSummary" rows="4" class="form-input" placeholder="Brief description of the vulnerability...">${this.writeup.content.summary}</textarea>
                    </div>

                    <div class="editor-section">
                        <label>Steps to Reproduce</label>
                        <div id="stepsContainer"></div>
                        <button id="addStep" class="btn btn-outline btn-sm">+ Add Step</button>
                    </div>

                    <div class="editor-section">
                        <label>Proof of Concept</label>
                        <textarea id="writeupPoc" rows="10" class="form-input code-editor" placeholder="Enter PoC code, payloads, or HTTP requests...">${this.writeup.content.poc}</textarea>
                    </div>

                    <div class="editor-section">
                        <label>Impact</label>
                        <textarea id="writeupImpact" rows="5" class="form-input" placeholder="Describe the security impact...">${this.writeup.content.impact}</textarea>
                    </div>

                    <div class="editor-section">
                        <label>Remediation</label>
                        <textarea id="writeupRemediation" rows="5" class="form-input" placeholder="Recommended fixes...">${this.writeup.content.remediation}</textarea>
                    </div>

                    <div class="editor-section">
                        <label>References</label>
                        <div id="referencesContainer"></div>
                        <button id="addReference" class="btn btn-outline btn-sm">+ Add Reference</button>
                    </div>
                </div>

                <div id="cvssCalculatorContainer" class="cvss-container" style="display: none;"></div>
            </div>
        `;

        container.innerHTML = html;
        this.renderSteps(container);
        this.renderReferences(container);
        this.bindEvents(container);
    }

    renderSteps(container) {
        const stepsContainer = container.querySelector('#stepsContainer');
        if (!stepsContainer) return;

        stepsContainer.innerHTML = this.writeup.content.steps.map((step, index) => `
            <div class="step-item">
                <span class="step-number">${index + 1}.</span>
                <input type="text" class="step-input form-input" data-index="${index}" value="${step}" placeholder="Enter step...">
                <button class="remove-step-btn" data-index="${index}">×</button>
            </div>
        `).join('');
    }

    renderReferences(container) {
        const refsContainer = container.querySelector('#referencesContainer');
        if (!refsContainer) return;

        refsContainer.innerHTML = this.writeup.content.references.map((ref, index) => `
            <div class="reference-item">
                <input type="text" class="reference-input form-input" data-index="${index}" value="${ref}" placeholder="Enter URL or reference...">
                <button class="remove-reference-btn" data-index="${index}">×</button>
            </div>
        `).join('');
    }

    bindEvents(container) {
        // Title
        const titleInput = container.querySelector('#writeupTitle');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                this.writeup.title = e.target.value;
                this.triggerChange();
            });
        }

        // Type
        const typeInput = container.querySelector('#writeupType');
        if (typeInput) {
            typeInput.addEventListener('input', (e) => {
                this.writeup.type = e.target.value;
                this.triggerChange();
            });
        }

        // Status
        const statusSelect = container.querySelector('#writeupStatus');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.writeup.status = e.target.value;
                this.triggerChange();
            });
        }

        // Content fields
        ['writeupSummary', 'writeupPoc', 'writeupImpact', 'writeupRemediation'].forEach(id => {
            const elem = container.querySelector(`#${id}`);
            if (elem) {
                elem.addEventListener('input', (e) => {
                    const field = id.replace('writeup', '').toLowerCase();
                    this.writeup.content[field] = e.target.value;
                    this.triggerChange();
                });
            }
        });

        // Steps
        container.addEventListener('click', (e) => {
            if (e.target.id === 'addStep') {
                this.writeup.content.steps.push('');
                this.renderSteps(container);
                this.bindStepEvents(container);
            } else if (e.target.classList.contains('remove-step-btn')) {
                const index = parseInt(e.target.dataset.index);
                this.writeup.content.steps.splice(index, 1);
                this.renderSteps(container);
                this.bindStepEvents(container);
                this.triggerChange();
            }
        });

        this.bindStepEvents(container);

        // References
        container.addEventListener('click', (e) => {
            if (e.target.id === 'addReference') {
                this.writeup.content.references.push('');
                this.renderReferences(container);
                this.bindReferenceEvents(container);
            } else if (e.target.classList.contains('remove-reference-btn')) {
                const index = parseInt(e.target.dataset.index);
                this.writeup.content.references.splice(index, 1);
                this.renderReferences(container);
                this.bindReferenceEvents(container);
                this.triggerChange();
            }
        });

        this.bindReferenceEvents(container);

        // Toolbar buttons
        const saveBtn = container.querySelector('#saveWriteup');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }

        const exportBtn = container.querySelector('#exportWriteup');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.export());
        }

        const deleteBtn = container.querySelector('#deleteWriteup');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.delete());
        }

        const cvssBtn = container.querySelector('#showCVSS');
        if (cvssBtn) {
            cvssBtn.addEventListener('click', () => this.toggleCVSS(container));
        }
    }

    bindStepEvents(container) {
        const stepInputs = container.querySelectorAll('.step-input');
        stepInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.writeup.content.steps[index] = e.target.value;
                this.triggerChange();
            });
        });
    }

    bindReferenceEvents(container) {
        const refInputs = container.querySelectorAll('.reference-input');
        refInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.writeup.content.references[index] = e.target.value;
                this.triggerChange();
            });
        });
    }

    toggleCVSS(container) {
        const cvssContainer = container.querySelector('#cvssCalculatorContainer');
        if (cvssContainer.style.display === 'none') {
            this.cvssCalculator.renderUI(cvssContainer);
            cvssContainer.style.display = 'block';
            
            // Update writeup when CVSS changes
            const updateCVSS = () => {
                const data = this.cvssCalculator.getData();
                if (data.score !== null) {
                    this.writeup.cvss = data.score;
                    this.writeup.severity = data.severity;
                    this.writeup.cvssVector = data.vector;
                    this.renderEditor(container.parentElement);
                }
            };
            
            // Add listener to metric buttons
            cvssContainer.addEventListener('click', () => {
                setTimeout(updateCVSS, 100);
            });
        } else {
            cvssContainer.style.display = 'none';
        }
    }

    triggerChange() {
        this.writeup.updatedAt = new Date().toISOString();
        if (this.onChange) {
            this.onChange(this.writeup);
        }
    }

    save() {
        // Validation
        const validation = validateWriteup(this.writeup);
        if (!validation.isValid) {
            alert('Validation errors:\n' + validation.errors.join('\n'));
            return false;
        }

        this.triggerChange();
        return true;
    }

    export() {
        downloadWriteup(this.writeup, 'markdown');
    }

    delete() {
        if (confirm('Are you sure you want to delete this writeup?')) {
            // Will be handled by parent component
            if (this.onDelete) {
                this.onDelete(this.writeup.id);
            }
        }
    }

    getData() {
        return this.writeup;
    }

    setData(writeup) {
        this.writeup = writeup;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WriteupEditor;
}
