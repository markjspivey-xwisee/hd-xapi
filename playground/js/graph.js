/**
 * HD-XAPI Playground - Visual Graph Explorer
 * Interactive force-directed graph visualization of xAPI semantic relationships
 */

const GRAPH_DATASETS = {
    'learning-journey': {
        name: 'Learning Journey',
        description: 'Visualize a learner\'s path through activities with PROV links',
        nodes: [
            { id: 'alice', label: 'Alice', type: 'agent', group: 1 },
            { id: 'stmt1', label: 'Started Course', type: 'statement', group: 2 },
            { id: 'stmt2', label: 'Watched Video', type: 'statement', group: 2 },
            { id: 'stmt3', label: 'Completed Quiz', type: 'statement', group: 2 },
            { id: 'stmt4', label: 'Passed Exam', type: 'statement', group: 2 },
            { id: 'course', label: 'xAPI Course', type: 'activity', group: 3 },
            { id: 'video', label: 'Intro Video', type: 'activity', group: 3 },
            { id: 'quiz', label: 'Module Quiz', type: 'activity', group: 3 },
            { id: 'exam', label: 'Final Exam', type: 'activity', group: 3 },
            { id: 'competency', label: 'xAPI Competency', type: 'competency', group: 4 }
        ],
        links: [
            { source: 'stmt1', target: 'alice', label: 'actor', type: 'actor' },
            { source: 'stmt2', target: 'alice', label: 'actor', type: 'actor' },
            { source: 'stmt3', target: 'alice', label: 'actor', type: 'actor' },
            { source: 'stmt4', target: 'alice', label: 'actor', type: 'actor' },
            { source: 'stmt1', target: 'course', label: 'object', type: 'object' },
            { source: 'stmt2', target: 'video', label: 'object', type: 'object' },
            { source: 'stmt3', target: 'quiz', label: 'object', type: 'object' },
            { source: 'stmt4', target: 'exam', label: 'object', type: 'object' },
            { source: 'stmt2', target: 'stmt1', label: 'prov:wasInformedBy', type: 'prov' },
            { source: 'stmt3', target: 'stmt2', label: 'prov:wasInformedBy', type: 'prov' },
            { source: 'stmt4', target: 'stmt3', label: 'prov:wasInformedBy', type: 'prov' },
            { source: 'video', target: 'course', label: 'parent', type: 'hierarchy' },
            { source: 'quiz', target: 'course', label: 'parent', type: 'hierarchy' },
            { source: 'exam', target: 'course', label: 'parent', type: 'hierarchy' },
            { source: 'stmt4', target: 'competency', label: 'asserts', type: 'competency' }
        ]
    },
    'team-learning': {
        name: 'Team Learning',
        description: 'Show team members and their shared learning activities',
        nodes: [
            { id: 'team', label: 'Engineering Team', type: 'group', group: 1 },
            { id: 'alice', label: 'Alice', type: 'agent', group: 2 },
            { id: 'bob', label: 'Bob', type: 'agent', group: 2 },
            { id: 'carol', label: 'Carol', type: 'agent', group: 2 },
            { id: 'course1', label: 'Security Training', type: 'activity', group: 3 },
            { id: 'course2', label: 'API Design', type: 'activity', group: 3 },
            { id: 'course3', label: 'Testing Best Practices', type: 'activity', group: 3 },
            { id: 'comp1', label: 'Security Awareness', type: 'competency', group: 4 },
            { id: 'comp2', label: 'API Skills', type: 'competency', group: 4 }
        ],
        links: [
            { source: 'alice', target: 'team', label: 'member', type: 'membership' },
            { source: 'bob', target: 'team', label: 'member', type: 'membership' },
            { source: 'carol', target: 'team', label: 'member', type: 'membership' },
            { source: 'alice', target: 'course1', label: 'completed', type: 'completion' },
            { source: 'alice', target: 'course2', label: 'completed', type: 'completion' },
            { source: 'bob', target: 'course1', label: 'completed', type: 'completion' },
            { source: 'bob', target: 'course3', label: 'in progress', type: 'progress' },
            { source: 'carol', target: 'course1', label: 'completed', type: 'completion' },
            { source: 'carol', target: 'course2', label: 'completed', type: 'completion' },
            { source: 'carol', target: 'course3', label: 'completed', type: 'completion' },
            { source: 'course1', target: 'comp1', label: 'teaches', type: 'teaches' },
            { source: 'course2', target: 'comp2', label: 'teaches', type: 'teaches' },
            { source: 'alice', target: 'comp1', label: 'has', type: 'hasCompetency' },
            { source: 'alice', target: 'comp2', label: 'has', type: 'hasCompetency' },
            { source: 'bob', target: 'comp1', label: 'has', type: 'hasCompetency' },
            { source: 'carol', target: 'comp1', label: 'has', type: 'hasCompetency' },
            { source: 'carol', target: 'comp2', label: 'has', type: 'hasCompetency' }
        ]
    },
    'credential-chain': {
        name: 'Credential Chain',
        description: 'Verifiable credential issuance with full provenance',
        nodes: [
            { id: 'learner', label: 'Dave Student', type: 'agent', group: 1 },
            { id: 'issuer', label: 'Training Corp', type: 'organization', group: 2 },
            { id: 'assessment', label: 'Certification Exam', type: 'activity', group: 3 },
            { id: 'stmt-pass', label: 'Passed Exam', type: 'statement', group: 4 },
            { id: 'comp-assert', label: 'Competency Assertion', type: 'assertion', group: 5 },
            { id: 'competency', label: 'Cloud Architecture', type: 'competency', group: 6 },
            { id: 'credential', label: 'Cloud Architect Cert', type: 'credential', group: 7 },
            { id: 'proof', label: 'Digital Signature', type: 'proof', group: 8 }
        ],
        links: [
            { source: 'stmt-pass', target: 'learner', label: 'actor', type: 'actor' },
            { source: 'stmt-pass', target: 'assessment', label: 'object', type: 'object' },
            { source: 'comp-assert', target: 'stmt-pass', label: 'prov:wasGeneratedBy', type: 'prov' },
            { source: 'comp-assert', target: 'competency', label: 'asserts', type: 'competency' },
            { source: 'comp-assert', target: 'learner', label: 'prov:wasAttributedTo', type: 'prov' },
            { source: 'credential', target: 'comp-assert', label: 'prov:wasDerivedFrom', type: 'prov' },
            { source: 'credential', target: 'learner', label: 'credentialSubject', type: 'subject' },
            { source: 'credential', target: 'issuer', label: 'issuer', type: 'issuer' },
            { source: 'proof', target: 'credential', label: 'proves', type: 'proof' },
            { source: 'proof', target: 'issuer', label: 'verificationMethod', type: 'verification' },
            { source: 'assessment', target: 'competency', label: 'assesses', type: 'teaches' }
        ]
    },
    'prerequisite-graph': {
        name: 'Prerequisite Graph',
        description: 'Course prerequisites and learning path dependencies',
        nodes: [
            { id: 'intro', label: 'Intro to Programming', type: 'activity', group: 1 },
            { id: 'data-struct', label: 'Data Structures', type: 'activity', group: 2 },
            { id: 'algorithms', label: 'Algorithms', type: 'activity', group: 2 },
            { id: 'databases', label: 'Database Design', type: 'activity', group: 2 },
            { id: 'web-dev', label: 'Web Development', type: 'activity', group: 3 },
            { id: 'backend', label: 'Backend Systems', type: 'activity', group: 3 },
            { id: 'distributed', label: 'Distributed Systems', type: 'activity', group: 4 },
            { id: 'capstone', label: 'Capstone Project', type: 'activity', group: 5 },
            { id: 'learner', label: 'Eve Learner', type: 'agent', group: 6 }
        ],
        links: [
            { source: 'data-struct', target: 'intro', label: 'prerequisite', type: 'prereq' },
            { source: 'algorithms', target: 'data-struct', label: 'prerequisite', type: 'prereq' },
            { source: 'databases', target: 'intro', label: 'prerequisite', type: 'prereq' },
            { source: 'web-dev', target: 'intro', label: 'prerequisite', type: 'prereq' },
            { source: 'backend', target: 'databases', label: 'prerequisite', type: 'prereq' },
            { source: 'backend', target: 'web-dev', label: 'prerequisite', type: 'prereq' },
            { source: 'distributed', target: 'algorithms', label: 'prerequisite', type: 'prereq' },
            { source: 'distributed', target: 'backend', label: 'prerequisite', type: 'prereq' },
            { source: 'capstone', target: 'distributed', label: 'prerequisite', type: 'prereq' },
            { source: 'learner', target: 'intro', label: 'completed', type: 'completion' },
            { source: 'learner', target: 'data-struct', label: 'completed', type: 'completion' },
            { source: 'learner', target: 'databases', label: 'completed', type: 'completion' },
            { source: 'learner', target: 'web-dev', label: 'in progress', type: 'progress' }
        ]
    }
};

let currentDataset = 'learning-journey';
let simulation = null;
let svg = null;

const NODE_COLORS = {
    agent: '#50fa7b',
    statement: '#8be9fd',
    activity: '#ffb86c',
    competency: '#ff79c6',
    credential: '#bd93f9',
    group: '#f1fa8c',
    organization: '#6272a4',
    assertion: '#ff5555',
    proof: '#f8f8f2'
};

const LINK_COLORS = {
    actor: '#50fa7b',
    object: '#ffb86c',
    prov: '#ff79c6',
    hierarchy: '#6272a4',
    competency: '#bd93f9',
    membership: '#f1fa8c',
    completion: '#50fa7b',
    progress: '#8be9fd',
    teaches: '#ffb86c',
    hasCompetency: '#ff79c6',
    prereq: '#ff5555',
    subject: '#50fa7b',
    issuer: '#6272a4',
    proof: '#f8f8f2',
    verification: '#8be9fd'
};

/**
 * Initialize graph visualization
 */
function initGraph() {
    const select = document.getElementById('graph-dataset-select');

    if (select) {
        select.addEventListener('change', function() {
            currentDataset = this.value;
            renderGraph();
        });
    }

    // Initial render
    renderGraph();

    // Handle window resize
    window.addEventListener('resize', debounce(renderGraph, 250));
}

/**
 * Render the graph visualization
 */
function renderGraph() {
    const container = document.getElementById('graph-container');
    if (!container) return;

    const dataset = GRAPH_DATASETS[currentDataset];
    if (!dataset) return;

    // Clear previous
    container.innerHTML = '';

    // Update description
    const descDiv = document.getElementById('graph-description');
    if (descDiv) {
        descDiv.innerHTML = `<p>${dataset.description}</p>`;
    }

    // Check if D3 is available
    if (typeof d3 === 'undefined') {
        container.innerHTML = '<div class="graph-fallback"><p>D3.js not loaded. Graph visualization unavailable.</p></div>';
        return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // Create SVG
    svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);

    // Add arrow markers for links
    svg.append('defs').selectAll('marker')
        .data(['arrow'])
        .join('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('fill', '#6272a4')
        .attr('d', 'M0,-5L10,0L0,5');

    // Prepare data
    const nodes = dataset.nodes.map(d => ({...d}));
    const links = dataset.links.map(d => ({...d}));

    // Create simulation
    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));

    // Create link elements
    const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', d => LINK_COLORS[d.type] || '#6272a4')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow)');

    // Create link labels
    const linkLabel = svg.append('g')
        .attr('class', 'link-labels')
        .selectAll('text')
        .data(links)
        .join('text')
        .attr('class', 'link-label')
        .attr('fill', '#6272a4')
        .attr('font-size', '10px')
        .attr('text-anchor', 'middle')
        .text(d => d.label);

    // Create node elements
    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .call(drag(simulation));

    // Node circles
    node.append('circle')
        .attr('r', 15)
        .attr('fill', d => NODE_COLORS[d.type] || '#f8f8f2')
        .attr('stroke', '#282a36')
        .attr('stroke-width', 2);

    // Node labels
    node.append('text')
        .attr('dx', 20)
        .attr('dy', 5)
        .attr('fill', '#f8f8f2')
        .attr('font-size', '12px')
        .text(d => d.label);

    // Node tooltips
    node.append('title')
        .text(d => `${d.label} (${d.type})`);

    // Update positions on tick
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        linkLabel
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2);

        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Update legend
    updateLegend(dataset);
}

/**
 * Create drag behavior
 */
function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
}

/**
 * Update the legend
 */
function updateLegend(dataset) {
    const legend = document.getElementById('graph-legend');
    if (!legend) return;

    // Get unique node types
    const nodeTypes = [...new Set(dataset.nodes.map(n => n.type))];
    const linkTypes = [...new Set(dataset.links.map(l => l.type))];

    let html = '<div class="legend-section"><h4>Nodes</h4>';
    nodeTypes.forEach(type => {
        html += `
            <div class="legend-item">
                <span class="legend-color" style="background: ${NODE_COLORS[type] || '#f8f8f2'}"></span>
                <span class="legend-label">${type}</span>
            </div>
        `;
    });
    html += '</div>';

    html += '<div class="legend-section"><h4>Relationships</h4>';
    linkTypes.forEach(type => {
        html += `
            <div class="legend-item">
                <span class="legend-line" style="background: ${LINK_COLORS[type] || '#6272a4'}"></span>
                <span class="legend-label">${type}</span>
            </div>
        `;
    });
    html += '</div>';

    html += `
        <div class="legend-section vanilla-note">
            <h4>Vanilla xAPI</h4>
            <p>Would show isolated statements only. No semantic links, no provenance chains, no visual relationships.</p>
        </div>
    `;

    legend.innerHTML = html;
}

/**
 * Debounce helper
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
