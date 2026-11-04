/** HD-XAPI Playground: executed source-qualified record projection, not a SHACL-AF engine. */

const INFERENCE_EXAMPLES = {
    "completed-course": {
        "name": "Completed Course",
        "statement": {
            "@id": "urn:uuid:stmt-001",
            "actor": {
                "name": "Alice Learner",
                "mbox": "mailto:alice@example.org"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/completed",
                "display": {
                    "en": "completed"
                }
            },
            "object": {
                "id": "https://example.org/courses/intro-xapi",
                "definition": {
                    "name": {
                        "en": "Introduction to xAPI"
                    },
                    "type": "http://adlnet.gov/expapi/activities/course"
                }
            },
            "timestamp": "2026-01-07T10:30:00Z"
        }
    },
    "passed-assessment": {
        "name": "Passed Assessment",
        "statement": {
            "@id": "urn:uuid:stmt-002",
            "actor": {
                "name": "Bob Student",
                "mbox": "mailto:bob@example.org"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/passed",
                "display": {
                    "en": "passed"
                }
            },
            "object": {
                "id": "https://example.org/assessments/xapi-cert-exam",
                "definition": {
                    "name": {
                        "en": "xAPI Certification Exam"
                    },
                    "type": "http://adlnet.gov/expapi/activities/assessment",
                    "extensions": {
                        "https://w3id.org/xapi/tla#assessesCompetency": "https://example.org/competencies/xapi-impl"
                    }
                }
            },
            "result": {
                "score": {
                    "scaled": 0.92
                },
                "success": true
            },
            "timestamp": "2026-01-07T14:00:00Z"
        }
    },
    "learning-session": {
        "name": "Learning Session with Registration",
        "statement": {
            "@id": "urn:uuid:stmt-003",
            "actor": {
                "name": "Carol Developer",
                "mbox": "mailto:carol@example.org"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/experienced",
                "display": {
                    "en": "experienced"
                }
            },
            "object": {
                "id": "https://example.org/modules/module-2",
                "definition": {
                    "name": {
                        "en": "Module 2: Advanced Topics"
                    }
                }
            },
            "context": {
                "registration": "reg-uuid-12345",
                "contextActivities": {
                    "parent": [
                        {
                            "id": "https://example.org/courses/advanced-xapi"
                        }
                    ]
                }
            },
            "timestamp": "2026-01-07T09:00:00Z"
        }
    },
    "team-activity": {
        "name": "Team Activity",
        "statement": {
            "@id": "urn:uuid:stmt-004",
            "actor": {
                "objectType": "Group",
                "name": "Project Team Alpha",
                "member": [
                    {
                        "name": "Dave",
                        "mbox": "mailto:dave@example.org"
                    },
                    {
                        "name": "Eve",
                        "mbox": "mailto:eve@example.org"
                    }
                ]
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/completed",
                "display": {
                    "en": "completed"
                }
            },
            "object": {
                "id": "https://example.org/projects/team-exercise",
                "definition": {
                    "name": {
                        "en": "Team Collaboration Exercise"
                    }
                }
            },
            "context": {
                "instructor": {
                    "name": "Professor Smith",
                    "mbox": "mailto:smith@university.edu"
                }
            },
            "timestamp": "2026-01-07T16:00:00Z"
        }
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
async function runInference() {
    const resultsDiv = document.getElementById('inference-results');
    const example = INFERENCE_EXAMPLES[currentInferenceExample];
    if (!resultsDiv || !example) return;
    resultsDiv.textContent = 'Projecting this JSON statement...';
    try {
        const projection = await HDXAPIRecord.project(example.statement);
        const heading = document.createElement('h3');
        heading.textContent = 'Executed HD activity / informational record projection';
        const note = document.createElement('p');
        note.textContent = projection.scope + '. Other SHACL-AF, competency and credential rules are not executed here.';
        const count = document.createElement('p');
        count.textContent = projection.triples.length + ' actual RDF triples; separate activity, record and preserved JSON source.';
        const output = document.createElement('pre');
        output.className = 'turtle-display';
        output.textContent = HDXAPIRecord.serialize(projection, 'turtle', N3);
        resultsDiv.replaceChildren(heading, note, count, output);
    } catch (error) {
        resultsDiv.textContent = 'Projection refused: ' + error.message;
    }
}

/**
 * Clear inference results
 */
function clearInferenceResults() {
    const resultsDiv = document.getElementById('inference-results');
    if (resultsDiv) {
        resultsDiv.innerHTML = '<div class="placeholder"><p>Click "Project record" to execute the bounded JSON-to-RDF adapter</p></div>';
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
