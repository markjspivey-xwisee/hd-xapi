/**
 * HD-XAPI Playground - SPARQL Query Demo
 * Demonstrates semantic query capabilities impossible with vanilla xAPI
 */

const SPARQL_QUERIES = {
    'prerequisite-gap': {
        name: 'Prerequisite Gaps',
        description: 'Find learners who completed prerequisites but not the main course',
        query: `PREFIX xapi: <https://w3id.org/xapi/ontology#>
PREFIX prov: <http://www.w3.org/ns/prov#>

SELECT ?learner ?learnerName ?prereq ?prereqName
WHERE {
    # Find completed prerequisites
    ?prereqStmt xapi:actor ?learner ;
                xapi:verb <http://adlnet.gov/expapi/verbs/completed> ;
                xapi:object ?prereq .

    ?prereq xapi:definition/xapi:name ?prereqName .
    ?learner xapi:name ?learnerName .

    # Prereq is prerequisite for main course
    ?prereq :prerequisiteFor <https://example.org/courses/advanced-xapi> .

    # Learner has NOT completed the main course
    FILTER NOT EXISTS {
        ?mainStmt xapi:actor ?learner ;
                  xapi:verb <http://adlnet.gov/expapi/verbs/completed> ;
                  xapi:object <https://example.org/courses/advanced-xapi> .
    }
}`,
        vanillaEquivalent: `// Vanilla xAPI - IMPOSSIBLE in a single query!
// You would need to:

// 1. Fetch ALL completion statements
GET /statements?verb=completed

// 2. Client-side: Build a map of completions per learner
const completionsByLearner = {};
statements.forEach(s => {
    // manually aggregate...
});

// 3. Fetch activity definitions to find prerequisites
// (xAPI has no prerequisite concept!)

// 4. Manually cross-reference and filter
// This requires custom application logic
// and multiple round-trips to the LRS`,
        results: [
            { learner: 'alice@example.org', learnerName: 'Alice Learner', prereq: 'intro-xapi', prereqName: 'Introduction to xAPI' },
            { learner: 'bob@example.org', learnerName: 'Bob Student', prereq: 'intro-xapi', prereqName: 'Introduction to xAPI' },
            { learner: 'bob@example.org', learnerName: 'Bob Student', prereq: 'rdf-basics', prereqName: 'RDF Basics' }
        ]
    },
    'competency-gaps': {
        name: 'Competency Gaps',
        description: 'Show missing competencies for a target career role',
        query: `PREFIX tla: <https://w3id.org/xapi/tla#>
PREFIX prov: <http://www.w3.org/ns/prov#>

SELECT ?learner ?missingCompetency ?competencyName
WHERE {
    # Learner has a target role
    ?learner tla:targetRole ?role .

    # Role requires certain competencies
    ?role tla:requiresCompetency ?missingCompetency .
    ?missingCompetency skos:prefLabel ?competencyName .

    # Learner does NOT have this competency asserted
    FILTER NOT EXISTS {
        ?assertion tla:assertsCompetency ?missingCompetency ;
                   prov:wasAttributedTo ?learner .
    }
}
ORDER BY ?learner`,
        vanillaEquivalent: `// Vanilla xAPI - NOT POSSIBLE!
//
// xAPI has NO concept of:
// - Competencies
// - Career roles
// - Competency requirements
// - Competency assertions
//
// You would need a completely separate system
// to track competencies and manually correlate
// with xAPI statements.
//
// There's no query you can write.`,
        results: [
            { learner: 'carol@example.org', missingCompetency: 'sparql-querying', competencyName: 'SPARQL Querying' },
            { learner: 'carol@example.org', missingCompetency: 'shacl-validation', competencyName: 'SHACL Validation' },
            { learner: 'dave@example.org', missingCompetency: 'owl-modeling', competencyName: 'OWL Modeling' }
        ]
    },
    'learning-journey': {
        name: 'Learning Journey',
        description: 'Trace complete learning path via PROV links',
        query: `PREFIX xapi: <https://w3id.org/xapi/ontology#>
PREFIX prov: <http://www.w3.org/ns/prov#>

SELECT ?step ?activity ?activityName ?timestamp
WHERE {
    # Start from a completion event
    ?completion xapi:actor <mailto:alice@example.org> ;
                xapi:verb <http://adlnet.gov/expapi/verbs/completed> ;
                xapi:object ?finalActivity .

    # Walk backwards through PROV chain
    ?completion (prov:wasInformedBy)* ?step .

    ?step xapi:object ?activity ;
          xapi:timestamp ?timestamp .
    ?activity xapi:definition/xapi:name ?activityName .
}
ORDER BY ?timestamp`,
        vanillaEquivalent: `// Vanilla xAPI - EXTREMELY DIFFICULT
//
// xAPI stores no provenance links between statements.
// To reconstruct a learning journey, you must:
//
// 1. Query all statements for a learner
GET /statements?agent={"mbox":"mailto:alice@example.org"}

// 2. Hope they used registration UUIDs consistently
// 3. Sort by timestamp
// 4. Guess at the relationships
// 5. No guarantee of completeness or correctness
//
// PROV-O integration in HD-XAPI makes this trivial.`,
        results: [
            { step: 'stmt-001', activity: 'intro-video', activityName: 'Watch Introduction Video', timestamp: '2026-01-05T09:00:00Z' },
            { step: 'stmt-002', activity: 'module-1', activityName: 'Complete Module 1', timestamp: '2026-01-05T10:30:00Z' },
            { step: 'stmt-003', activity: 'quiz-1', activityName: 'Pass Quiz 1', timestamp: '2026-01-05T11:00:00Z' },
            { step: 'stmt-004', activity: 'module-2', activityName: 'Complete Module 2', timestamp: '2026-01-06T09:00:00Z' },
            { step: 'stmt-005', activity: 'final-exam', activityName: 'Pass Final Exam', timestamp: '2026-01-07T14:00:00Z' }
        ]
    },
    'aggregate-scores': {
        name: 'Aggregate Scores',
        description: 'Calculate average scores across child activities',
        query: `PREFIX xapi: <https://w3id.org/xapi/ontology#>

SELECT ?parent ?parentName (AVG(?score) AS ?avgScore) (COUNT(?child) AS ?numActivities)
WHERE {
    # Find parent activities
    ?parent a xapi:Activity ;
            xapi:definition/xapi:name ?parentName .

    # Find child activities
    ?childStmt xapi:context/xapi:contextActivities/xapi:parent ?parent ;
               xapi:object ?child ;
               xapi:result/xapi:score/xapi:scaled ?score .
}
GROUP BY ?parent ?parentName
HAVING (COUNT(?child) > 1)
ORDER BY DESC(?avgScore)`,
        vanillaEquivalent: `// Vanilla xAPI - MANUAL AGGREGATION REQUIRED
//
// 1. Query statements with contextActivities.parent
GET /statements?activity=<parent-id>&related_activities=true

// 2. Client-side aggregation:
let scores = [];
statements.forEach(s => {
    if (s.result?.score?.scaled) {
        scores.push(s.result.score.scaled);
    }
});
const avg = scores.reduce((a,b) => a+b, 0) / scores.length;

// Problems:
// - No server-side aggregation
// - Must fetch ALL statements
// - Pagination handling required
// - Very slow for large datasets`,
        results: [
            { parent: 'course-101', parentName: 'Introduction to xAPI', avgScore: 0.87, numActivities: 5 },
            { parent: 'course-201', parentName: 'Advanced xAPI', avgScore: 0.82, numActivities: 8 },
            { parent: 'cert-path', parentName: 'Certification Path', avgScore: 0.79, numActivities: 12 }
        ]
    },
    'team-performance': {
        name: 'Team Performance',
        description: 'Compare progress across team members',
        query: `PREFIX xapi: <https://w3id.org/xapi/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?team ?teamName ?member ?memberName
       (COUNT(?completed) AS ?completions)
       (AVG(?score) AS ?avgScore)
WHERE {
    ?team a xapi:Group ;
          xapi:name ?teamName ;
          xapi:member ?member .
    ?member xapi:name ?memberName .

    OPTIONAL {
        ?stmt xapi:actor ?member ;
              xapi:verb <http://adlnet.gov/expapi/verbs/completed> ;
              xapi:object ?completed .
    }
    OPTIONAL {
        ?scoreStmt xapi:actor ?member ;
                   xapi:result/xapi:score/xapi:scaled ?score .
    }
}
GROUP BY ?team ?teamName ?member ?memberName
ORDER BY ?teamName DESC(?completions)`,
        vanillaEquivalent: `// Vanilla xAPI - VERY COMPLEX
//
// xAPI Groups are poorly supported for analytics:
//
// 1. Query group membership (if stored at all)
// 2. For EACH member, query their statements
// 3. Manually aggregate completions and scores
// 4. Build comparison data structure
//
// Most LRS implementations don't support
// querying by group membership at all!`,
        results: [
            { team: 'team-alpha', teamName: 'Team Alpha', member: 'alice', memberName: 'Alice', completions: 12, avgScore: 0.91 },
            { team: 'team-alpha', teamName: 'Team Alpha', member: 'bob', memberName: 'Bob', completions: 10, avgScore: 0.85 },
            { team: 'team-beta', teamName: 'Team Beta', member: 'carol', memberName: 'Carol', completions: 15, avgScore: 0.88 },
            { team: 'team-beta', teamName: 'Team Beta', member: 'dave', memberName: 'Dave', completions: 8, avgScore: 0.78 }
        ]
    },
    'time-analysis': {
        name: 'Time Analysis',
        description: 'Analyze duration patterns across activities',
        query: `PREFIX xapi: <https://w3id.org/xapi/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?activityType ?typeName
       (AVG(?durationMinutes) AS ?avgDuration)
       (MIN(?durationMinutes) AS ?minDuration)
       (MAX(?durationMinutes) AS ?maxDuration)
WHERE {
    ?stmt xapi:object ?activity ;
          xapi:result/xapi:duration ?duration .

    ?activity xapi:definition/xapi:type ?activityType .
    ?activityType skos:prefLabel ?typeName .

    # Convert ISO 8601 duration to minutes
    BIND(xsd:decimal(REPLACE(str(?duration), "PT(\\\\d+)M.*", "$1")) AS ?durationMinutes)
}
GROUP BY ?activityType ?typeName
ORDER BY DESC(?avgDuration)`,
        vanillaEquivalent: `// Vanilla xAPI - REQUIRES FULL DATA EXPORT
//
// 1. Export ALL statements with duration
GET /statements  # paginate through everything

// 2. Parse ISO 8601 durations client-side
function parseDuration(iso) {
    // Complex regex parsing...
}

// 3. Group by activity type manually
// 4. Calculate statistics
//
// No server-side aggregation = slow & expensive`,
        results: [
            { activityType: 'assessment', typeName: 'Assessment', avgDuration: 45, minDuration: 15, maxDuration: 90 },
            { activityType: 'video', typeName: 'Video', avgDuration: 12, minDuration: 3, maxDuration: 45 },
            { activityType: 'simulation', typeName: 'Simulation', avgDuration: 30, minDuration: 10, maxDuration: 60 },
            { activityType: 'reading', typeName: 'Reading', avgDuration: 8, minDuration: 2, maxDuration: 20 }
        ]
    }
};

let sparqlEditor;
let currentQuery = 'prerequisite-gap';

/**
 * Initialize SPARQL playground
 */
function initSPARQL() {
    // Initialize CodeMirror for SPARQL
    const textarea = document.getElementById('sparql-editor');
    if (textarea && typeof CodeMirror !== 'undefined') {
        sparqlEditor = CodeMirror.fromTextArea(textarea, {
            mode: 'sparql',
            theme: 'dracula',
            lineNumbers: true,
            matchBrackets: true,
            lineWrapping: true
        });

        // Load initial query
        loadQuery('prerequisite-gap');
    }

    // Query item click handlers
    document.querySelectorAll('.query-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.query-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const queryKey = this.getAttribute('data-query');
            loadQuery(queryKey);
        });
    });

    // Execute button
    const runBtn = document.getElementById('run-sparql-btn');
    if (runBtn) {
        runBtn.addEventListener('click', executeQuery);
    }
}

/**
 * Load a query into the editor
 */
function loadQuery(queryKey) {
    currentQuery = queryKey;
    const query = SPARQL_QUERIES[queryKey];
    if (!query || !sparqlEditor) return;

    sparqlEditor.setValue(query.query);

    // Update vanilla equivalent
    const vanillaBox = document.getElementById('vanilla-equivalent');
    if (vanillaBox) {
        vanillaBox.innerHTML = `<pre>${escapeHtml(query.vanillaEquivalent)}</pre>`;
    }

    // Clear results
    const resultsDiv = document.getElementById('sparql-results');
    if (resultsDiv) {
        resultsDiv.innerHTML = '<div class="placeholder"><p>Click Execute to see results</p></div>';
    }

    const countSpan = document.getElementById('sparql-result-count');
    if (countSpan) {
        countSpan.textContent = '';
    }
}

/**
 * Execute the current query
 */
function executeQuery() {
    const resultsDiv = document.getElementById('sparql-results');
    const countSpan = document.getElementById('sparql-result-count');
    if (!resultsDiv) return;

    const query = SPARQL_QUERIES[currentQuery];
    if (!query) return;

    // Show loading
    resultsDiv.innerHTML = '<div class="sparql-loading">Executing SPARQL query...</div>';

    // Simulate query execution
    setTimeout(() => {
        const results = query.results;

        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results">No results found</div>';
            countSpan.textContent = '0 results';
            return;
        }

        // Build results table
        const columns = Object.keys(results[0]);
        let html = '<table class="results-table"><thead><tr>';
        columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '</tr></thead><tbody>';

        results.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                const value = row[col];
                html += `<td>${formatValue(value)}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';

        resultsDiv.innerHTML = html;
        countSpan.textContent = `${results.length} results`;
    }, 600);
}

/**
 * Format a result value for display
 */
function formatValue(value) {
    if (typeof value === 'number') {
        return value.toFixed(2);
    }
    if (typeof value === 'string' && value.includes('@')) {
        return `<span class="result-email">${value}</span>`;
    }
    if (typeof value === 'string' && value.startsWith('http')) {
        return `<span class="result-uri">${value.split('/').pop()}</span>`;
    }
    return value;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
