# CLAUDE.md - AI Assistant Guidelines for HD-XAPI

This document provides guidance for AI assistants (like Claude) working on this codebase.

## Project Overview

**Repository:** HD-XAPI (High-Definition Experience API)
**License:** MIT
**Status:** Reference Implementation

HD-XAPI is a semantic web extension of the xAPI (Experience API / Tin Can) specification. It provides a complete semantic stack including OWL ontologies, SHACL validation shapes, SKOS vocabularies, Hydra API documentation, ODRL policies, and Verifiable Credential integration.

### Key Features

- **OWL Ontology**: Formal semantic definitions for xAPI concepts
- **SHACL Validation**: Machine-readable constraints for statement validation
- **SHACL-AF Rules**: Inference rules for generating PROV links, registration joins
- **Hydra API**: Self-describing REST API documentation
- **ODRL Policies**: Data governance at export boundaries
- **VC/DID Integration**: Verifiable credentials for trust and portability
- **TLA Profile**: Total Learning Architecture competency-based learning support

## Repository Structure

```
hd-xapi/
├── LICENSE                           # MIT License
├── CLAUDE.md                         # AI assistant guidelines (this file)
├── SPECIFICATION.md                  # Full specification document
├── ARCHITECTURE.md                   # Reference architecture
├── ontology/
│   ├── xapi-core.owl.ttl            # Core xAPI OWL ontology
│   └── tla.owl.ttl                  # TLA extension ontology
├── shapes/
│   ├── xapi-profile.shapes.ttl      # Core SHACL shapes + inference rules
│   └── tla.shapes.ttl               # TLA profile shapes + rules
├── examples/
│   ├── hydra-api.jsonld             # Hydra API documentation
│   ├── odrl-policies.ttl            # ODRL policy examples
│   └── credentials.jsonld           # VC/DID examples
└── config/
    └── graphs.trig                  # Named graph deployment configuration
```

## Technology Stack

### Semantic Web Standards

| Standard | Purpose | Files |
|----------|---------|-------|
| OWL 2 | Ontology definitions | `ontology/*.ttl` |
| SHACL | Validation & inference | `shapes/*.ttl` |
| SKOS | Vocabularies (verbs, activity types) | Embedded in ontology |
| SPARQL | Query language | Used at runtime |
| Hydra | API documentation | `examples/hydra-api.jsonld` |
| ODRL | Data policies | `examples/odrl-policies.ttl` |
| VC/DID | Credentials | `examples/credentials.jsonld` |

### Namespaces

```turtle
@prefix xapi:    <https://w3id.org/xapi/ontology#> .
@prefix tla:     <https://w3id.org/xapi/tla#> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix hydra:   <http://www.w3.org/ns/hydra/core#> .
@prefix odrl:    <http://www.w3.org/ns/odrl/2/> .
```

## Named Graph Architecture

The system uses 7 named graphs for separation of concerns:

| Graph | URI Pattern | Purpose |
|-------|-------------|---------|
| Ontology | `/ontology` | OWL class/property definitions |
| Vocab | `/vocab/*` | SKOS concepts |
| Shapes | `/shapes/*` | SHACL constraints + rules |
| Data | `/data/*` | Runtime statements, agents, activities |
| API | `/api` | Hydra documentation |
| Policies | `/policies` | ODRL rules |
| Credentials | `/credentials` | VCs, DIDs, proofs |

## Development Workflow

### Getting Started

1. Clone the repository
2. Set up a triplestore (Apache Jena Fuseki, GraphDB, Stardog)
3. Load ontology and shapes:
   ```bash
   # For Fuseki
   ./tdbloader2 --loc=/path/to/db ontology/*.ttl shapes/*.ttl
   ```
4. Load the named graph configuration:
   ```bash
   ./tdbloader2 --loc=/path/to/db config/graphs.trig
   ```

### Validation Testing

Test SHACL validation against the shapes:

```bash
# Using pyshacl
pyshacl -s shapes/xapi-profile.shapes.ttl -df turtle data.ttl

# Using TopBraid SHACL
java -jar shacl-*.jar validate -s shapes/xapi-profile.shapes.ttl -d data.ttl
```

### Branch Naming Convention

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Claude/AI work: `claude/<description>-<session-id>`
- Profile additions: `profile/<profile-name>`

### Commit Messages

Follow conventional commit format:
- `feat:` New ontology classes, shapes, or profiles
- `fix:` Bug fixes in shapes or ontology
- `docs:` Documentation changes
- `refactor:` Restructuring without changing semantics
- `test:` Test additions/changes

## Key Files Reference

| File | Purpose |
|------|---------|
| `SPECIFICATION.md` | Complete specification with all details |
| `ARCHITECTURE.md` | Reference architecture and deployment patterns |
| `ontology/xapi-core.owl.ttl` | Core OWL ontology (Statement, Actor, Verb, etc.) |
| `ontology/tla.owl.ttl` | TLA extensions (Competency, LearningPath, etc.) |
| `shapes/xapi-profile.shapes.ttl` | Core SHACL shapes + PROV inference rules |
| `shapes/tla.shapes.ttl` | TLA shapes + competency inference rules |
| `examples/hydra-api.jsonld` | Hydra API documentation |
| `examples/odrl-policies.ttl` | ODRL policy examples (anonymization, access control) |
| `examples/credentials.jsonld` | VC/DID examples (achievements, roles, tools) |
| `config/graphs.trig` | Named graph deployment configuration |

## Code Conventions

### Turtle File Style

1. **Prefixes**: Always declare at top, alphabetically sorted
2. **URIs**: Use established namespaces where possible
3. **Labels**: Always include `rdfs:label` and `rdfs:comment`
4. **Language tags**: Use language-tagged strings for human-readable text

```turtle
# Good example
:MyClass rdf:type owl:Class ;
    rdfs:label "My Class"@en ;
    rdfs:comment "A descriptive comment about MyClass."@en ;
    rdfs:isDefinedBy <https://w3id.org/xapi/ontology> .
```

### SHACL Shape Conventions

1. **Shape naming**: Use `{ClassName}Shape` pattern
2. **Property paths**: Use property shapes for all constraints
3. **Messages**: Always include `sh:message` for user feedback
4. **Severity**: Default to `sh:Violation` for required fields

### JSON-LD Conventions

1. **Context**: Always include full context declarations
2. **IDs**: Use full IRIs for `@id` properties
3. **Types**: Explicitly declare `@type` for all objects

## Common Tasks for AI Assistants

### Adding a New Profile

1. Create `ontology/{profile}.owl.ttl` for profile-specific classes
2. Create `shapes/{profile}.shapes.ttl` for validation shapes
3. Add profile to DCAT catalog in `config/graphs.trig`
4. Update `SPECIFICATION.md` with profile documentation

### Adding a New Verb

1. Add SKOS concept to vocab graph in `config/graphs.trig`
2. Include `xapi:verbId` IRI
3. Add `skos:prefLabel` and `skos:definition`

### Adding a SHACL Rule

1. Add NodeShape with `sh:target` (SPARQLTarget for complex)
2. Define `sh:rule` with SPARQLRule or TripleRule
3. Test with sample data to verify inference

### Modifying ODRL Policies

1. Understand policy structure: Permission, Prohibition, Duty
2. Use appropriate Operands and Operators
3. Define custom operands if needed
4. Test policy evaluation logic

## Environment Setup

### Required Tools

- Git
- Triplestore (Fuseki, GraphDB, Stardog)
- SHACL engine (pyshacl, TopBraid SHACL)
- Turtle/JSON-LD editor (Protégé, VS Code with extensions)

### Recommended VS Code Extensions

- `stardog-union.stardog-rdf-grammars` - RDF syntax highlighting
- `vscode-jsonld` - JSON-LD support

## API Endpoints (Reference)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/statements` | GET/POST/PUT | Statement resource |
| `/agents` | GET | Agent query |
| `/activities` | GET | Activity query |
| `/agents/profile` | GET/POST/PUT/DELETE | Agent profile |
| `/activities/profile` | GET/POST/PUT/DELETE | Activity profile |
| `/activities/state` | GET/POST/PUT/DELETE | Activity state |
| `/about` | GET | LRS information |
| `/profiles` | GET | Profile registry (DCAT) |
| `/sparql` | GET/POST | SPARQL endpoint |

## Troubleshooting

### SHACL Validation Fails

1. Check that all required prefixes are declared
2. Verify shape targets are correctly defined
3. Test with minimal data to isolate the issue

### Ontology Import Errors

1. Ensure all imported ontologies are accessible
2. Check for circular imports
3. Verify namespace consistency

### Named Graph Issues

1. Confirm triplestore supports named graphs
2. Verify graph URIs match configuration
3. Check SPARQL queries specify correct graph

## Implementation Priorities

For those implementing this specification:

1. **Phase 1 (Core)**: OWL ontology + basic SHACL validation
2. **Phase 2 (Profiles)**: SKOS vocabularies + profile routing
3. **Phase 3 (Inference)**: SHACL-AF rules + PROV generation
4. **Phase 4 (API)**: Hydra documentation + content negotiation
5. **Phase 5 (Governance)**: ODRL policies + anonymization
6. **Phase 6 (Trust)**: VC/DID integration + proofs

---

*Last Updated: 2026-01-07*
*Maintainer: markjspivey-xwisee*
