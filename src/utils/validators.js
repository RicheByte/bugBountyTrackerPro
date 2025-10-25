// Validation utilities for user input

/**
 * Validate email format
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate project name
 */
function isValidProjectName(name) {
    return name && name.trim().length >= 3 && name.trim().length <= 100;
}

/**
 * Validate CVSS score
 */
function isValidCVSS(score) {
    return typeof score === 'number' && score >= 0 && score <= 10;
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Validate writeup data
 */
function validateWriteup(writeup) {
    const errors = [];
    
    if (!writeup.title || writeup.title.trim().length < 5) {
        errors.push('Title must be at least 5 characters');
    }
    
    if (!writeup.type || writeup.type.trim().length === 0) {
        errors.push('Vulnerability type is required');
    }
    
    if (!['critical', 'high', 'medium', 'low', 'info'].includes(writeup.severity)) {
        errors.push('Invalid severity level');
    }
    
    if (!isValidCVSS(writeup.cvss)) {
        errors.push('CVSS score must be between 0 and 10');
    }
    
    if (!writeup.content || !writeup.content.summary) {
        errors.push('Summary is required');
    }
    
    if (!writeup.content || !writeup.content.steps || writeup.content.steps.length === 0) {
        errors.push('At least one reproduction step is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate workflow data
 */
function validateWorkflow(workflow) {
    const errors = [];
    
    if (!workflow.name || workflow.name.trim().length < 3) {
        errors.push('Workflow name must be at least 3 characters');
    }
    
    if (!workflow.description || workflow.description.trim().length < 10) {
        errors.push('Description must be at least 10 characters');
    }
    
    if (!workflow.steps || workflow.steps.length === 0) {
        errors.push('Workflow must have at least one step');
    }
    
    if (workflow.steps) {
        workflow.steps.forEach((step, index) => {
            if (!step.title || step.title.trim().length < 3) {
                errors.push(`Step ${index + 1}: Title must be at least 3 characters`);
            }
            
            if (step.type === 'command' && !step.command) {
                errors.push(`Step ${index + 1}: Command is required for command-type steps`);
            }
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate file upload
 */
function validateFileUpload(file, maxSize = 5 * 1024 * 1024, allowedTypes = []) {
    const errors = [];
    
    if (file.size > maxSize) {
        errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }
    
    if (allowedTypes.length > 0) {
        const fileType = file.type;
        const fileExt = file.name.split('.').pop().toLowerCase();
        
        const isAllowed = allowedTypes.some(type => {
            if (type.startsWith('.')) {
                return fileExt === type.substring(1);
            }
            return fileType.startsWith(type);
        });
        
        if (!isAllowed) {
            errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate CVSS vector string
 */
function validateCVSSVector(vector) {
    // Basic CVSS 3.x vector format validation
    const regex = /^CVSS:3\.[01]\/AV:[NALP]\/AC:[LH]\/PR:[NLH]\/UI:[NR]\/S:[UC]\/C:[NLH]\/I:[NLH]\/A:[NLH]$/;
    return regex.test(vector);
}

/**
 * Escape special characters for regex
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate tag name
 */
function isValidTag(tag) {
    return tag && 
           tag.trim().length >= 2 && 
           tag.trim().length <= 30 && 
           /^[a-zA-Z0-9-_]+$/.test(tag.trim());
}

/**
 * Validate note content
 */
function validateNote(note) {
    const errors = [];
    
    if (!note.content || note.content.trim().length === 0) {
        errors.push('Note content cannot be empty');
    }
    
    if (note.content && note.content.length > 50000) {
        errors.push('Note content too long (max 50,000 characters)');
    }
    
    if (note.tags) {
        note.tags.forEach((tag, index) => {
            if (!isValidTag(tag)) {
                errors.push(`Invalid tag at position ${index + 1}: ${tag}`);
            }
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Check for SQL injection patterns (basic)
 */
function containsSQLInjection(input) {
    const patterns = [
        /(\bUNION\b.*\bSELECT\b)/i,
        /(\bINSERT\b.*\bINTO\b)/i,
        /(\bDELETE\b.*\bFROM\b)/i,
        /(\bDROP\b.*\bTABLE\b)/i,
        /(\bEXEC\b.*\()/i,
        /(;.*--)/,
        /('.*OR.*'.*=.*')/i
    ];
    
    return patterns.some(pattern => pattern.test(input));
}

/**
 * Check for XSS patterns (basic)
 */
function containsXSS(input) {
    const patterns = [
        /<script[^>]*>.*<\/script>/i,
        /on\w+\s*=\s*["']?[^"'>]*/i,
        /<iframe[^>]*>/i,
        /javascript:/i,
        /<embed[^>]*>/i,
        /<object[^>]*>/i
    ];
    
    return patterns.some(pattern => pattern.test(input));
}

/**
 * Validate and sanitize user input
 */
function validateAndSanitize(input, options = {}) {
    const {
        maxLength = 1000,
        minLength = 0,
        allowHTML = false,
        checkSQLInjection = true,
        checkXSS = true
    } = options;
    
    const errors = [];
    
    if (typeof input !== 'string') {
        errors.push('Input must be a string');
        return { isValid: false, errors, sanitized: '' };
    }
    
    if (input.length < minLength) {
        errors.push(`Input must be at least ${minLength} characters`);
    }
    
    if (input.length > maxLength) {
        errors.push(`Input must be at most ${maxLength} characters`);
    }
    
    if (checkSQLInjection && containsSQLInjection(input)) {
        errors.push('Input contains potential SQL injection patterns');
    }
    
    if (checkXSS && containsXSS(input)) {
        errors.push('Input contains potential XSS patterns');
    }
    
    const sanitized = allowHTML ? input : sanitizeInput(input);
    
    return {
        isValid: errors.length === 0,
        errors,
        sanitized
    };
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        isValidUrl,
        isValidProjectName,
        isValidCVSS,
        sanitizeInput,
        validateWriteup,
        validateWorkflow,
        validateFileUpload,
        validateCVSSVector,
        escapeRegex,
        isValidTag,
        validateNote,
        containsSQLInjection,
        containsXSS,
        validateAndSanitize
    };
}
