# HD-XAPI Playground

A browser-based playground for validating and exploring xAPI statements with semantic web capabilities. Showcases the power of HD-XAPI over vanilla xAPI.

## Features

### Core Features
- **Statement Validator**: Validate xAPI statements against structural rules
- **Ontology Explorer**: Browse the xAPI and TLA ontology classes and properties
- **Example Statements**: Pre-built examples including core xAPI and TLA profile statements
- **RDF Conversion**: Convert statements to Turtle, N-Triples, or JSON-LD
- **Fully Client-Side**: Runs entirely in the browser, no server required

### Advanced Demo Features

- **Live Inference Demo**: See how SHACL-AF rules automatically generate derived facts (PROV links, competency assertions, activity rollups) - impossible with vanilla xAPI
- **SPARQL Query Playground**: Run powerful semantic queries with 6 pre-built examples showing queries that are impossible with vanilla xAPI's limited filtering
- **Side-by-Side Comparison**: Compare vanilla xAPI vs HD-XAPI approaches for real scenarios (prerequisite checking, competency assertion, learning path progress, team analytics)
- **ODRL Anonymization Demo**: See how ODRL policies automatically anonymize data at export boundaries with 4 policy types (research export, GDPR compliance, aggregate only, internal audit)
- **Visual Graph Explorer**: Interactive D3.js force-directed graph visualization of semantic relationships between statements, activities, agents, and competencies

## Live Demo

Visit: https://markjspivey-xwisee.github.io/hd-xapi/playground/

## Local Development

Simply open `index.html` in a browser, or use a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .
```

Then visit http://localhost:8000

## Technology

- **CodeMirror**: Syntax highlighting editor for JSON and SPARQL
- **N3.js**: RDF parsing and serialization
- **D3.js**: Force-directed graph visualization
- **Pure JavaScript**: No framework dependencies

## Validation

The playground validates:

- Required properties (actor, verb, object)
- IFI (Inverse Functional Identifier) requirements
- UUID formats
- Score constraints (-1 to 1 for scaled)
- ISO 8601 timestamps and durations
- Language map structures
- Attachment requirements

## Example Categories

- **Core**: Basic xAPI statements (completion, assessment, video)
- **TLA**: Total Learning Architecture statements (competency, credential)
- **Invalid**: Intentionally invalid statements for testing

## License

MIT
