// Export utilities for PDF, Markdown, and other formats

/**
 * Export writeup to Markdown format
 */
function exportWriteupToMarkdown(writeup) {
    let markdown = `# ${writeup.title}\n\n`;
    markdown += `**Severity:** ${writeup.severity.toUpperCase()}  \n`;
    markdown += `**CVSS Score:** ${writeup.cvss}  \n`;
    markdown += `**Type:** ${writeup.type}  \n`;
    markdown += `**Status:** ${writeup.status}  \n`;
    markdown += `**Date:** ${new Date(writeup.createdAt).toLocaleDateString()}  \n\n`;
    
    markdown += `---\n\n`;
    
    markdown += `## Summary\n\n${writeup.content.summary}\n\n`;
    
    markdown += `## Steps to Reproduce\n\n`;
    writeup.content.steps.forEach((step, i) => {
        markdown += `${i + 1}. ${step}\n`;
    });
    markdown += `\n`;
    
    markdown += `## Proof of Concept\n\n`;
    markdown += `${writeup.content.poc}\n\n`;
    
    markdown += `## Impact\n\n${writeup.content.impact}\n\n`;
    
    markdown += `## Remediation\n\n${writeup.content.remediation}\n\n`;
    
    if (writeup.content.references && writeup.content.references.length > 0) {
        markdown += `## References\n\n`;
        writeup.content.references.forEach(ref => {
            markdown += `- ${ref}\n`;
        });
        markdown += `\n`;
    }
    
    return markdown;
}

/**
 * Export workflow to Markdown format
 */
function exportWorkflowToMarkdown(workflow) {
    let markdown = `# ${workflow.name}\n\n`;
    markdown += `${workflow.description}\n\n`;
    markdown += `**Created:** ${new Date(workflow.createdAt).toLocaleDateString()}\n\n`;
    
    markdown += `---\n\n`;
    
    workflow.steps.forEach((step, index) => {
        markdown += `## Step ${index + 1}: ${step.title}\n\n`;
        markdown += `**Type:** ${step.type}\n`;
        markdown += `**Status:** ${step.completed ? '✅ Completed' : '⏳ Pending'}\n\n`;
        
        if (step.description) {
            markdown += `${step.description}\n\n`;
        }
        
        if (step.command) {
            markdown += `**Command:**\n\`\`\`bash\n${step.command}\n\`\`\`\n\n`;
        }
        
        if (step.tools && step.tools.length > 0) {
            markdown += `**Tools:** ${step.tools.join(', ')}\n\n`;
        }
        
        if (step.checklist && step.checklist.length > 0) {
            markdown += `**Checklist:**\n`;
            step.checklist.forEach(item => {
                markdown += `- ${item}\n`;
            });
            markdown += `\n`;
        }
        
        if (step.notes) {
            markdown += `**Notes:** ${step.notes}\n\n`;
        }
        
        markdown += `---\n\n`;
    });
    
    return markdown;
}

/**
 * Export project to JSON
 */
function exportProjectToJSON(project) {
    return JSON.stringify(project, null, 2);
}

/**
 * Export entire project as ZIP (requires additional library)
 */
async function exportProjectAsZip(project) {
    // This would require JSZip library
    // Placeholder for future implementation
    console.log('ZIP export not yet implemented');
    return null;
}

/**
 * Download file
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export writeup as file
 */
function downloadWriteup(writeup, format = 'markdown') {
    const content = exportWriteupToMarkdown(writeup);
    const filename = `${writeup.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    downloadFile(content, filename, 'text/markdown');
}

/**
 * Export workflow as file
 */
function downloadWorkflow(workflow, format = 'markdown') {
    const content = format === 'json' 
        ? JSON.stringify(workflow, null, 2)
        : exportWorkflowToMarkdown(workflow);
    
    const extension = format === 'json' ? 'json' : 'md';
    const mimeType = format === 'json' ? 'application/json' : 'text/markdown';
    const filename = `${workflow.name.replace(/[^a-z0-9]/gi, '_')}.${extension}`;
    
    downloadFile(content, filename, mimeType);
}

/**
 * Export all writeups from project
 */
function exportAllWriteups(project) {
    if (!project.writeups || project.writeups.length === 0) {
        alert('No writeups to export');
        return;
    }
    
    let combined = `# ${project.name} - All Writeups\n\n`;
    combined += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    combined += `---\n\n`;
    
    project.writeups.forEach((writeup, index) => {
        combined += exportWriteupToMarkdown(writeup);
        if (index < project.writeups.length - 1) {
            combined += `\n\n---\n\n`;
        }
    });
    
    const filename = `${project.name}_all_writeups.md`;
    downloadFile(combined, filename, 'text/markdown');
}

/**
 * Generate project summary
 */
function generateProjectSummary(project) {
    let summary = `# ${project.name} - Project Summary\n\n`;
    summary += `**Target:** ${project.url}\n`;
    summary += `**Scope:** ${project.scope}\n`;
    summary += `**Created:** ${new Date(project.createdAt).toLocaleDateString()}\n\n`;
    
    summary += `---\n\n`;
    
    // Checklist progress
    summary += `## Testing Progress\n\n`;
    const totalSections = project.checklist ? project.checklist.length : 0;
    let completedSections = 0;
    
    if (project.checklist) {
        project.checklist.forEach(section => {
            const total = countTasks(section);
            const completed = countCompletedTasks(section);
            const progress = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
            
            summary += `- **${section.title}:** ${completed}/${total} tasks (${progress}%)\n`;
            
            if (completed === total) completedSections++;
        });
    }
    
    summary += `\n**Overall:** ${completedSections}/${totalSections} sections completed\n\n`;
    
    // Writeups
    if (project.writeups && project.writeups.length > 0) {
        summary += `## Vulnerabilities Found (${project.writeups.length})\n\n`;
        
        const bySeverity = {
            critical: [],
            high: [],
            medium: [],
            low: [],
            info: []
        };
        
        project.writeups.forEach(writeup => {
            bySeverity[writeup.severity].push(writeup);
        });
        
        ['critical', 'high', 'medium', 'low', 'info'].forEach(severity => {
            if (bySeverity[severity].length > 0) {
                summary += `### ${severity.toUpperCase()} (${bySeverity[severity].length})\n\n`;
                bySeverity[severity].forEach(writeup => {
                    summary += `- ${writeup.title} (${writeup.type})\n`;
                });
                summary += `\n`;
            }
        });
    }
    
    // Workflows
    if (project.workflows && project.workflows.length > 0) {
        summary += `## Workflows (${project.workflows.length})\n\n`;
        project.workflows.forEach(workflow => {
            const totalSteps = workflow.steps.length;
            const completedSteps = workflow.steps.filter(s => s.completed).length;
            summary += `- **${workflow.name}:** ${completedSteps}/${totalSteps} steps completed\n`;
        });
        summary += `\n`;
    }
    
    return summary;
}

/**
 * Export project summary
 */
function exportProjectSummary(project) {
    const summary = generateProjectSummary(project);
    const filename = `${project.name}_summary.md`;
    downloadFile(summary, filename, 'text/markdown');
}

/**
 * Helper function to count tasks
 */
function countTasks(section) {
    let count = section.tasks ? section.tasks.length : 0;
    if (section.subsections) {
        section.subsections.forEach(subsection => {
            count += subsection.tasks.length;
        });
    }
    return count;
}

/**
 * Helper function to count completed tasks
 */
function countCompletedTasks(section) {
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

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        exportWriteupToMarkdown,
        exportWorkflowToMarkdown,
        exportProjectToJSON,
        downloadFile,
        downloadWriteup,
        downloadWorkflow,
        exportAllWriteups,
        generateProjectSummary,
        exportProjectSummary
    };
}
