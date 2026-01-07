/**
 * HD-XAPI Playground - Inference Demo
 * Demonstrates SHACL-AF rule inference capabilities
 */

const INFERENCE_EXAMPLES = {
    'completed-course': {
        name: 'Completed Course',
        statement: {
            "@id": "urn:uuid:stmt-001",
            "actor": {
                "name": "Alice Learner",
                "mbox": "mailto:alice@example.org"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/completed",
                "display": { "en": "completed" }
            },
            "object": {
                "id": "https://example.org/courses/intro-xapi",
                "definition": {
                    "name": { "en": "Introduction to xAPI" },
                    "type": "http://adlnet.gov/expapi/activities/course"
                }
            },
            "timestamp": "2026-01-07T10:30:00Z"
        },
        inferences: [
            {
                rule: 'PROV Generation',
                icon: '🔗',
                facts: [
                    '<stmt-001> rdf:type prov:Activity .',
                    '<stmt-001> prov:wasAssociatedWith <mailto:alice@example.org> .',
                    '<stmt-001> prov:used <courses/intro-xapi> .',
                    '<stmt-001> prov:endedAtTime "2026-01-07T10:30:00Z"^^xsd:dateTime .'
                ]
            },
            {
                rule: 'Activity Completion',
                icon: '✅',
                facts: [
                    '<courses/intro-xapi> :hasCompletion [ ',
                    '    :completedBy <mailto:alice@example.org> ;',
                    '    :completedAt "2026-01-07T10:30:00Z"^^xsd:dateTime',
                    '] .'
                ]
            }
        ]
    },
    'passed-assessment': {
        name: 'Passed Assessment',
        statement: {
            "@id": "urn:uuid:stmt-002",
            "actor": {
                "name": "Bob Student",
                "mbox": "mailto:bob@example.org"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/passed",
                "display": { "en": "passed" }
            },
            "object": {
                "id": "https://example.org/assessments/xapi-cert-exam",
                "definition": {
                    "name": { "en": "xAPI Certification Exam" },
                    "type": "http://adlnet.gov/expapi/activities/assessment",
                    "extensions": {
                        "https://w3id.org/xapi/tla#assessesCompetency": "https://example.org/competencies/xapi-impl"
                    }
                }
            },
            "result": {
                "score": { "scaled": 0.92 },
                "success": true
            },
            "timestamp": "2026-01-07T14:00:00Z"
        },
        inferences: [
            {
                rule: 'PROV Generation',
                icon: '🔗',
                facts: [
                    '<stmt-002> rdf:type prov:Activity .',
                    '<stmt-002> prov:wasAssociatedWith <mailto:bob@example.org> .',
                    '<stmt-002> prov:generated <result-002> .'
                ]
            },
            {
                rule: 'Competency Assertion',
                icon: '🏆',
                facts: [
                    '_:assertion rdf:type tla:CompetencyAssertion .',
                    '_:assertion tla:assertsCompetency <competencies/xapi-impl> .',
                    '_:assertion tla:confidenceLevel 0.92 .',
                    '_:assertion prov:wasGeneratedBy <stmt-002> .',
                    '_:assertion prov:wasAttributedTo <mailto:bob@example.org> .'
                ]
            },
            {
                rule: 'Credential Qualification Check',
                icon: '📜',
                facts: [
                    '<mailto:bob@example.org> :qualifiedFor <credentials/xapi-cert> .',
                    '# All required competencies met!'
                ]
            }
        ]
    },
    'learning-session': {
        name: 'Learning Session with Registration',
        statement: {
            "@id": "urn:uuid:stmt-003",
            "actor": {
                "name": "Carol Developer",
                "mbox": "mailto:carol@example.org"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/experienced",
                "display": { "en": "experienced" }
            },
            "object": {
                "id": "https://example.org/modules/module-2",
                "definition": {
                    "name": { "en": "Module 2: Advanced Topics" }
                }
            },
            "context": {
                "registration": "reg-uuid-12345",
                "contextActivities": {
                    "parent": [{
                        "id": "https://example.org/courses/advanced-xapi"
                    }]
                }
            },
            "timestamp": "2026-01-07T09:00:00Z"
        },
        inferences: [
            {
                rule: 'PROV Generation',
                icon: '🔗',
                facts: [
                    '<stmt-003> rdf:type prov:Activity .',
                    '<stmt-003> prov:wasAssociatedWith <mailto:carol@example.org> .',
                    '<stmt-003> prov:used <modules/module-2> .'
                ]
            },
            {
                rule: 'Registration Join',
                icon: '👥',
                facts: [
                    '<stmt-003> :sameRegistration <stmt-003a> .',
                    '<stmt-003> :sameRegistration <stmt-003b> .',
                    '# Links to other statements with reg-uuid-12345'
                ]
            },
            {
                rule: 'Activity Hierarchy',
                icon: '📊',
                facts: [
                    '<modules/module-2> :hasParent <courses/advanced-xapi> .',
                    '<courses/advanced-xapi> :hasChild <modules/module-2> .'
                ]
            }
        ]
    },
    'team-activity': {
        name: 'Team Activity',
        statement: {
            "@id": "urn:uuid:stmt-004",
            "actor": {
                "objectType": "Group",
                "name": "Project Team Alpha",
                "member": [
                    { "name": "Dave", "mbox": "mailto:dave@example.org" },
                    { "name": "Eve", "mbox": "mailto:eve@example.org" }
                ]
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/completed",
                "display": { "en": "completed" }
            },
            "object": {
                "id": "https://example.org/projects/team-exercise",
                "definition": {
                    "name": { "en": "Team Collaboration Exercise" }
                }
            },
            "context": {
                "instructor": {
                    "name": "Professor Smith",
                    "mbox": "mailto:smith@university.edu"
                }
            },
            "timestamp": "2026-01-07T16:00:00Z"
        },
        inferences: [
            {
                rule: 'PROV Generation',
                icon: '🔗',
                facts: [
                    '<stmt-004> rdf:type prov:Activity .',
                    '<stmt-004> prov:wasAssociatedWith _:teamAlpha .',
                    '<stmt-004> prov:used <projects/team-exercise> .'
                ]
            },
            {
                rule: 'Team Member Attribution',
                icon: '👥',
                facts: [
                    '_:teamAlpha foaf:member <mailto:dave@example.org> .',
                    '_:teamAlpha foaf:member <mailto:eve@example.org> .',
                    '<mailto:dave@example.org> :participatedIn <stmt-004> .',
                    '<mailto:eve@example.org> :participatedIn <stmt-004> .'
                ]
            },
            {
                rule: 'Instructor Link',
                icon: '👨‍🏫',
                facts: [
                    '<stmt-004> :hadInstructor <mailto:smith@university.edu> .',
                    '<projects/team-exercise> :taughtBy <mailto:smith@university.edu> .'
                ]
            }
        ]
    }
};

let currentInferenceExample = 'completed-course';

/**
 * Initialize inference demo
 */
function initInference() {
    const select = document.getElementById('inference-example-select');
    const runBtn = document.getElementById('run-inference-btn');

    if (select) {
        select.addEventListener('change', function() {
            currentInferenceExample = this.value;
            displayInferenceInput();
            clearInferenceResults();
        });
    }

    if (runBtn) {
        runBtn.addEventListener('click', runInference);
    }

    // Display initial example
    displayInferenceInput();
}

/**
 * Display the input statement
 */
function displayInferenceInput() {
    const display = document.getElementById('inference-input-display');
    if (!display) return;

    const example = INFERENCE_EXAMPLES[currentInferenceExample];
    if (!example) return;

    display.innerHTML = `<pre class="json-display">${syntaxHighlightJSON(example.statement)}</pre>`;
}

/**
 * Run inference and show results
 */
function runInference() {
    const resultsDiv = document.getElementById('inference-results');
    if (!resultsDiv) return;

    const example = INFERENCE_EXAMPLES[currentInferenceExample];
    if (!example) return;

    // Add animation class
    resultsDiv.innerHTML = '<div class="inference-loading">Running SHACL-AF rules...</div>';

    // Simulate inference processing
    setTimeout(() => {
        let html = '<div class="inference-facts">';

        example.inferences.forEach((inference, idx) => {
            html += `
                <div class="inference-group" style="animation-delay: ${idx * 0.2}s">
                    <div class="inference-rule-header">
                        <span class="rule-icon">${inference.icon}</span>
                        <span class="rule-name">${inference.rule}</span>
                        <span class="badge badge-blue">Generated</span>
                    </div>
                    <div class="inference-triples">
                        <pre class="turtle-display">${inference.facts.join('\n')}</pre>
                    </div>
                </div>
            `;
        });

        html += `
            <div class="inference-summary">
                <div class="summary-stat">
                    <span class="stat-number">${example.inferences.length}</span>
                    <span class="stat-label">Rules Fired</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-number">${example.inferences.reduce((acc, i) => acc + i.facts.length, 0)}</span>
                    <span class="stat-label">Triples Generated</span>
                </div>
            </div>
            <div class="vanilla-warning">
                <strong>⚠️ Vanilla xAPI:</strong> None of these facts would be generated.
                You would need to manually query and compute all relationships.
            </div>
        `;

        html += '</div>';
        resultsDiv.innerHTML = html;
    }, 800);
}

/**
 * Clear inference results
 */
function clearInferenceResults() {
    const resultsDiv = document.getElementById('inference-results');
    if (resultsDiv) {
        resultsDiv.innerHTML = '<div class="placeholder"><p>Click "Run Inference" to see auto-generated facts</p></div>';
    }
}

/**
 * Syntax highlight JSON
 */
function syntaxHighlightJSON(obj) {
    const json = JSON.stringify(obj, null, 2);
    return json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
}
