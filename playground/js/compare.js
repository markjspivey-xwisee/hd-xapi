/**
 * HD-XAPI Playground - Side-by-Side Comparison Demo
 * Shows the same scenario implemented in vanilla xAPI vs HD-XAPI
 */

const COMPARISON_SCENARIOS = {
    'prerequisite-check': {
        name: 'Prerequisite Checking',
        description: 'Check if a learner has completed prerequisites before enrolling in advanced course',
        vanilla: {
            code: `// Step 1: Get all completion statements for the learner
const response1 = await fetch(
  '/statements?' + new URLSearchParams({
    agent: JSON.stringify({mbox: 'mailto:alice@example.org'}),
    verb: 'http://adlnet.gov/expapi/verbs/completed',
    limit: 1000
  })
);
const completions = await response1.json().statements;

// Step 2: Manually check each completion against prereqs
// (Prerequisites aren't tracked in xAPI, so we need
//  a separate database or hardcoded list!)
const prereqs = ['intro-101', 'basics-102']; // External data!
const completed = completions.map(s => s.object.id);

// Step 3: Filter to find which prereqs are done
const missingPrereqs = prereqs.filter(
  p => !completed.includes(p)
);

// Step 4: Return result
if (missingPrereqs.length > 0) {
  console.log('Missing prerequisites:', missingPrereqs);
} else {
  console.log('Ready to enroll!');
}

// Problems:
// - Prerequisites stored externally
// - Multiple round trips
// - Client-side processing
// - No semantic relationship`,
            steps: 4,
            roundTrips: 2,
            clientLogic: 'High',
            semantic: false
        },
        hdxapi: {
            code: `# Single SPARQL query - everything in one request!
PREFIX xapi: <https://w3id.org/xapi/ontology#>
PREFIX : <https://example.org/ontology#>

SELECT ?missingPrereq ?prereqName
WHERE {
  # Course defines its prerequisites (in the graph!)
  <https://example.org/courses/advanced-201>
    :hasPrerequisite ?missingPrereq .

  ?missingPrereq xapi:definition/xapi:name ?prereqName .

  # Find ones the learner HASN'T completed
  FILTER NOT EXISTS {
    ?stmt xapi:actor <mailto:alice@example.org> ;
          xapi:verb <http://adlnet.gov/expapi/verbs/completed> ;
          xapi:object ?missingPrereq .
  }
}

# Benefits:
# - Prerequisites stored WITH courses (semantic)
# - Single query
# - Server-side processing
# - Returns exactly what you need`,
            steps: 1,
            roundTrips: 1,
            clientLogic: 'None',
            semantic: true
        },
        results: {
            vanilla: '["intro-101"] // From client-side processing',
            hdxapi: '[{prereq: "intro-101", name: "Introduction to Learning"}]'
        }
    },
    'competency-assertion': {
        name: 'Competency Assertion',
        description: 'Assert that a learner has demonstrated a competency through an assessment',
        vanilla: {
            code: `// Step 1: Store the assessment result
const statement = {
  actor: { mbox: 'mailto:bob@example.org' },
  verb: { id: 'http://adlnet.gov/expapi/verbs/passed' },
  object: {
    id: 'https://example.org/assessments/xapi-exam',
    definition: {
      name: { 'en': 'xAPI Certification Exam' }
    }
  },
  result: {
    score: { scaled: 0.92 },
    success: true
  }
};

await fetch('/statements', {
  method: 'POST',
  body: JSON.stringify(statement)
});

// Step 2: In a SEPARATE system, record competency
// xAPI has NO competency model!
await competencySystem.assertCompetency({
  learner: 'bob@example.org',
  competency: 'xapi-implementation',
  level: 0.92,
  evidence: statement.id
});

// Step 3: Check for credential qualification
// Yet ANOTHER system!
await credentialSystem.checkQualification({
  learner: 'bob@example.org',
  credential: 'xapi-certified'
});

// Problems:
// - 3 separate systems
// - No semantic links between them
// - Manual coordination required
// - No provenance trail`,
            steps: 3,
            roundTrips: 3,
            clientLogic: 'High',
            semantic: false
        },
        hdxapi: {
            code: `# Post single statement - inference does the rest!
{
  "@context": "https://w3id.org/xapi/context",
  "actor": { "mbox": "mailto:bob@example.org" },
  "verb": { "id": "http://adlnet.gov/expapi/verbs/passed" },
  "object": {
    "id": "https://example.org/assessments/xapi-exam",
    "definition": {
      "extensions": {
        "tla:assessesCompetency": "https://example.org/competencies/xapi-impl"
      }
    }
  },
  "result": { "score": { "scaled": 0.92 }, "success": true }
}

# SHACL-AF Rules AUTO-GENERATE:
#
# 1. CompetencyAssertion:
#    _:assertion a tla:CompetencyAssertion ;
#      tla:assertsCompetency <competencies/xapi-impl> ;
#      tla:confidenceLevel 0.92 ;
#      prov:wasGeneratedBy <statement-id> ;
#      prov:wasAttributedTo <mailto:bob@example.org> .
#
# 2. Credential Check (if all competencies met):
#    <mailto:bob@example.org> :qualifiedFor <credentials/xapi-cert> .
#
# 3. PROV Links:
#    <statement-id> a prov:Activity ;
#      prov:generated _:assertion .`,
            steps: 1,
            roundTrips: 1,
            clientLogic: 'None',
            semantic: true
        },
        results: {
            vanilla: '// Statement stored, but no semantic connections',
            hdxapi: '// Statement + CompetencyAssertion + Credential qualification + PROV chain'
        }
    },
    'learning-path': {
        name: 'Learning Path Progress',
        description: 'Track and query a learner\'s progress through a structured learning path',
        vanilla: {
            code: `// Step 1: Query all statements for the learner
let allStatements = [];
let more = true;
let cursor = '';

while (more) {
  const response = await fetch(
    '/statements?' + new URLSearchParams({
      agent: JSON.stringify({mbox: 'mailto:carol@example.org'}),
      limit: 100,
      ...(cursor && { cursor })
    })
  );
  const data = await response.json();
  allStatements = allStatements.concat(data.statements);
  more = !!data.more;
  cursor = data.more;
}

// Step 2: Get learning path structure (external!)
const learningPath = await pathService.getPath('data-science-path');

// Step 3: Calculate progress client-side
const completedIds = allStatements
  .filter(s => s.verb.id.includes('completed'))
  .map(s => s.object.id);

const progress = learningPath.activities.map(activity => ({
  activity: activity.id,
  name: activity.name,
  completed: completedIds.includes(activity.id),
  order: activity.order
}));

const percentComplete =
  progress.filter(p => p.completed).length /
  progress.length * 100;

// Problems:
// - Must paginate through ALL statements
// - Learning path structure stored elsewhere
// - Expensive client-side processing
// - No ordering guarantees`,
            steps: 5,
            roundTrips: 'N+1',
            clientLogic: 'Very High',
            semantic: false
        },
        hdxapi: {
            code: `# Single SPARQL query for complete progress view
PREFIX xapi: <https://w3id.org/xapi/ontology#>
PREFIX tla: <https://w3id.org/xapi/tla#>

SELECT ?activity ?name ?order ?completed ?completedAt
WHERE {
  # Learning path and its activities (in the graph!)
  <https://example.org/paths/data-science>
    tla:hasStep ?step .

  ?step tla:activity ?activity ;
        tla:order ?order .

  ?activity xapi:definition/xapi:name ?name .

  # Check completion status
  OPTIONAL {
    ?stmt xapi:actor <mailto:carol@example.org> ;
          xapi:verb <http://adlnet.gov/expapi/verbs/completed> ;
          xapi:object ?activity ;
          xapi:timestamp ?completedAt .
    BIND(true AS ?completed)
  }
}
ORDER BY ?order

# Also easy to get aggregate:
# SELECT (COUNT(?completed) AS ?done) (COUNT(?step) AS ?total)
# WHERE { ... }`,
            steps: 1,
            roundTrips: 1,
            clientLogic: 'None',
            semantic: true
        },
        results: {
            vanilla: '// Array built from multiple requests + external data',
            hdxapi: '// Complete progress with ordering in single response'
        }
    },
    'team-analytics': {
        name: 'Team Analytics',
        description: 'Compare learning progress across team members',
        vanilla: {
            code: `// Step 1: Get team membership (external system!)
const team = await teamService.getTeam('engineering');
const members = team.members; // ['alice', 'bob', 'carol']

// Step 2: Query statements for EACH member
const memberStats = await Promise.all(
  members.map(async (member) => {
    // Get completions
    const completions = await fetch(
      '/statements?' + new URLSearchParams({
        agent: JSON.stringify({mbox: \`mailto:\${member}@example.org\`}),
        verb: 'http://adlnet.gov/expapi/verbs/completed'
      })
    ).then(r => r.json());

    // Get scores (separate query)
    const scores = await fetch(
      '/statements?' + new URLSearchParams({
        agent: JSON.stringify({mbox: \`mailto:\${member}@example.org\`}),
        verb: 'http://adlnet.gov/expapi/verbs/scored'
      })
    ).then(r => r.json());

    return {
      member,
      completions: completions.statements.length,
      avgScore: calculateAverage(scores.statements)
    };
  })
);

// Step 3: Aggregate and sort
const teamReport = {
  team: team.name,
  totalCompletions: memberStats.reduce((a, m) => a + m.completions, 0),
  avgTeamScore: calculateAverage(memberStats.map(m => m.avgScore)),
  members: memberStats.sort((a, b) => b.completions - a.completions)
};

// Problems:
// - N+1 query problem (2 queries per member!)
// - Team membership stored externally
// - All aggregation client-side
// - Very slow for large teams`,
            steps: '3 + 2N',
            roundTrips: '1 + 2N',
            clientLogic: 'Very High',
            semantic: false
        },
        hdxapi: {
            code: `# Single query for complete team analytics!
PREFIX xapi: <https://w3id.org/xapi/ontology#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?member ?memberName
       (COUNT(DISTINCT ?completion) AS ?completions)
       (AVG(?score) AS ?avgScore)
WHERE {
  # Team membership is IN the graph
  <https://example.org/teams/engineering>
    foaf:member ?member .

  ?member xapi:name ?memberName .

  # Get completions
  OPTIONAL {
    ?compStmt xapi:actor ?member ;
              xapi:verb <http://adlnet.gov/expapi/verbs/completed> ;
              xapi:object ?completion .
  }

  # Get scores
  OPTIONAL {
    ?scoreStmt xapi:actor ?member ;
               xapi:result/xapi:score/xapi:scaled ?score .
  }
}
GROUP BY ?member ?memberName
ORDER BY DESC(?completions)

# Want team totals? Just wrap in a subquery!`,
            steps: 1,
            roundTrips: 1,
            clientLogic: 'None',
            semantic: true
        },
        results: {
            vanilla: '// Built from 7+ API calls for a 3-person team',
            hdxapi: '// Complete team report in one query'
        }
    }
};

let currentScenario = 'prerequisite-check';

/**
 * Initialize comparison demo
 */
function initCompare() {
    const select = document.getElementById('compare-scenario-select');

    if (select) {
        select.addEventListener('change', function() {
            currentScenario = this.value;
            displayComparison();
        });
    }

    // Display initial comparison
    displayComparison();
}

/**
 * Display the current comparison
 */
function displayComparison() {
    const scenario = COMPARISON_SCENARIOS[currentScenario];
    if (!scenario) return;

    // Update vanilla side
    const vanillaCode = document.getElementById('vanilla-code');
    const vanillaMetrics = document.getElementById('vanilla-metrics');

    if (vanillaCode) {
        vanillaCode.innerHTML = `<pre class="code-block javascript">${escapeHtml(scenario.vanilla.code)}</pre>`;
    }

    if (vanillaMetrics) {
        vanillaMetrics.innerHTML = `
            <div class="metric metric-bad">
                <span class="metric-label">Steps</span>
                <span class="metric-value">${scenario.vanilla.steps}</span>
            </div>
            <div class="metric metric-bad">
                <span class="metric-label">Round Trips</span>
                <span class="metric-value">${scenario.vanilla.roundTrips}</span>
            </div>
            <div class="metric metric-bad">
                <span class="metric-label">Client Logic</span>
                <span class="metric-value">${scenario.vanilla.clientLogic}</span>
            </div>
            <div class="metric metric-bad">
                <span class="metric-label">Semantic</span>
                <span class="metric-value">${scenario.vanilla.semantic ? 'Yes' : 'No'}</span>
            </div>
        `;
    }

    // Update HD-XAPI side
    const hdxapiCode = document.getElementById('hdxapi-code');
    const hdxapiMetrics = document.getElementById('hdxapi-metrics');

    if (hdxapiCode) {
        hdxapiCode.innerHTML = `<pre class="code-block sparql">${escapeHtml(scenario.hdxapi.code)}</pre>`;
    }

    if (hdxapiMetrics) {
        hdxapiMetrics.innerHTML = `
            <div class="metric metric-good">
                <span class="metric-label">Steps</span>
                <span class="metric-value">${scenario.hdxapi.steps}</span>
            </div>
            <div class="metric metric-good">
                <span class="metric-label">Round Trips</span>
                <span class="metric-value">${scenario.hdxapi.roundTrips}</span>
            </div>
            <div class="metric metric-good">
                <span class="metric-label">Client Logic</span>
                <span class="metric-value">${scenario.hdxapi.clientLogic}</span>
            </div>
            <div class="metric metric-good">
                <span class="metric-label">Semantic</span>
                <span class="metric-value">${scenario.hdxapi.semantic ? 'Yes' : 'No'}</span>
            </div>
        `;
    }

    // Update description
    const descDiv = document.getElementById('compare-description');
    if (descDiv) {
        descDiv.innerHTML = `<p>${scenario.description}</p>`;
    }
}

/**
 * Escape HTML for display
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
