// CVSS 3.1 Calculator Component

class CVSSCalculator {
    constructor() {
        this.metrics = {
            // Base Metrics
            AV: null, // Attack Vector
            AC: null, // Attack Complexity
            PR: null, // Privileges Required
            UI: null, // User Interaction
            S: null,  // Scope
            C: null,  // Confidentiality
            I: null,  // Integrity
            A: null   // Availability
        };
        
        this.metricDefinitions = {
            AV: {
                name: 'Attack Vector',
                values: {
                    N: { name: 'Network', value: 0.85, description: 'Exploitable remotely' },
                    A: { name: 'Adjacent', value: 0.62, description: 'Local network access required' },
                    L: { name: 'Local', value: 0.55, description: 'Local access required' },
                    P: { name: 'Physical', value: 0.2, description: 'Physical access required' }
                }
            },
            AC: {
                name: 'Attack Complexity',
                values: {
                    L: { name: 'Low', value: 0.77, description: 'No special conditions' },
                    H: { name: 'High', value: 0.44, description: 'Special conditions required' }
                }
            },
            PR: {
                name: 'Privileges Required',
                values: {
                    N: { name: 'None', value: { unchanged: 0.85, changed: 0.85 }, description: 'No privileges needed' },
                    L: { name: 'Low', value: { unchanged: 0.62, changed: 0.68 }, description: 'Basic user privileges' },
                    H: { name: 'High', value: { unchanged: 0.27, changed: 0.50 }, description: 'Admin privileges required' }
                }
            },
            UI: {
                name: 'User Interaction',
                values: {
                    N: { name: 'None', value: 0.85, description: 'No user interaction needed' },
                    R: { name: 'Required', value: 0.62, description: 'User must take action' }
                }
            },
            S: {
                name: 'Scope',
                values: {
                    U: { name: 'Unchanged', value: false, description: 'Impacts only vulnerable component' },
                    C: { name: 'Changed', value: true, description: 'Impacts beyond vulnerable component' }
                }
            },
            C: {
                name: 'Confidentiality',
                values: {
                    N: { name: 'None', value: 0, description: 'No information disclosure' },
                    L: { name: 'Low', value: 0.22, description: 'Limited information disclosure' },
                    H: { name: 'High', value: 0.56, description: 'Total information disclosure' }
                }
            },
            I: {
                name: 'Integrity',
                values: {
                    N: { name: 'None', value: 0, description: 'No integrity impact' },
                    L: { name: 'Low', value: 0.22, description: 'Limited modification possible' },
                    H: { name: 'High', value: 0.56, description: 'Total compromise possible' }
                }
            },
            A: {
                name: 'Availability',
                values: {
                    N: { name: 'None', value: 0, description: 'No availability impact' },
                    L: { name: 'Low', value: 0.22, description: 'Reduced performance' },
                    H: { name: 'High', value: 0.56, description: 'Total shutdown possible' }
                }
            }
        };
    }

    /**
     * Set a metric value
     */
    setMetric(metric, value) {
        if (this.metricDefinitions[metric] && this.metricDefinitions[metric].values[value]) {
            this.metrics[metric] = value;
        }
    }

    /**
     * Calculate CVSS Base Score
     */
    calculateScore() {
        // Check if all metrics are set
        for (const metric in this.metrics) {
            if (this.metrics[metric] === null) {
                return null; // Not all metrics set
            }
        }

        const scopeChanged = this.metrics.S === 'C';
        
        // Get values
        const av = this.metricDefinitions.AV.values[this.metrics.AV].value;
        const ac = this.metricDefinitions.AC.values[this.metrics.AC].value;
        const pr = typeof this.metricDefinitions.PR.values[this.metrics.PR].value === 'object'
            ? this.metricDefinitions.PR.values[this.metrics.PR].value[scopeChanged ? 'changed' : 'unchanged']
            : this.metricDefinitions.PR.values[this.metrics.PR].value;
        const ui = this.metricDefinitions.UI.values[this.metrics.UI].value;
        const c = this.metricDefinitions.C.values[this.metrics.C].value;
        const i = this.metricDefinitions.I.values[this.metrics.I].value;
        const a = this.metricDefinitions.A.values[this.metrics.A].value;

        // Calculate Impact
        const iscBase = 1 - ((1 - c) * (1 - i) * (1 - a));
        
        let impact;
        if (scopeChanged) {
            impact = 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.02, 15);
        } else {
            impact = 6.42 * iscBase;
        }

        // Calculate Exploitability
        const exploitability = 8.22 * av * ac * pr * ui;

        // Calculate Base Score
        let baseScore;
        if (impact <= 0) {
            baseScore = 0;
        } else {
            if (scopeChanged) {
                baseScore = Math.min(1.08 * (impact + exploitability), 10);
            } else {
                baseScore = Math.min(impact + exploitability, 10);
            }
        }

        // Round up to one decimal
        return Math.ceil(baseScore * 10) / 10;
    }

    /**
     * Get severity rating from score
     */
    getSeverity(score) {
        if (score === 0) return 'None';
        if (score < 4.0) return 'low';
        if (score < 7.0) return 'medium';
        if (score < 9.0) return 'high';
        return 'critical';
    }

    /**
     * Get CVSS vector string
     */
    getVector() {
        const vector = `CVSS:3.1/AV:${this.metrics.AV}/AC:${this.metrics.AC}/PR:${this.metrics.PR}/UI:${this.metrics.UI}/S:${this.metrics.S}/C:${this.metrics.C}/I:${this.metrics.I}/A:${this.metrics.A}`;
        return vector;
    }

    /**
     * Parse CVSS vector string
     */
    parseVector(vectorString) {
        const parts = vectorString.split('/');
        
        if (!parts[0].startsWith('CVSS:3.')) {
            throw new Error('Invalid CVSS version');
        }

        for (let i = 1; i < parts.length; i++) {
            const [metric, value] = parts[i].split(':');
            this.setMetric(metric, value);
        }

        return this.calculateScore();
    }

    /**
     * Render calculator UI
     */
    renderUI(container) {
        const html = `
            <div class="cvss-calculator">
                <div class="cvss-header">
                    <h4>CVSS 3.1 Calculator</h4>
                    <div class="cvss-score-display">
                        <div class="score-value" id="cvssScoreValue">-</div>
                        <div class="score-severity" id="cvssSeverity">Not Rated</div>
                    </div>
                </div>

                <div class="cvss-metrics">
                    ${this.renderMetricGroup('AV')}
                    ${this.renderMetricGroup('AC')}
                    ${this.renderMetricGroup('PR')}
                    ${this.renderMetricGroup('UI')}
                    ${this.renderMetricGroup('S')}
                    ${this.renderMetricGroup('C')}
                    ${this.renderMetricGroup('I')}
                    ${this.renderMetricGroup('A')}
                </div>

                <div class="cvss-vector">
                    <label>Vector String:</label>
                    <input type="text" id="cvssVector" readonly class="form-input">
                    <button id="copyCvssVector" class="btn btn-outline btn-sm">Copy</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.bindEvents(container);
    }

    /**
     * Render a single metric group
     */
    renderMetricGroup(metric) {
        const def = this.metricDefinitions[metric];
        
        let html = `
            <div class="metric-group">
                <label class="metric-label">${def.name}</label>
                <div class="metric-buttons">
        `;

        for (const [key, value] of Object.entries(def.values)) {
            html += `
                <button class="metric-btn" 
                        data-metric="${metric}" 
                        data-value="${key}"
                        title="${value.description}">
                    ${value.name}
                </button>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Bind events to calculator UI
     */
    bindEvents(container) {
        const buttons = container.querySelectorAll('.metric-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const metric = btn.dataset.metric;
                const value = btn.dataset.value;

                // Update active state
                const group = btn.parentElement;
                group.querySelectorAll('.metric-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Set metric and recalculate
                this.setMetric(metric, value);
                this.updateDisplay(container);
            });
        });

        const copyBtn = container.querySelector('#copyCvssVector');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const vectorInput = container.querySelector('#cvssVector');
                vectorInput.select();
                document.execCommand('copy');
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            });
        }
    }

    /**
     * Update score display
     */
    updateDisplay(container) {
        const score = this.calculateScore();
        const scoreDisplay = container.querySelector('#cvssScoreValue');
        const severityDisplay = container.querySelector('#cvssSeverity');
        const vectorInput = container.querySelector('#cvssVector');

        if (score !== null) {
            scoreDisplay.textContent = score.toFixed(1);
            const severity = this.getSeverity(score);
            severityDisplay.textContent = severity.toUpperCase();
            severityDisplay.className = `score-severity severity-${severity}`;
            vectorInput.value = this.getVector();
        } else {
            scoreDisplay.textContent = '-';
            severityDisplay.textContent = 'Not Rated';
            severityDisplay.className = 'score-severity';
            vectorInput.value = '';
        }
    }

    /**
     * Reset calculator
     */
    reset() {
        for (const metric in this.metrics) {
            this.metrics[metric] = null;
        }
    }

    /**
     * Get current data
     */
    getData() {
        const score = this.calculateScore();
        return {
            score,
            severity: score !== null ? this.getSeverity(score) : null,
            vector: score !== null ? this.getVector() : null,
            metrics: { ...this.metrics }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CVSSCalculator;
}
