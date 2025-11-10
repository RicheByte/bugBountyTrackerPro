// Writeup Manager Component
// Manages the writeups list and editor in the UI

class WriteupManager {
    constructor(contentContainer, listContainer) {
        this.contentContainer = contentContainer;
        this.listContainer = listContainer;
        this.writeups = [];
        this.currentWriteup = null;
        this.onUpdate = null; // Callback when writeups change
        
        this.init();
    }

    init() {
        // Initial render
        this.renderEmptyState();
    }

    loadWriteups(writeups, onUpdate) {
        this.writeups = writeups || [];
        this.onUpdate = onUpdate;
        this.renderList();
        
        if (this.writeups.length === 0) {
            this.renderEmptyState();
        }
    }

    createNew() {
        const newWriteup = {
            id: Date.now().toString(),
            title: 'New Vulnerability Writeup',
            severity: 'medium',
            cvssScore: 0,
            cvssVector: '',
            type: '',
            status: 'draft',
            description: '',
            steps: ['Step 1'],
            impact: '',
            remediation: '',
            references: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.writeups.push(newWriteup);
        this.currentWriteup = newWriteup;
        this.renderList();
        this.renderEditor();
        this.notifyUpdate();
    }

    editWriteup(id) {
        const writeup = this.writeups.find(w => w.id === id);
        if (writeup) {
            this.currentWriteup = writeup;
            this.renderEditor();
        }
    }

    deleteWriteup(id) {
        if (confirm('Are you sure you want to delete this writeup?')) {
            this.writeups = this.writeups.filter(w => w.id !== id);
            if (this.currentWriteup && this.currentWriteup.id === id) {
                this.currentWriteup = null;
                this.renderEmptyState();
            }
            this.renderList();
            this.notifyUpdate();
        }
    }

    saveCurrentWriteup() {
        if (!this.currentWriteup) return;

        // Get values from form
        this.currentWriteup.title = document.getElementById('writeupTitle')?.value || '';
        this.currentWriteup.description = document.getElementById('writeupDescription')?.value || '';
        this.currentWriteup.impact = document.getElementById('writeupImpact')?.value || '';
        this.currentWriteup.remediation = document.getElementById('writeupRemediation')?.value || '';
        this.currentWriteup.updatedAt = new Date().toISOString();

        // Get steps
        const stepInputs = document.querySelectorAll('.step-input');
        this.currentWriteup.steps = Array.from(stepInputs).map(input => input.value);

        // Get references
        const refInputs = document.querySelectorAll('.reference-input');
        this.currentWriteup.references = Array.from(refInputs).map(input => input.value).filter(r => r);

        this.renderList();
        this.notifyUpdate();
    }

    renderList() {
        if (this.writeups.length === 0) {
            this.listContainer.innerHTML = '<div class="empty-state"><p>No writeups yet</p></div>';
            return;
        }

        const html = this.writeups.map(writeup => `
            <div class="writeup-card ${writeup.id === this.currentWriteup?.id ? 'active' : ''} ${writeup.severity}" 
                 data-id="${writeup.id}">
                <div class="writeup-card-title">${this.escapeHtml(writeup.title)}</div>
                <div class="writeup-card-meta">
                    <span class="severity-badge severity-${writeup.severity}">${writeup.severity}</span>
                    ${writeup.cvssScore > 0 ? `<span class="cvss-score">CVSS: ${writeup.cvssScore}</span>` : ''}
                    <span class="note-date">${new Date(writeup.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

        this.listContainer.innerHTML = html;

        // Bind click events
        this.listContainer.querySelectorAll('.writeup-card').forEach(card => {
            card.addEventListener('click', () => {
                this.editWriteup(card.dataset.id);
            });
        });
    }

    renderEditor() {
        if (!this.currentWriteup) {
            this.renderEmptyState();
            return;
        }

        const w = this.currentWriteup;
        
        const html = `
            <div class="writeup-editor">
                <div class="writeup-header">
                    <input type="text" id="writeupTitle" value="${this.escapeHtml(w.title)}" 
                           placeholder="Vulnerability Title" class="writeup-title-input">
                    <div class="writeup-meta">
                        <select id="writeupSeverity" class="form-input">
                            <option value="critical" ${w.severity === 'critical' ? 'selected' : ''}>Critical</option>
                            <option value="high" ${w.severity === 'high' ? 'selected' : ''}>High</option>
                            <option value="medium" ${w.severity === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="low" ${w.severity === 'low' ? 'selected' : ''}>Low</option>
                            <option value="info" ${w.severity === 'info' ? 'selected' : ''}>Info</option>
                        </select>
                    </div>
                </div>

                <div class="writeup-toolbar">
                    <button id="saveWriteup" class="btn btn-primary">Save</button>
                    <button id="deleteWriteup" class="btn btn-danger btn-sm">Delete</button>
                    <button id="exportWriteup" class="btn btn-secondary btn-sm">Export</button>
                </div>

                <div class="writeup-content-editor">
                    <div class="editor-section">
                        <label>Description</label>
                        <textarea id="writeupDescription" class="form-input" rows="4" 
                                  placeholder="Brief description of the vulnerability...">${this.escapeHtml(w.description)}</textarea>
                    </div>

                    <div class="editor-section">
                        <label>Reproduction Steps</label>
                        <div id="stepsContainer">
                            ${w.steps.map((step, i) => `
                                <div class="step-item">
                                    <span class="step-number">${i + 1}.</span>
                                    <input type="text" class="form-input step-input" value="${this.escapeHtml(step)}" 
                                           placeholder="Step ${i + 1}">
                                    ${w.steps.length > 1 ? '<button class="remove-step-btn" data-index="' + i + '">×</button>' : ''}
                                </div>
                            `).join('')}
                        </div>
                        <button id="addStep" class="btn btn-outline btn-sm">+ Add Step</button>
                    </div>

                    <div class="editor-section">
                        <label>Impact</label>
                        <textarea id="writeupImpact" class="form-input" rows="3" 
                                  placeholder="Impact of this vulnerability...">${this.escapeHtml(w.impact)}</textarea>
                    </div>

                    <div class="editor-section">
                        <label>Remediation</label>
                        <textarea id="writeupRemediation" class="form-input" rows="3" 
                                  placeholder="How to fix this vulnerability...">${this.escapeHtml(w.remediation)}</textarea>
                    </div>

                    <div class="editor-section">
                        <label>References</label>
                        <div id="referencesContainer">
                            ${w.references.map((ref, i) => `
                                <div class="reference-item">
                                    <input type="text" class="form-input reference-input" value="${this.escapeHtml(ref)}" 
                                           placeholder="https://...">
                                    <button class="remove-reference-btn" data-index="${i}">×</button>
                                </div>
                            `).join('')}
                        </div>
                        <button id="addReference" class="btn btn-outline btn-sm">+ Add Reference</button>
                    </div>
                </div>
            </div>
        `;

        this.contentContainer.innerHTML = html;
        this.bindEditorEvents();
    }

    bindEditorEvents() {
        // Auto-save on title change (debounced)
        let titleSaveTimeout;
        document.getElementById('writeupTitle')?.addEventListener('input', (e) => {
            if (this.currentWriteup) {
                this.currentWriteup.title = e.target.value;
                this.currentWriteup.updatedAt = new Date().toISOString();
                this.renderList();
                
                // Debounce the update notification
                clearTimeout(titleSaveTimeout);
                titleSaveTimeout = setTimeout(() => {
                    this.notifyUpdate();
                }, 500);
            }
        });

        // Save button
        document.getElementById('saveWriteup')?.addEventListener('click', () => {
            this.saveCurrentWriteup();
            alert('Writeup saved!');
        });

        // Delete button
        document.getElementById('deleteWriteup')?.addEventListener('click', () => {
            if (this.currentWriteup) {
                this.deleteWriteup(this.currentWriteup.id);
            }
        });

        // Export button
        document.getElementById('exportWriteup')?.addEventListener('click', () => {
            this.exportWriteup();
        });

        // Auto-save textareas (debounced)
        let textareaSaveTimeout;
        const textareaIds = ['writeupDescription', 'writeupImpact', 'writeupRemediation'];
        textareaIds.forEach(id => {
            document.getElementById(id)?.addEventListener('input', (e) => {
                if (this.currentWriteup) {
                    clearTimeout(textareaSaveTimeout);
                    textareaSaveTimeout = setTimeout(() => {
                        const field = id.replace('writeup', '').toLowerCase();
                        this.currentWriteup[field] = e.target.value;
                        this.currentWriteup.updatedAt = new Date().toISOString();
                        this.notifyUpdate();
                    }, 1000);
                }
            });
        });

        // Severity change
        document.getElementById('writeupSeverity')?.addEventListener('change', (e) => {
            this.currentWriteup.severity = e.target.value;
            this.currentWriteup.updatedAt = new Date().toISOString();
            this.renderList();
            this.notifyUpdate();
        });

        // Auto-save step inputs
        let stepSaveTimeout;
        document.querySelectorAll('.step-input').forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (this.currentWriteup) {
                    clearTimeout(stepSaveTimeout);
                    stepSaveTimeout = setTimeout(() => {
                        this.currentWriteup.steps[index] = e.target.value;
                        this.currentWriteup.updatedAt = new Date().toISOString();
                        this.notifyUpdate();
                    }, 1000);
                }
            });
        });

        // Auto-save reference inputs
        let refSaveTimeout;
        document.querySelectorAll('.reference-input').forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (this.currentWriteup) {
                    clearTimeout(refSaveTimeout);
                    refSaveTimeout = setTimeout(() => {
                        this.currentWriteup.references[index] = e.target.value;
                        this.currentWriteup.updatedAt = new Date().toISOString();
                        this.notifyUpdate();
                    }, 1000);
                }
            });
        });

        // Add step
        document.getElementById('addStep')?.addEventListener('click', () => {
            this.currentWriteup.steps.push('');
            this.currentWriteup.updatedAt = new Date().toISOString();
            this.renderEditor();
            this.notifyUpdate();
        });

        // Remove step
        document.querySelectorAll('.remove-step-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.currentWriteup.steps.splice(index, 1);
                this.currentWriteup.updatedAt = new Date().toISOString();
                this.renderEditor();
                this.notifyUpdate();
            });
        });

        // Add reference
        document.getElementById('addReference')?.addEventListener('click', () => {
            this.currentWriteup.references.push('');
            this.currentWriteup.updatedAt = new Date().toISOString();
            this.renderEditor();
            this.notifyUpdate();
        });

        // Remove reference
        document.querySelectorAll('.remove-reference-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.currentWriteup.references.splice(index, 1);
                this.currentWriteup.updatedAt = new Date().toISOString();
                this.renderEditor();
                this.notifyUpdate();
            });
        });
    }

    exportWriteup() {
        if (!this.currentWriteup) return;

        const markdown = `# ${this.currentWriteup.title}

**Severity:** ${this.currentWriteup.severity.toUpperCase()}  
**Date:** ${new Date(this.currentWriteup.createdAt).toLocaleDateString()}

## Description
${this.currentWriteup.description}

## Reproduction Steps
${this.currentWriteup.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Impact
${this.currentWriteup.impact}

## Remediation
${this.currentWriteup.remediation}

## References
${this.currentWriteup.references.map(ref => `- ${ref}`).join('\n')}
`;

        this.downloadFile(markdown, `${this.currentWriteup.title}.md`, 'text/markdown');
    }

    renderEmptyState() {
        this.contentContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>No Writeup Selected</h3>
                <p>Select a writeup from the list or create a new one</p>
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
            this.onUpdate(this.writeups);
        }
    }
}
