// Notes Manager Component

class NotesManager {
    constructor() {
        this.notes = [];
        this.currentNote = null;
        this.templateSelector = new TemplateSelector('note');
        this.onChange = null;
    }

    createEmptyNote() {
        return {
            id: Date.now().toString(),
            title: '',
            content: '',
            tags: [],
            category: 'general',
            linkedTo: [], // Links to writeups, workflows, tasks
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    applyTemplate(template) {
        if (!template) return this.createEmptyNote();
        
        const note = this.createEmptyNote();
        note.title = template.name;
        note.content = template.content || '';
        note.tags = template.tags || [];
        note.category = template.category || 'general';
        return note;
    }

    renderManager(container) {
        const html = `
            <div class="notes-manager">
                <div class="notes-sidebar">
                    <div class="notes-sidebar-header">
                        <h3>Notes</h3>
                        <button id="newNoteBtn" class="btn btn-primary btn-sm">+ New</button>
                    </div>

                    <div class="notes-search-bar">
                        <input type="text" 
                               id="notesSearchInput" 
                               placeholder="Search notes..." 
                               class="form-input">
                    </div>

                    <div class="notes-filters">
                        <button class="filter-tag active" data-filter="all">All</button>
                        <button class="filter-tag" data-filter="general">General</button>
                        <button class="filter-tag" data-filter="recon">Recon</button>
                        <button class="filter-tag" data-filter="testing">Testing</button>
                        <button class="filter-tag" data-filter="exploitation">Exploit</button>
                    </div>

                    <div id="notesListContainer" class="notes-list-container">
                        ${this.renderNotesList()}
                    </div>
                </div>

                <div class="notes-editor-area">
                    ${this.currentNote ? this.renderNoteEditor() : this.renderEmptyState()}
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.bindEvents(container);
    }

    renderNotesList(filter = 'all', searchQuery = '') {
        let filtered = this.notes;

        // Apply category filter
        if (filter !== 'all') {
            filtered = filtered.filter(note => note.category === filter);
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(note => 
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query) ||
                note.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        if (filtered.length === 0) {
            return '<p class="empty-message">No notes found</p>';
        }

        return filtered.map(note => this.renderNoteCard(note)).join('');
    }

    renderNoteCard(note) {
        const preview = this.getPreview(note.content, 100);
        const isActive = this.currentNote && this.currentNote.id === note.id;
        const dateStr = new Date(note.updatedAt).toLocaleDateString();

        return `
            <div class="note-card ${isActive ? 'active' : ''}" data-note-id="${note.id}">
                <div class="note-card-header">
                    <h5>${note.title || 'Untitled Note'}</h5>
                    <span class="note-date">${dateStr}</span>
                </div>
                <div class="note-card-preview">${preview}</div>
                ${note.tags.length > 0 ? `
                    <div class="note-card-tags">
                        ${note.tags.slice(0, 3).map(tag => 
                            `<span class="note-tag-mini">${tag}</span>`
                        ).join('')}
                        ${note.tags.length > 3 ? `<span class="note-tag-mini">+${note.tags.length - 3}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderNoteEditor() {
        return `
            <div class="note-editor">
                <div class="note-editor-toolbar">
                    <div class="toolbar-left">
                        <button id="saveNoteBtn" class="btn btn-primary">💾 Save</button>
                        <button id="deleteNoteBtn" class="btn btn-danger">🗑️ Delete</button>
                    </div>
                    <div class="toolbar-right">
                        <button id="exportNoteBtn" class="btn btn-outline">📥 Export</button>
                        <select id="noteCategorySelect" class="form-input">
                            <option value="general" ${this.currentNote.category === 'general' ? 'selected' : ''}>General</option>
                            <option value="recon" ${this.currentNote.category === 'recon' ? 'selected' : ''}>Reconnaissance</option>
                            <option value="testing" ${this.currentNote.category === 'testing' ? 'selected' : ''}>Testing</option>
                            <option value="exploitation" ${this.currentNote.category === 'exploitation' ? 'selected' : ''}>Exploitation</option>
                            <option value="reporting" ${this.currentNote.category === 'reporting' ? 'selected' : ''}>Reporting</option>
                        </select>
                    </div>
                </div>

                <div class="note-title-section">
                    <input type="text" 
                           id="noteTitleInput" 
                           value="${this.currentNote.title}" 
                           placeholder="Note Title" 
                           class="note-title-input">
                </div>

                <div class="note-tags-section">
                    <div class="tags-container" id="tagsContainer">
                        ${this.currentNote.tags.map(tag => this.renderTag(tag)).join('')}
                    </div>
                    <div class="tag-input-wrapper">
                        <input type="text" 
                               id="tagInput" 
                               placeholder="Add tag..." 
                               class="tag-input form-input">
                        <button id="addTagBtn" class="btn btn-outline btn-sm">+ Add</button>
                    </div>
                </div>

                <div class="note-content-section">
                    <div class="editor-controls">
                        <button class="editor-btn" data-action="bold" title="Bold"><b>B</b></button>
                        <button class="editor-btn" data-action="italic" title="Italic"><i>I</i></button>
                        <button class="editor-btn" data-action="underline" title="Underline"><u>U</u></button>
                        <button class="editor-btn" data-action="insertUnorderedList" title="Bullet List">• List</button>
                        <button class="editor-btn" data-action="insertOrderedList" title="Numbered List">1. List</button>
                        <button class="editor-btn" data-action="createLink" title="Link">🔗</button>
                        <button class="editor-btn" data-action="formatCode" title="Code">&lt;/&gt;</button>
                    </div>
                    <div id="noteContentEditor" 
                         class="note-content-editor" 
                         contenteditable="true">${this.currentNote.content}</div>
                </div>

                <div class="note-metadata">
                    <small>Created: ${new Date(this.currentNote.createdAt).toLocaleString()}</small>
                    <small>Updated: ${new Date(this.currentNote.updatedAt).toLocaleString()}</small>
                </div>
            </div>
        `;
    }

    renderTag(tag) {
        return `
            <span class="note-tag">
                ${tag}
                <button class="remove-tag-btn" data-tag="${tag}">×</button>
            </span>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>No Note Selected</h3>
                <p>Select a note from the list or create a new one</p>
                <button id="createFirstNote" class="btn btn-primary">Create Note</button>
            </div>
        `;
    }

    bindEvents(container) {
        // New note button
        const newNoteBtn = container.querySelector('#newNoteBtn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => this.createNewNote(container));
        }

        const createFirstBtn = container.querySelector('#createFirstNote');
        if (createFirstBtn) {
            createFirstBtn.addEventListener('click', () => this.createNewNote(container));
        }

        // Search
        const searchInput = container.querySelector('#notesSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(container, e.target.value));
        }

        // Filters
        container.querySelectorAll('.filter-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.handleFilter(container, e.target.dataset.filter);
            });
        });

        // Note cards
        container.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => {
                const noteId = card.dataset.noteId;
                this.selectNote(noteId, container);
            });
        });

        // Editor events
        if (this.currentNote) {
            this.bindEditorEvents(container);
        }
    }

    bindEditorEvents(container) {
        // Title
        const titleInput = container.querySelector('#noteTitleInput');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                this.currentNote.title = e.target.value;
                this.updateNote();
            });
        }

        // Category
        const categorySelect = container.querySelector('#noteCategorySelect');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.currentNote.category = e.target.value;
                this.updateNote();
            });
        }

        // Content editor
        const contentEditor = container.querySelector('#noteContentEditor');
        if (contentEditor) {
            contentEditor.addEventListener('input', () => {
                this.currentNote.content = contentEditor.innerHTML;
                this.updateNote();
            });
        }

        // Editor controls
        container.querySelectorAll('.editor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.execCommand(action, container);
            });
        });

        // Tags
        const addTagBtn = container.querySelector('#addTagBtn');
        const tagInput = container.querySelector('#tagInput');
        
        if (addTagBtn && tagInput) {
            const addTag = () => {
                const tag = tagInput.value.trim();
                if (tag && isValidTag(tag)) {
                    if (!this.currentNote.tags.includes(tag)) {
                        this.currentNote.tags.push(tag);
                        this.updateNote();
                        this.renderManager(container.parentElement);
                    }
                    tagInput.value = '';
                }
            };

            addTagBtn.addEventListener('click', addTag);
            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                }
            });
        }

        // Remove tags
        container.querySelectorAll('.remove-tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                this.currentNote.tags = this.currentNote.tags.filter(t => t !== tag);
                this.updateNote();
                this.renderManager(container.parentElement);
            });
        });

        // Toolbar buttons
        const saveBtn = container.querySelector('#saveNoteBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }

        const deleteBtn = container.querySelector('#deleteNoteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteNote(container));
        }

        const exportBtn = container.querySelector('#exportNoteBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportNote());
        }
    }

    execCommand(command, container) {
        if (command === 'createLink') {
            const url = prompt('Enter URL:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else if (command === 'formatCode') {
            const selection = window.getSelection().toString();
            if (selection) {
                document.execCommand('insertHTML', false, `<code>${selection}</code>`);
            }
        } else {
            document.execCommand(command, false, null);
        }
        
        const contentEditor = container.querySelector('#noteContentEditor');
        if (contentEditor) {
            this.currentNote.content = contentEditor.innerHTML;
            this.updateNote();
        }
    }

    createNewNote(container) {
        // Show template selector
        const templateContainer = document.createElement('div');
        templateContainer.className = 'template-selector-modal';
        
        this.templateSelector.show(templateContainer, (template) => {
            const note = this.applyTemplate(template);
            this.notes.push(note);
            this.currentNote = note;
            templateContainer.remove();
            this.renderManager(container.parentElement);
            this.triggerChange();
        });

        container.appendChild(templateContainer);
    }

    selectNote(noteId, container) {
        this.currentNote = this.notes.find(n => n.id === noteId);
        this.renderManager(container.parentElement);
    }

    handleSearch(container, query) {
        const activeFilter = container.querySelector('.filter-tag.active');
        const filter = activeFilter ? activeFilter.dataset.filter : 'all';
        const listContainer = container.querySelector('#notesListContainer');
        listContainer.innerHTML = this.renderNotesList(filter, query);
        
        // Re-bind card click events
        listContainer.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => {
                const noteId = card.dataset.noteId;
                this.selectNote(noteId, container);
            });
        });
    }

    handleFilter(container, filter) {
        const searchInput = container.querySelector('#notesSearchInput');
        const query = searchInput ? searchInput.value : '';
        const listContainer = container.querySelector('#notesListContainer');
        listContainer.innerHTML = this.renderNotesList(filter, query);
        
        // Re-bind card click events
        listContainer.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => {
                const noteId = card.dataset.noteId;
                this.selectNote(noteId, container);
            });
        });
    }

    getPreview(content, maxLength = 100) {
        const text = markdownToPlainText(content.replace(/<[^>]*>/g, ''));
        return text.length > maxLength 
            ? text.substring(0, maxLength) + '...' 
            : text;
    }

    updateNote() {
        if (this.currentNote) {
            this.currentNote.updatedAt = new Date().toISOString();
            this.triggerChange();
        }
    }

    save() {
        if (!this.currentNote) return false;

        const validation = validateNote(this.currentNote);
        if (!validation.isValid) {
            alert('Validation errors:\n' + validation.errors.join('\n'));
            return false;
        }

        this.updateNote();
        alert('Note saved!');
        return true;
    }

    deleteNote(container) {
        if (!this.currentNote) return;

        if (confirm('Delete this note?')) {
            this.notes = this.notes.filter(n => n.id !== this.currentNote.id);
            this.currentNote = null;
            this.triggerChange();
            this.renderManager(container.parentElement);
        }
    }

    exportNote() {
        if (!this.currentNote) return;

        const content = `# ${this.currentNote.title}\n\n${this.currentNote.content}`;
        const filename = `${this.currentNote.title.replace(/[^a-z0-9]/gi, '_')}.md`;
        downloadFile(content, filename, 'text/markdown');
    }

    triggerChange() {
        if (this.onChange) {
            this.onChange(this.notes);
        }
    }

    setNotes(notes) {
        this.notes = notes || [];
    }

    getNotes() {
        return this.notes;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotesManager;
}
