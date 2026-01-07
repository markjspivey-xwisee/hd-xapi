/**
 * HD-XAPI Playground - Main Application
 */

let editor;
let currentRDFFormat = 'turtle';
let currentRDFOutput = {};

/**
 * Initialize the playground
 */
document.addEventListener('DOMContentLoaded', function() {
    initEditor();
    initTabs();
    initExamples();
    initExplorer();
    initModal();
    initButtons();

    // Initialize new demo features
    if (typeof initInference === 'function') initInference();
    if (typeof initSPARQL === 'function') initSPARQL();
    if (typeof initCompare === 'function') initCompare();
    if (typeof initAnonymize === 'function') initAnonymize();
    if (typeof initGraph === 'function') initGraph();
});

/**
 * Initialize CodeMirror editor
 */
function initEditor() {
    const textarea = document.getElementById('statement-editor');
    editor = CodeMirror.fromTextArea(textarea, {
        mode: 'application/json',
        theme: 'dracula',
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        tabSize: 2,
        indentWithTabs: false,
        lineWrapping: true
    });

    // Set default content
    editor.setValue(JSON.stringify(EXAMPLES['simple-completed'].statement, null, 2));
}

/**
 * Initialize tab navigation
 */
function initTabs() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');

            // Update nav
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Update content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

/**
 * Initialize examples
 */
function initExamples() {
    // Populate example select dropdown
    const select = document.getElementById('example-select');
    select.addEventListener('change', function() {
        if (this.value) {
            const json = getExampleJSON(this.value);
            editor.setValue(json);
            this.value = '';
        }
    });

    // Populate examples grid
    const grid = document.getElementById('examples-grid');
    const examples = getExamplesArray();

    examples.forEach(example => {
        const card = document.createElement('div');
        card.className = 'example-card';
        card.innerHTML = `
            <h3>
                ${example.name}
                <span class="example-tag ${example.tag}">${example.tag}</span>
            </h3>
            <p>${example.description}</p>
            <div class="example-preview">${truncateJSON(example.statement)}</div>
        `;

        card.addEventListener('click', function() {
            // Switch to validator tab
            document.querySelector('.nav-link[data-tab="validator"]').click();
            // Load example
            editor.setValue(JSON.stringify(example.statement, null, 2));
        });

        grid.appendChild(card);
    });
}

/**
 * Truncate JSON for preview
 */
function truncateJSON(obj) {
    const str = JSON.stringify(obj, null, 2);
    const lines = str.split('\n').slice(0, 5);
    return lines.join('\n') + (str.split('\n').length > 5 ? '\n  ...' : '');
}

/**
 * Initialize ontology explorer
 */
function initExplorer() {
    const tree = document.getElementById('class-tree');
    const details = document.getElementById('class-details');

    // Add core classes
    const coreClasses = getClassNames();
    const tlaClasses = getTLAClassNames();

    // Core classes section
    const coreHeader = document.createElement('div');
    coreHeader.className = 'tree-header';
    coreHeader.innerHTML = '<strong>Core xAPI</strong>';
    tree.appendChild(coreHeader);

    coreClasses.forEach(className => {
        const item = createClassItem(className, false);
        tree.appendChild(item);
    });

    // TLA classes section
    const tlaHeader = document.createElement('div');
    tlaHeader.className = 'tree-header';
    tlaHeader.innerHTML = '<strong style="color: var(--accent-purple);">TLA Extension</strong>';
    tlaHeader.style.marginTop = '16px';
    tree.appendChild(tlaHeader);

    tlaClasses.forEach(className => {
        const item = createClassItem(className, true);
        tree.appendChild(item);
    });

    function createClassItem(className, isTLA) {
        const item = document.createElement('div');
        item.className = 'class-item';
        item.innerHTML = `<span class="class-icon">${isTLA ? '&#9733;' : '&#9679;'}</span> ${className}`;

        item.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.class-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Show details
            showClassDetails(className);
        });

        return item;
    }

    function showClassDetails(className) {
        const classData = getClassDetails(className);
        if (!classData) {
            details.innerHTML = '<div class="placeholder"><p>Class not found</p></div>';
            return;
        }

        let html = `
            <h2>${classData.label}</h2>
            <p class="class-description">${classData.description}</p>
        `;

        if (classData.superClass) {
            html += `
                <div class="class-section">
                    <h3>Inherits From</h3>
                    <p><code>${classData.superClass}</code></p>
                </div>
            `;
        }

        if (classData.subClasses && classData.subClasses.length > 0) {
            html += `
                <div class="class-section">
                    <h3>Subclasses</h3>
                    <p>${classData.subClasses.map(c => `<code>${c}</code>`).join(', ')}</p>
                </div>
            `;
        }

        if (classData.properties && classData.properties.length > 0) {
            html += `
                <div class="class-section">
                    <h3>Properties</h3>
                    <ul class="property-list">
                        ${classData.properties.map(prop => `
                            <li class="property-item">
                                <span class="property-name">${prop.name}</span>
                                <span class="property-type">${prop.type}</span>
                                ${prop.required ? '<span class="property-required">required</span>' : ''}
                                <p class="property-description">${prop.description}</p>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (classData.constraints && classData.constraints.length > 0) {
            html += `
                <div class="class-section">
                    <h3>Constraints (SHACL)</h3>
                    <ul>
                        ${classData.constraints.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        details.innerHTML = html;
    }
}

/**
 * Initialize modal
 */
function initModal() {
    const modal = document.getElementById('rdf-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const formatTabs = modal.querySelectorAll('.format-tab');
    const copyBtn = document.getElementById('copy-rdf-btn');

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    formatTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            formatTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentRDFFormat = this.getAttribute('data-format');
            updateRDFOutput();
        });
    });

    copyBtn.addEventListener('click', function() {
        const output = document.getElementById('rdf-output').textContent;
        navigator.clipboard.writeText(output).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
            }, 2000);
        });
    });
}

/**
 * Initialize buttons
 */
function initButtons() {
    // Validate button
    document.getElementById('validate-btn').addEventListener('click', validateStatement);

    // Convert to RDF button
    document.getElementById('convert-rdf-btn').addEventListener('click', convertToRDF);

    // Format button
    document.getElementById('format-btn').addEventListener('click', function() {
        try {
            const json = JSON.parse(editor.getValue());
            editor.setValue(JSON.stringify(json, null, 2));
        } catch (e) {
            showError('Invalid JSON: ' + e.message);
        }
    });

    // Clear button
    document.getElementById('clear-btn').addEventListener('click', function() {
        editor.setValue('{\n  \n}');
        clearResults();
    });
}

/**
 * Validate the current statement
 */
function validateStatement() {
    const resultsContent = document.getElementById('results-content');
    const statusBadge = document.getElementById('validation-status');

    let statement;
    try {
        statement = JSON.parse(editor.getValue());
    } catch (e) {
        showError('Invalid JSON: ' + e.message);
        return;
    }

    const result = Validator.validate(statement);

    if (result.isValid) {
        statusBadge.className = 'status-badge valid';
        statusBadge.textContent = 'Valid';

        resultsContent.innerHTML = `
            <div class="validation-result">
                <div class="validation-summary valid">
                    <h3><span class="icon">&#10003;</span> Statement is Valid</h3>
                    <p>The statement passes all structural validation checks.</p>
                </div>
                ${result.violations.length > 0 ? `
                    <h4>Warnings (${result.violations.length})</h4>
                    <ul class="violation-list">
                        ${result.violations.map(v => `
                            <li class="violation-item warning">
                                <div class="violation-path">${v.path}</div>
                                <div class="violation-message">${v.message}</div>
                                ${v.value ? `<div class="violation-value">Value: ${v.value}</div>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}
                <div class="mt-md">
                    <h4>Inferred Properties</h4>
                    <p class="text-muted">With SHACL-AF rules, the following would be generated:</p>
                    <ul>
                        <li>PROV Activity link (prov:Activity)</li>
                        ${statement.context?.registration ? '<li>Registration group membership</li>' : ''}
                        ${statement.result?.success ? '<li>Competency assertion (if assessment)</li>' : ''}
                    </ul>
                </div>
            </div>
        `;
    } else {
        statusBadge.className = 'status-badge invalid';
        statusBadge.textContent = 'Invalid';

        const violations = result.violations.filter(v => v.severity === 'violation');
        const warnings = result.violations.filter(v => v.severity === 'warning');

        resultsContent.innerHTML = `
            <div class="validation-result">
                <div class="validation-summary invalid">
                    <h3><span class="icon">&#10007;</span> Statement is Invalid</h3>
                    <p>${violations.length} violation(s) found</p>
                </div>
                <h4>Violations</h4>
                <ul class="violation-list">
                    ${violations.map(v => `
                        <li class="violation-item">
                            <div class="violation-path">${v.path}</div>
                            <div class="violation-message">${v.message}</div>
                            ${v.value !== undefined ? `<div class="violation-value">Value: ${JSON.stringify(v.value)}</div>` : ''}
                        </li>
                    `).join('')}
                </ul>
                ${warnings.length > 0 ? `
                    <h4>Warnings</h4>
                    <ul class="violation-list">
                        ${warnings.map(v => `
                            <li class="violation-item warning">
                                <div class="violation-path">${v.path}</div>
                                <div class="violation-message">${v.message}</div>
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
    }
}

/**
 * Convert statement to RDF
 */
function convertToRDF() {
    let statement;
    try {
        statement = JSON.parse(editor.getValue());
    } catch (e) {
        showError('Invalid JSON: ' + e.message);
        return;
    }

    // Generate all formats
    currentRDFOutput = {
        turtle: statementToTurtle(statement),
        ntriples: statementToNTriples(statement),
        jsonld: JSON.stringify(statement, null, 2)
    };

    // Show modal
    const modal = document.getElementById('rdf-modal');
    modal.classList.add('active');
    updateRDFOutput();
}

/**
 * Update RDF output display
 */
function updateRDFOutput() {
    const output = document.getElementById('rdf-output');
    output.textContent = currentRDFOutput[currentRDFFormat] || 'No output available';
}

/**
 * Show error message
 */
function showError(message) {
    const statusBadge = document.getElementById('validation-status');
    const resultsContent = document.getElementById('results-content');

    statusBadge.className = 'status-badge error';
    statusBadge.textContent = 'Error';

    resultsContent.innerHTML = `
        <div class="validation-result">
            <div class="validation-summary invalid">
                <h3><span class="icon">&#9888;</span> Error</h3>
                <p>${message}</p>
            </div>
        </div>
    `;
}

/**
 * Clear results
 */
function clearResults() {
    const statusBadge = document.getElementById('validation-status');
    const resultsContent = document.getElementById('results-content');

    statusBadge.className = 'status-badge';
    statusBadge.textContent = '';

    resultsContent.innerHTML = `
        <div class="placeholder">
            <div class="placeholder-icon">&#9998;</div>
            <p>Enter an xAPI statement and click "Validate" to check it against SHACL shapes.</p>
        </div>
    `;
}
