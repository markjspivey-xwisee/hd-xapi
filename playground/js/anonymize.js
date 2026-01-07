/**
 * HD-XAPI Playground - Anonymization Demo
 * Shows ODRL policy-based anonymization at export boundaries
 */

const ANONYMIZATION_POLICIES = {
    'research-export': {
        name: 'Research Export',
        description: 'Anonymize data for research purposes - removes PII while preserving learning analytics value',
        policy: `@prefix odrl: <http://www.w3.org/ns/odrl/2/> .
@prefix xapi: <https://w3id.org/xapi/ontology#> .
@prefix : <https://example.org/policies#> .

:ResearchExportPolicy a odrl:Policy ;
    odrl:profile <https://w3id.org/xapi/odrl-profile> ;
    odrl:permission [
        odrl:action odrl:distribute ;
        odrl:target xapi:Statement ;
        odrl:duty [
            odrl:action :anonymize ;
            odrl:target xapi:actor ;
            :method :hashPII
        ] ,
        [
            odrl:action :removeField ;
            odrl:target xapi:context/xapi:instructor
        ]
    ] .`,
        transforms: [
            { field: 'actor.mbox', action: 'Hash with salt', result: 'sha256:a8f5f167...' },
            { field: 'actor.name', action: 'Remove', result: '(removed)' },
            { field: 'context.instructor', action: 'Remove entirely', result: '(removed)' },
            { field: 'All other fields', action: 'Preserve', result: '(unchanged)' }
        ]
    },
    'gdpr-export': {
        name: 'GDPR Compliance',
        description: 'Full GDPR-compliant export with pseudonymization and right to erasure support',
        policy: `@prefix odrl: <http://www.w3.org/ns/odrl/2/> .
@prefix xapi: <https://w3id.org/xapi/ontology#> .
@prefix : <https://example.org/policies#> .

:GDPRCompliancePolicy a odrl:Policy ;
    odrl:profile <https://w3id.org/xapi/odrl-profile> ;
    odrl:permission [
        odrl:action odrl:distribute ;
        odrl:target xapi:Statement ;
        odrl:constraint [
            odrl:leftOperand :dataSubjectConsent ;
            odrl:operator odrl:eq ;
            odrl:rightOperand true
        ] ;
        odrl:duty [
            odrl:action :pseudonymize ;
            odrl:target xapi:actor ;
            :method :reversibleEncryption ;
            :keyManagement :separateController
        ]
    ] ;
    odrl:prohibition [
        odrl:action odrl:distribute ;
        odrl:target xapi:Statement ;
        odrl:constraint [
            odrl:leftOperand :erasureRequested ;
            odrl:operator odrl:eq ;
            odrl:rightOperand true
        ]
    ] .`,
        transforms: [
            { field: 'actor.mbox', action: 'Pseudonymize (reversible)', result: 'urn:pseudo:enc:Ax7Bf9...' },
            { field: 'actor.name', action: 'Pseudonymize', result: 'User-7829' },
            { field: 'actor.account', action: 'Pseudonymize', result: '{homePage: "...", name: "pseudo-7829"}' },
            { field: 'context.instructor', action: 'Pseudonymize', result: '{name: "Instructor-2341"}' },
            { field: 'Consent check', action: 'Verify before export', result: '✓ Consent recorded' }
        ]
    },
    'aggregate-only': {
        name: 'Aggregate Only',
        description: 'Export only aggregate statistics, no individual records',
        policy: `@prefix odrl: <http://www.w3.org/ns/odrl/2/> .
@prefix xapi: <https://w3id.org/xapi/ontology#> .
@prefix : <https://example.org/policies#> .

:AggregateOnlyPolicy a odrl:Policy ;
    odrl:profile <https://w3id.org/xapi/odrl-profile> ;
    odrl:prohibition [
        odrl:action odrl:distribute ;
        odrl:target xapi:Statement ;
        # Cannot export individual statements
    ] ;
    odrl:permission [
        odrl:action odrl:distribute ;
        odrl:target :AggregateReport ;
        odrl:constraint [
            odrl:leftOperand :minimumGroupSize ;
            odrl:operator odrl:gteq ;
            odrl:rightOperand 5
        ]
    ] .`,
        transforms: [
            { field: 'Individual statements', action: 'Block export', result: '(not exported)' },
            { field: 'Group size < 5', action: 'Block (k-anonymity)', result: '(not exported)' },
            { field: 'Aggregate counts', action: 'Allow', result: 'count: 47' },
            { field: 'Aggregate averages', action: 'Allow', result: 'avgScore: 0.82' },
            { field: 'Aggregate distributions', action: 'Allow', result: 'histogram: [...]' }
        ]
    },
    'internal-audit': {
        name: 'Internal Audit',
        description: 'Full access for internal compliance audits with audit trail',
        policy: `@prefix odrl: <http://www.w3.org/ns/odrl/2/> .
@prefix xapi: <https://w3id.org/xapi/ontology#> .
@prefix : <https://example.org/policies#> .

:InternalAuditPolicy a odrl:Policy ;
    odrl:profile <https://w3id.org/xapi/odrl-profile> ;
    odrl:permission [
        odrl:action odrl:read ;
        odrl:target xapi:Statement ;
        odrl:assignee :AuditTeam ;
        odrl:constraint [
            odrl:leftOperand :purpose ;
            odrl:operator odrl:eq ;
            odrl:rightOperand :complianceAudit
        ] ;
        odrl:duty [
            odrl:action :logAccess ;
            :auditLog <https://example.org/audit-log>
        ]
    ] .`,
        transforms: [
            { field: 'All PII fields', action: 'Full access', result: '(unchanged)' },
            { field: 'Access logged', action: 'Audit trail created', result: '✓ Logged to audit system' },
            { field: 'Purpose verified', action: 'Must be compliance audit', result: '✓ Purpose: compliance-audit' },
            { field: 'Assignee verified', action: 'Must be audit team member', result: '✓ Role: auditor' }
        ]
    }
};

const SAMPLE_STATEMENT = {
    "@context": "https://w3id.org/xapi/context",
    "@id": "urn:uuid:12345678-1234-1234-1234-123456789012",
    "actor": {
        "objectType": "Agent",
        "name": "Alice Johnson",
        "mbox": "mailto:alice.johnson@company.com",
        "account": {
            "homePage": "https://lms.company.com",
            "name": "alice.johnson"
        }
    },
    "verb": {
        "id": "http://adlnet.gov/expapi/verbs/completed",
        "display": { "en": "completed" }
    },
    "object": {
        "id": "https://example.org/courses/security-training",
        "definition": {
            "name": { "en": "Annual Security Training" },
            "type": "http://adlnet.gov/expapi/activities/course"
        }
    },
    "result": {
        "score": { "scaled": 0.95 },
        "success": true,
        "completion": true
    },
    "context": {
        "instructor": {
            "name": "Bob Smith",
            "mbox": "mailto:bob.smith@company.com"
        },
        "contextActivities": {
            "parent": [{
                "id": "https://example.org/programs/compliance"
            }]
        }
    },
    "timestamp": "2026-01-07T10:30:00Z"
};

let currentPolicy = 'research-export';

/**
 * Initialize anonymization demo
 */
function initAnonymize() {
    const select = document.getElementById('policy-select');
    const applyBtn = document.getElementById('apply-policy-btn');

    if (select) {
        select.addEventListener('change', function() {
            currentPolicy = this.value;
            displayPolicy();
            clearAnonymizedOutput();
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', applyAnonymization);
    }

    // Display initial state
    displayOriginalStatement();
    displayPolicy();
}

/**
 * Display the original statement
 */
function displayOriginalStatement() {
    const display = document.getElementById('original-statement');
    if (display) {
        display.innerHTML = `<pre class="json-display">${syntaxHighlightJSON(SAMPLE_STATEMENT)}</pre>`;
    }
}

/**
 * Display the current policy
 */
function displayPolicy() {
    const policy = ANONYMIZATION_POLICIES[currentPolicy];
    if (!policy) return;

    const policyDisplay = document.getElementById('policy-display');
    const transformsDisplay = document.getElementById('transforms-display');

    if (policyDisplay) {
        policyDisplay.innerHTML = `
            <div class="policy-header">
                <h4>${policy.name}</h4>
                <p>${policy.description}</p>
            </div>
            <pre class="turtle-display">${escapeHtml(policy.policy)}</pre>
        `;
    }

    if (transformsDisplay) {
        transformsDisplay.innerHTML = `
            <h4>Transformations Applied</h4>
            <table class="transforms-table">
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Action</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    ${policy.transforms.map(t => `
                        <tr>
                            <td><code>${t.field}</code></td>
                            <td>${t.action}</td>
                            <td><code>${t.result}</code></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}

/**
 * Apply anonymization and show result
 */
function applyAnonymization() {
    const outputDiv = document.getElementById('anonymized-output');
    if (!outputDiv) return;

    const policy = ANONYMIZATION_POLICIES[currentPolicy];
    if (!policy) return;

    // Show loading
    outputDiv.innerHTML = '<div class="anon-loading">Applying ODRL policy...</div>';

    setTimeout(() => {
        const anonymized = applyPolicy(SAMPLE_STATEMENT, currentPolicy);

        outputDiv.innerHTML = `
            <div class="anon-result">
                <div class="anon-header">
                    <span class="badge badge-green">Policy Applied</span>
                    <span class="policy-name">${policy.name}</span>
                </div>
                <pre class="json-display">${syntaxHighlightJSON(anonymized)}</pre>
                <div class="anon-summary">
                    <p><strong>Privacy preserved:</strong> ${getPrivacySummary(currentPolicy)}</p>
                </div>
            </div>
        `;
    }, 500);
}

/**
 * Apply a specific policy to a statement
 */
function applyPolicy(statement, policyKey) {
    const result = JSON.parse(JSON.stringify(statement)); // Deep clone

    switch (policyKey) {
        case 'research-export':
            // Hash PII
            result.actor = {
                objectType: "Agent",
                mbox_sha1sum: "sha256:a8f5f167f44f4964e6c998dee827110c"
            };
            delete result.context.instructor;
            break;

        case 'gdpr-export':
            // Pseudonymize
            result.actor = {
                objectType: "Agent",
                name: "User-7829",
                account: {
                    homePage: "https://lms.company.com",
                    name: "pseudo-7829"
                }
            };
            result.context.instructor = {
                name: "Instructor-2341"
            };
            result["_gdpr"] = {
                pseudonymized: true,
                consentVerified: true,
                exportedAt: new Date().toISOString()
            };
            break;

        case 'aggregate-only':
            // Return aggregate only
            return {
                "@context": "https://w3id.org/xapi/context",
                "@type": "AggregateReport",
                "activity": statement.object.id,
                "period": {
                    "start": "2026-01-01",
                    "end": "2026-01-07"
                },
                "metrics": {
                    "totalCompletions": 47,
                    "averageScore": 0.82,
                    "passRate": 0.94,
                    "uniqueLearners": 42
                },
                "_policy": {
                    "applied": "AggregateOnlyPolicy",
                    "minimumGroupSize": 5,
                    "individualRecords": "blocked"
                }
            };

        case 'internal-audit':
            // Full access but add audit trail
            result["_audit"] = {
                accessedBy: "auditor@company.com",
                accessedAt: new Date().toISOString(),
                purpose: "compliance-audit",
                logId: "audit-log-" + Math.random().toString(36).substr(2, 9)
            };
            break;
    }

    return result;
}

/**
 * Get privacy summary for a policy
 */
function getPrivacySummary(policyKey) {
    const summaries = {
        'research-export': 'Direct identifiers removed, hashed IDs preserve analytics capability',
        'gdpr-export': 'Reversible pseudonymization allows re-identification by data controller only',
        'aggregate-only': 'No individual records exposed, k-anonymity guaranteed',
        'internal-audit': 'Full access with complete audit trail for compliance'
    };
    return summaries[policyKey] || '';
}

/**
 * Clear anonymized output
 */
function clearAnonymizedOutput() {
    const outputDiv = document.getElementById('anonymized-output');
    if (outputDiv) {
        outputDiv.innerHTML = '<div class="placeholder"><p>Click "Apply Policy" to see anonymized output</p></div>';
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

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
