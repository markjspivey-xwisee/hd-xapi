# Source-qualified informational records

The playground now executes one bounded JSON-to-RDF adapter. Convert to RDF and
Project record both use the same implementation; Turtle, N-Triples and expanded
JSON-LD serialize the same graph. No source record is uploaded to a service.

The HD ontology at model commit
`b7a1e64f468109305fd0acce453d0c2480826811` declares its
`https://w3id.org/xapi/ontology#Statement` a `prov:Activity`. Its ontology version
is `https://w3id.org/xapi/ontology/1.0.0`. This is a source-specific interpretation;
the same term IRI is also used by ADL's different ontology. A shared label or IRI
does not authorize combining those models or globally equating their classes.

The adapter keeps three identities separate:

- The original HD activity keeps its statement UUID as `urn:uuid:…`, or an
  explicitly supplied absolute `@id`. It retains its HD Statement/PROV Activity
  types and the existing actor, verb, object, timestamp and result assertions.
- A separate deterministic informational record has the exact type
  `https://foxxi-bridge.interego.xwisee.com/ns/xapi#Statement` and `prov:Entity`.
  `schema:about` links it to the original activity. It is an explicit record
  projection over whole JSON, never a type alias for arbitrary legacy RDF.
- A separate source-JSON `prov:Entity` preserves the supplied JSON text exactly
  as `rdf:value`, with media type `application/json`. The record is derived from
  this entity. Deriving it from the activity with `prov:wasDerivedFrom` would
  incorrectly impose PROV Entity on the activity through that property's range.

The source model/version and exact ontology file at that model commit are cited.
The target model release is Foxxi `2026.10.1`; it is distinct from an input's
xAPI protocol `version`, which is preserved separately, including `1.0.3`.
Neither the original JSON's `@context` nor arbitrary caller model metadata is
loaded or trusted. Source `@context` remains literal content inside the payload.

Record identity is a SHA-256 over sorted-key JSON values. The source entity hashes
the exact supplied text; reformatting JSON can change the source-text entity
without changing the record's semantic identity. ID-less examples get a
deterministic content-derived activity IRI, explicitly without claiming that an
LRS assigned a statement UUID. Conflicting `id`/`@id` values are refused.

This adapter requires a complete JSON actor, verb and object. Supported actor
identifiers include mailbox, OpenID, account, mailbox hash and anonymous groups
with member agents. The bounded object projection supports Activity and
StatementRef; Agent, Group and SubStatement objects are refused. Other source
fields and extensions remain available in the preserved JSON instead of being
silently dropped. This is not a full Foxxi JSON-LD/SHACL-conformance claim.

The browser's Validate button runs structural JavaScript checks, not a SHACL
engine. Project record executes the record adapter; it no longer displays canned
competency, completion or credential facts as if SHACL-AF had generated them.
The other ontology rules remain specifications requiring a separate engine.
An asserted source result is retained as input data, never promoted to learner
competency or credential eligibility by this adapter.

`npm ci --ignore-scripts && npm test` exercises the actual exporters and browser
conversion handler, three-format RDF parity, source fidelity, deterministic
identity and refusal cases. Current I2IDL-X classification is a separate consumer
boundary: its source-qualified Foxxi Statement bridge can classify the separate
record as canonical `xapi-statement` and `learning-record`, with Hypothetical
classification output. The legacy activity must receive neither classification.
Bare legacy classes, foreign same-name classes and aboutness alone do not supply
that record bridge. No canonical glossary adoption or universal xAPI certification
is implied.
