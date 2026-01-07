# HD-XAPI Playground

A browser-based playground for validating and exploring xAPI statements with semantic web capabilities.

## Features

- **Statement Validator**: Validate xAPI statements against structural rules
- **Ontology Explorer**: Browse the xAPI and TLA ontology classes and properties
- **Example Statements**: Pre-built examples including core xAPI and TLA profile statements
- **RDF Conversion**: Convert statements to Turtle, N-Triples, or JSON-LD
- **Fully Client-Side**: Runs entirely in the browser, no server required

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

- **CodeMirror**: Syntax highlighting editor
- **N3.js**: RDF parsing and serialization
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
