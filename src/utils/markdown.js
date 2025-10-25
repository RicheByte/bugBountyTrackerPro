// Markdown utility functions

/**
 * Convert Markdown to HTML
 */
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
        return `<ul>${match}</ul>`;
    });
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs if not already in block element
    if (!html.startsWith('<')) {
        html = `<p>${html}</p>`;
    }
    
    return html;
}

/**
 * Convert HTML back to Markdown (simplified)
 */
function htmlToMarkdown(html) {
    if (!html) return '';
    
    let markdown = html;
    
    // Headers
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n');
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n');
    
    // Bold
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    
    // Italic
    markdown = markdown.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    
    // Code blocks
    markdown = markdown.replace(/<pre><code class="language-(\w+)">(.*?)<\/code><\/pre>/gs, '```$1\n$2\n```\n');
    markdown = markdown.replace(/<pre><code>(.*?)<\/code><\/pre>/gs, '```\n$1\n```\n');
    
    // Inline code
    markdown = markdown.replace(/<code>(.*?)<\/code>/gi, '`$1`');
    
    // Links
    markdown = markdown.replace(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    // Lists
    markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, (match, content) => {
        return content.replace(/<li>(.*?)<\/li>/gi, '- $1\n');
    });
    
    // Line breaks and paragraphs
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
    markdown = markdown.replace(/<\/p><p>/gi, '\n\n');
    markdown = markdown.replace(/<\/?p>/gi, '');
    
    // Clean up remaining HTML tags
    markdown = markdown.replace(/<[^>]+>/g, '');
    
    return markdown.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Extract plain text from markdown
 */
function markdownToPlainText(markdown) {
    if (!markdown) return '';
    
    let text = markdown;
    
    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    
    // Remove inline code
    text = text.replace(/`[^`]+`/g, '');
    
    // Remove headers
    text = text.replace(/^#+\s+/gm, '');
    
    // Remove formatting
    text = text.replace(/[*_~`]/g, '');
    
    // Remove links but keep text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // Remove list markers
    text = text.replace(/^[\*\-\+]\s+/gm, '');
    text = text.replace(/^\d+\.\s+/gm, '');
    
    return text.trim();
}

/**
 * Generate table of contents from markdown
 */
function generateTOC(markdown) {
    if (!markdown) return [];
    
    const toc = [];
    const lines = markdown.split('\n');
    
    lines.forEach((line, index) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const title = match[2];
            const id = title.toLowerCase().replace(/[^\w]+/g, '-');
            
            toc.push({
                level,
                title,
                id,
                line: index + 1
            });
        }
    });
    
    return toc;
}

/**
 * Format code with syntax highlighting class
 */
function highlightCode(code, language) {
    return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        markdownToHtml,
        htmlToMarkdown,
        escapeHtml,
        sanitizeHtml,
        markdownToPlainText,
        generateTOC,
        highlightCode
    };
}
