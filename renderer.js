const { ipcRenderer } = require('electron');
const fs = require('fs');

class BugBountyTracker {
    constructor() {
        this.projects = [];
        this.currentProject = null;
        this.currentNoteItem = null;
        this.checklistData = null;
        this.viewMode = 'tree'; // 'tree' or 'canvas'
        
        this.init();
    }

    async init() {
        // Load checklist data
        try {
            const response = await fetch('checklist-data.json');
            this.checklistData = await response.json();
        } catch (error) {
            console.error('Failed to load checklist data:', error);
        }

        this.bindEvents();
        this.renderProjectsList();
    }

    bindEvents() {
        // Project management
        document.getElementById('createProject').addEventListener('click', () => this.createProject());
        document.getElementById('newProject').addEventListener('click', () => this.newProject());
        document.getElementById('saveProject').addEventListener('click', () => this.saveProject());
        document.getElementById('loadProject').addEventListener('click', () => this.loadProject());
        document.getElementById('exportPdf').addEventListener('click', () => this.exportPdf());

        // View controls
        document.getElementById('toggleView').addEventListener('click', () => this.toggleView());
        document.getElementById('expandAll').addEventListener('click', () => this.expandAll());
        document.getElementById('collapseAll').addEventListener('click', () => this.collapseAll());

        // Notes management
        document.getElementById('saveNote').addEventListener('click', () => this.saveNote());
        document.getElementById('clearNote').addEventListener('click', () => this.clearNote());
        document.getElementById('closeNotes').addEventListener('click', () => this.hideNotes());

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.hideModal());
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('projectModal')) {
                this.hideModal();
            }
        });
    }

    createProject() {
        const name = document.getElementById('projectName').value.trim();
        const url = document.getElementById('projectUrl').value.trim();
        const scope = document.getElementById('projectScope').value;

        if (!name) {
            alert('Please enter a project name');
            return;
        }

        const project = {
            id: Date.now().toString(),
            name,
            url,
            scope,
            createdAt: new Date().toISOString(),
            checklist: this.initializeChecklist(),
            notes: {}
        };

        this.projects.push(project);
        this.currentProject = project;
        
        this.renderProjectsList();
        this.renderChecklist();
        this.clearProjectForm();
    }

    initializeChecklist() {
        // Deep clone the checklist data and add completion status
        return JSON.parse(JSON.stringify(this.checklistData.checklist)).map(section => ({
            ...section,
            expanded: false,
            tasks: section.tasks ? section.tasks.map(task => ({
                ...task,
                completed: false,
                notes: ''
            })) : [],
            subsections: section.subsections ? section.subsections.map(subsection => ({
                ...subsection,
                expanded: false,
                tasks: subsection.tasks.map(task => ({
                    ...task,
                    completed: false,
                    notes: ''
                }))
            })) : []
        }));
    }

    newProject() {
        this.currentProject = null;
        this.renderChecklist();
        document.getElementById('currentProjectName').textContent = 'No Project Selected';
    }

    async saveProject() {
        if (!this.currentProject) {
            alert('No project selected');
            return;
        }

        const result = await ipcRenderer.invoke('save-project', this.currentProject);
        if (result.success) {
            alert('Project saved successfully!');
        } else {
            alert('Failed to save project: ' + (result.error || 'Unknown error'));
        }
    }

    async loadProject() {
        const result = await ipcRenderer.invoke('load-project');
        if (result.success) {
            this.currentProject = result.data;
            this.renderProjectsList();
            this.renderChecklist();
            document.getElementById('currentProjectName').textContent = this.currentProject.name;
            alert('Project loaded successfully!');
        } else if (result.error) {
            alert('Failed to load project: ' + result.error);
        }
    }

    async exportPdf() {
        if (!this.currentProject) {
            alert('No project selected');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text(`Bug Bounty Report: ${this.currentProject.name}`, 20, 20);

        // Add project info
        doc.setFontSize(12);
        doc.text(`Target URL: ${this.currentProject.url}`, 20, 40);
        doc.text(`Scope: ${this.currentProject.scope}`, 20, 50);
        doc.text(`Created: ${new Date(this.currentProject.createdAt).toLocaleDateString()}`, 20, 60);

        let yPosition = 80;

        // Add checklist progress
        this.currentProject.checklist.forEach(section => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(255, 107, 53);
            doc.text(`${section.icon} ${section.title}`, 20, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(section.description, 20, yPosition);
            yPosition += 15;

            // Calculate progress
            const totalTasks = this.countTasks(section);
            const completedTasks = this.countCompletedTasks(section);
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            doc.setTextColor(0, 0, 0);
            doc.text(`Progress: ${completedTasks}/${totalTasks} (${progress.toFixed(1)}%)`, 20, yPosition);
            yPosition += 20;

            // Add notes if any
            const sectionNotes = this.getSectionNotes(section);
            if (sectionNotes) {
                doc.setTextColor(0, 0, 0);
                doc.text('Notes:', 25, yPosition);
                yPosition += 7;
                
                const splitNotes = doc.splitTextToSize(sectionNotes, 160);
                doc.text(splitNotes, 30, yPosition);
                yPosition += splitNotes.length * 5 + 10;
            }

            yPosition += 10;
        });

        const result = await ipcRenderer.invoke('export-pdf', {
            projectName: this.currentProject.name
        });

        if (result.success) {
            doc.save(result.path);
            alert('PDF exported successfully!');
        } else {
            // Fallback: download directly
            doc.save(`${this.currentProject.name}_report.pdf`);
        }
    }

    countTasks(section) {
        let count = section.tasks ? section.tasks.length : 0;
        if (section.subsections) {
            section.subsections.forEach(subsection => {
                count += subsection.tasks.length;
            });
        }
        return count;
    }

    countCompletedTasks(section) {
        let count = 0;
        
        if (section.tasks) {
            count += section.tasks.filter(task => task.completed).length;
        }
        
        if (section.subsections) {
            section.subsections.forEach(subsection => {
                count += subsection.tasks.filter(task => task.completed).length;
            });
        }
        
        return count;
    }

    getSectionNotes(section) {
        const notes = [];
        
        if (section.tasks) {
            section.tasks.forEach(task => {
                if (task.notes) notes.push(`• ${task.description}: ${task.notes}`);
            });
        }
        
        if (section.subsections) {
            section.subsections.forEach(subsection => {
                subsection.tasks.forEach(task => {
                    if (task.notes) notes.push(`• ${task.description}: ${task.notes}`);
                });
            });
        }
        
        return notes.join('\n');
    }

    renderProjectsList() {
        const container = document.getElementById('projectsList');
        container.innerHTML = '';

        this.projects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = `project-item ${this.currentProject?.id === project.id ? 'active' : ''}`;
            projectEl.innerHTML = `
                <strong>${project.name}</strong><br>
                <small>${project.url}</small>
            `;
            projectEl.addEventListener('click', () => this.selectProject(project));
            container.appendChild(projectEl);
        });
    }

    selectProject(project) {
        this.currentProject = project;
        this.renderProjectsList();
        this.renderChecklist();
        document.getElementById('currentProjectName').textContent = project.name;
    }

    renderChecklist() {
        const container = document.getElementById('canvasContainer');
        
        if (!this.currentProject) {
            container.innerHTML = '<div class="no-project">Please create or select a project to start</div>';
            return;
        }

        if (this.viewMode === 'tree') {
            this.renderTreeView(container);
        } else {
            this.renderCanvasView(container);
        }
    }

    renderTreeView(container) {
        container.innerHTML = '<div class="checklist-tree" id="checklistTree"></div>';
        const treeContainer = document.getElementById('checklistTree');

        this.currentProject.checklist.forEach((section, sectionIndex) => {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'checklist-section';
            
            const totalTasks = this.countTasks(section);
            const completedTasks = this.countCompletedTasks(section);
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            sectionEl.innerHTML = `
                <div class="section-header collapsible ${section.expanded ? 'expanded' : ''}" 
                     data-section="${sectionIndex}">
                    <span class="section-icon">${section.icon}</span>
                    <h3>${section.title}</h3>
                    <span style="margin-left: auto; font-size: 0.8rem; color: #aaa;">
                        ${completedTasks}/${totalTasks}
                    </span>
                </div>
                <div class="section-content" style="display: ${section.expanded ? 'block' : 'none'}">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <p>${section.description}</p>
                    ${this.renderSectionContent(section, sectionIndex)}
                </div>
            `;

            treeContainer.appendChild(sectionEl);
        });

        this.bindChecklistEvents();
    }

    renderSectionContent(section, sectionIndex) {
        let html = '';

        // Render tasks directly under section
        if (section.tasks && section.tasks.length > 0) {
            html += '<div class="tasks-list">';
            section.tasks.forEach((task, taskIndex) => {
                html += this.renderTaskItem(task, sectionIndex, taskIndex);
            });
            html += '</div>';
        }

        // Render subsections
        if (section.subsections && section.subsections.length > 0) {
            section.subsections.forEach((subsection, subsectionIndex) => {
                html += `
                    <div class="subsection">
                        <div class="subsection-header collapsible ${subsection.expanded ? 'expanded' : ''}"
                             data-section="${sectionIndex}" data-subsection="${subsectionIndex}">
                            <h4>${subsection.title}</h4>
                        </div>
                        <div class="subsection-content" style="display: ${subsection.expanded ? 'block' : 'none'}">
                            <div class="tasks-list">
                                ${subsection.tasks.map((task, taskIndex) => 
                                    this.renderTaskItem(task, sectionIndex, subsectionIndex, taskIndex)
                                ).join('')}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        return html;
    }

    renderTaskItem(task, sectionIndex, subsectionIndex, taskIndex = null) {
        const hasSubsection = taskIndex !== null;
        const taskId = hasSubsection ? 
            `${sectionIndex}-${subsectionIndex}-${taskIndex}` : 
            `${sectionIndex}-${subsectionIndex}`;

        return `
            <div class="task-item">
                <input type="checkbox" class="task-checkbox" 
                       ${task.completed ? 'checked' : ''}
                       data-task="${taskId}">
                <div class="task-content">
                    <div class="task-description">
                        <strong>${task.id}</strong>: ${task.description}
                    </div>
                    ${task.notes ? `<div class="task-notes">📝 ${task.notes}</div>` : ''}
                    <button class="add-note-btn" data-task="${taskId}">
                        ${task.notes ? 'Edit Note' : 'Add Note'}
                    </button>
                </div>
            </div>
        `;
    }

    renderCanvasView(container) {
        // Simplified canvas view - you can enhance this with actual canvas drawing
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h3>Canvas View</h3>
                <p>This view would show the checklist as an interactive graph/mind map.</p>
                <p>Work in progress - currently showing tree view.</p>
            </div>
        `;
        this.renderTreeView(container); // Fallback to tree view for now
    }

    bindChecklistEvents() {
        // Section headers
        document.querySelectorAll('.section-header.collapsible').forEach(header => {
            header.addEventListener('click', (e) => {
                const sectionIndex = parseInt(header.dataset.section);
                this.toggleSection(sectionIndex);
            });
        });

        // Subsection headers
        document.querySelectorAll('.subsection-header.collapsible').forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const sectionIndex = parseInt(header.dataset.section);
                const subsectionIndex = parseInt(header.dataset.subsection);
                this.toggleSubsection(sectionIndex, subsectionIndex);
            });
        });

        // Task checkboxes
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = checkbox.dataset.task;
                this.toggleTask(taskId, checkbox.checked);
            });
        });

        // Note buttons
        document.querySelectorAll('.add-note-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = button.dataset.task;
                this.showNotesPanel(taskId);
            });
        });
    }

    toggleSection(sectionIndex) {
        this.currentProject.checklist[sectionIndex].expanded = 
            !this.currentProject.checklist[sectionIndex].expanded;
        this.renderChecklist();
    }

    toggleSubsection(sectionIndex, subsectionIndex) {
        this.currentProject.checklist[sectionIndex].subsections[subsectionIndex].expanded = 
            !this.currentProject.checklist[sectionIndex].subsections[subsectionIndex].expanded;
        this.renderChecklist();
    }

    toggleTask(taskId, completed) {
        const [sectionIndex, subsectionIndex, taskIndex] = taskId.split('-').map(Number);
        
        if (taskIndex !== undefined) {
            // Task in subsection
            this.currentProject.checklist[sectionIndex].subsections[subsectionIndex].tasks[taskIndex].completed = completed;
        } else {
            // Task directly in section
            this.currentProject.checklist[sectionIndex].tasks[subsectionIndex].completed = completed;
        }
        
        this.renderChecklist();
    }

    showNotesPanel(taskId) {
        this.currentNoteItem = taskId;
        const [sectionIndex, subsectionIndex, taskIndex] = taskId.split('-').map(Number);
        
        let task;
        if (taskIndex !== undefined) {
            task = this.currentProject.checklist[sectionIndex].subsections[subsectionIndex].tasks[taskIndex];
        } else {
            task = this.currentProject.checklist[sectionIndex].tasks[subsectionIndex];
        }

        document.getElementById('notesEditor').value = task.notes || '';
        document.getElementById('notesPanel').style.display = 'flex';
    }

    hideNotes() {
        document.getElementById('notesPanel').style.display = 'none';
        this.currentNoteItem = null;
    }

    saveNote() {
        if (!this.currentNoteItem) return;

        const note = document.getElementById('notesEditor').value.trim();
        const [sectionIndex, subsectionIndex, taskIndex] = this.currentNoteItem.split('-').map(Number);

        if (taskIndex !== undefined) {
            this.currentProject.checklist[sectionIndex].subsections[subsectionIndex].tasks[taskIndex].notes = note;
        } else {
            this.currentProject.checklist[sectionIndex].tasks[subsectionIndex].notes = note;
        }

        this.renderChecklist();
        this.hideNotes();
    }

    clearNote() {
        document.getElementById('notesEditor').value = '';
    }

    toggleView() {
        this.viewMode = this.viewMode === 'tree' ? 'canvas' : 'tree';
        this.renderChecklist();
    }

    expandAll() {
        this.currentProject.checklist.forEach(section => {
            section.expanded = true;
            if (section.subsections) {
                section.subsections.forEach(subsection => {
                    subsection.expanded = true;
                });
            }
        });
        this.renderChecklist();
    }

    collapseAll() {
        this.currentProject.checklist.forEach(section => {
            section.expanded = false;
            if (section.subsections) {
                section.subsections.forEach(subsection => {
                    subsection.expanded = false;
                });
            }
        });
        this.renderChecklist();
    }

    clearProjectForm() {
        document.getElementById('projectName').value = '';
        document.getElementById('projectUrl').value = '';
        document.getElementById('projectScope').value = 'web';
    }

    showModal() {
        document.getElementById('projectModal').style.display = 'block';
    }

    hideModal() {
        document.getElementById('projectModal').style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BugBountyTracker();
});