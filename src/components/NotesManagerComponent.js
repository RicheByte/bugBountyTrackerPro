// Notes Manager Component
// Manages notes list and editor in the UI

class NotesManagerComponent {
    constructor(contentContainer, listContainer, searchInput) {
        this.contentContainer = contentContainer;
        this.listContainer = listContainer;
        this.searchInput = searchInput;
        this.notes = [];
        this.currentNote = null;
        this.onUpdate = null;
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        this.renderEmptyState();
        this.bindSearchEvents();
    }

    bindSearchEvents() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderList();
            });
        }
    }

    loadNotes(notes, onUpdate) {
        this.notes = notes || [];
        this.onUpdate = onUpdate;
        this.renderList();
        
        if (this.notes.length === 0) {
            this.renderEmptyState();
        }
    }

    createNew() {
        const newNote = {
            id: Date.now().toString(),
            title: 'New Note',
            content: '',
            tags: [],
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.notes.unshift(newNote);
        this.currentNote = newNote;
        this.renderList();
        this.renderEditor();
        this.notifyUpdate();
    }

    editNote(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            this.currentNote = note;
            this.renderEditor();
        }
    }

    deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(n => n.id !== id);
            if (this.currentNote && this.currentNote.id === id) {
                this.currentNote = null;
                this.renderEmptyState();
            }
            this.renderList();
            this.notifyUpdate();
        }
    }

    togglePin(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.pinned = !note.pinned;
            // Move pinned notes to top
            this.notes.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
            this.renderList();
            this.notifyUpdate();
        }
    }

    saveCurrentNote() {
        if (!this.currentNote) return;

        this.currentNote.title = document.getElementById('noteTitle')?.value || '';
        this.currentNote.content = document.getElementById('noteContent')?.value || '';
        this.currentNote.updatedAt = new Date().toISOString();

        // Get tags from input
        const tagInput = document.getElementById('noteTagInput')?.value || '';
        if (tagInput.trim()) {
            const newTags = tagInput.split(',').map(t => t.trim()).filter(t => t);
            this.currentNote.tags = [...new Set([...this.currentNote.tags, ...newTags])];
            this.renderEditor();
        }

        this.renderList();
        this.notifyUpdate();
    }

    removeTag(tag) {
        if (!this.currentNote) return;
        this.currentNote.tags = this.currentNote.tags.filter(t => t !== tag);
        this.renderEditor();
        this.notifyUpdate();
    }

    filterNotes() {
        if (!this.searchQuery) return this.notes;

        return this.notes.filter(note => {
            const searchText = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();
            return searchText.includes(this.searchQuery);
        });
    }

    renderList() {
        const filteredNotes = this.filterNotes();

        if (filteredNotes.length === 0) {
            this.listContainer.innerHTML = this.searchQuery 
                ? '<div class="empty-state"><p>No notes found</p></div>'
                : '<div class="empty-state"><p>No notes yet</p></div>';
            return;
        }

        const html = filteredNotes.map(note => {
            const preview = note.content.substring(0, 100);
            
            return `
                <div class="note-card ${note.id === this.currentNote?.id ? 'active' : ''} ${note.pinned ? 'pinned' : ''}" 
                     data-id="${note.id}">
                    <div class="note-card-header">
                        <div class="note-card-title">${this.escapeHtml(note.title)}</div>
                        <span class="pin-icon" data-id="${note.id}" title="${note.pinned ? 'Unpin' : 'Pin'}">
                            ${note.pinned ? '📌' : '📍'}
                        </span>
                    </div>
                    <div class="note-card-preview">${this.escapeHtml(preview)}${note.content.length > 100 ? '...' : ''}</div>
                    <div class="note-card-meta">
                        <span class="note-date">${new Date(note.updatedAt).toLocaleDateString()}</span>
                        <div class="note-tags">
                            ${note.tags.map(tag => `<span class="note-tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.listContainer.innerHTML = html;

        // Bind events
        this.listContainer.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('pin-icon')) {
                    this.editNote(card.dataset.id);
                }
            });
        });

        this.listContainer.querySelectorAll('.pin-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePin(icon.dataset.id);
            });
        });
    }

    renderEditor() {
        if (!this.currentNote) {
            this.renderEmptyState();
            return;
        }

        const n = this.currentNote;

        const html = `
            <div class="note-editor">
                <div class="note-editor-header">
                    <h3>${n.pinned ? '📌' : '📝'} Editing Note</h3>
                    <div class="note-editor-actions">
                        <button id="saveNote" class="btn btn-primary btn-sm">Save</button>
                        <button id="deleteNote" class="btn btn-danger btn-sm">Delete</button>
                        <button id="exportNote" class="btn btn-secondary btn-sm">Export</button>
                    </div>
                </div>

                <input type="text" id="noteTitle" value="${this.escapeHtml(n.title)}" 
                       placeholder="Note Title" class="note-title-input">

                <div class="tag-input-container">
                    <label>Tags</label>
                    <div class="tag-input-wrapper">
                        ${n.tags.map(tag => `
                            <span class="tag-chip">
                                ${this.escapeHtml(tag)}
                                <button class="tag-chip-remove" data-tag="${this.escapeHtml(tag)}">×</button>
                            </span>
                        `).join('')}
                        <input type="text" id="noteTagInput" class="tag-input" 
                               placeholder="Add tags (comma-separated)...">
                    </div>
                </div>

                <div class="editor-toolbar">
                    <button class="toolbar-btn" data-format="bold" title="Bold"><b>B</b></button>
                    <button class="toolbar-btn" data-format="italic" title="Italic"><i>I</i></button>
                    <span class="toolbar-divider"></span>
                    <button class="toolbar-btn" data-format="h1" title="Heading 1">H1</button>
                    <button class="toolbar-btn" data-format="h2" title="Heading 2">H2</button>
                    <button class="toolbar-btn" data-format="h3" title="Heading 3">H3</button>
                    <span class="toolbar-divider"></span>
                    <button class="toolbar-btn" data-format="ul" title="Bullet List">• List</button>
                    <button class="toolbar-btn" data-format="ol" title="Numbered List">1. List</button>
                    <span class="toolbar-divider"></span>
                    <button class="toolbar-btn" data-format="code" title="Code">Code</button>
                </div>

                <textarea id="noteContent" class="note-content-editor" 
                          placeholder="Start writing your note...">${this.escapeHtml(n.content)}</textarea>

                <div class="note-metadata">
                    <div class="metadata-item">
                        <span>Created: ${new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="metadata-item">
                        <span>Updated: ${new Date(n.updatedAt).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;

        this.contentContainer.innerHTML = html;
        this.bindEditorEvents();
    }

    bindEditorEvents() {
        // Auto-save on title change
        document.getElementById('noteTitle')?.addEventListener('input', (e) => {
            if (this.currentNote) {
                this.currentNote.title = e.target.value;
                this.currentNote.updatedAt = new Date().toISOString();
                this.renderList();
                this.notifyUpdate();
            }
        });

        // Auto-save on content change (debounced)
        let contentSaveTimeout;
        document.getElementById('noteContent')?.addEventListener('input', (e) => {
            if (this.currentNote) {
                clearTimeout(contentSaveTimeout);
                contentSaveTimeout = setTimeout(() => {
                    this.currentNote.content = e.target.value;
                    this.currentNote.updatedAt = new Date().toISOString();
                    this.renderList();
                    this.notifyUpdate();
                }, 500); // Save after 500ms of no typing
            }
        });

        // Save
        document.getElementById('saveNote')?.addEventListener('click', () => {
            this.saveCurrentNote();
            alert('Note saved!');
        });

        // Delete
        document.getElementById('deleteNote')?.addEventListener('click', () => {
            if (this.currentNote) {
                this.deleteNote(this.currentNote.id);
            }
        });

        // Export
        document.getElementById('exportNote')?.addEventListener('click', () => {
            this.exportNote();
        });

        // Tag input - add on Enter or comma
        const tagInput = document.getElementById('noteTagInput');
        if (tagInput) {
            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    this.saveCurrentNote();
                }
            });
        }

        // Remove tag
        document.querySelectorAll('.tag-chip-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeTag(btn.dataset.tag);
            });
        });

        // Formatting buttons
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyFormatting(btn.dataset.format);
            });
        });
    }

    applyFormatting(format) {
        const textarea = document.getElementById('noteContent');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';

        switch (format) {
            case 'bold':
                replacement = `**${selectedText}**`;
                break;
            case 'italic':
                replacement = `*${selectedText}*`;
                break;
            case 'h1':
                replacement = `\n# ${selectedText}\n`;
                break;
            case 'h2':
                replacement = `\n## ${selectedText}\n`;
                break;
            case 'h3':
                replacement = `\n### ${selectedText}\n`;
                break;
            case 'ul':
                replacement = `\n- ${selectedText}\n`;
                break;
            case 'ol':
                replacement = `\n1. ${selectedText}\n`;
                break;
            case 'code':
                replacement = `\`${selectedText}\``;
                break;
        }

        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.focus();
        textarea.selectionStart = start;
        textarea.selectionEnd = start + replacement.length;
    }

    exportNote() {
        if (!this.currentNote) return;

        const markdown = `# ${this.currentNote.title}

**Tags:** ${this.currentNote.tags.join(', ')}  
**Created:** ${new Date(this.currentNote.createdAt).toLocaleString()}  
**Updated:** ${new Date(this.currentNote.updatedAt).toLocaleString()}

---

${this.currentNote.content}
`;

        this.downloadFile(markdown, `${this.currentNote.title}.md`, 'text/markdown');
    }

    renderEmptyState() {
        this.contentContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>No Note Selected</h3>
                <p>Select a note from the list or create a new one</p>
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
            this.onUpdate(this.notes);
        }
    }
}
