# HD-XAPI: Semantic Experience API Specification

**Version:** 1.0.0-draft
**Status:** Reference Implementation
**License:** MIT

## Abstract

HD-XAPI (High-Definition Experience API) is a semantic web extension of the xAPI (Experience API / Tin Can) specification that leverages OWL ontologies, SHACL shapes, SKOS vocabularies, and linked data principles to create a fully interoperable, validatable, and policy-governed learning data ecosystem.

## Table of Contents

1. [Introduction](#1-introduction)
2. [Design Principles](#2-design-principles)
3. [Named Graph Architecture](#3-named-graph-architecture)
4. [Core Ontology](#4-core-ontology)
5. [Profile System](#5-profile-system)
6. [Validation & Inference](#6-validation--inference)
7. [API Layer](#7-api-layer)
8. [Policy Framework](#8-policy-framework)
9. [Credential Integration](#9-credential-integration)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. Introduction

### 1.1 Background

The Experience API (xAPI) defines a JSON-based format for learning activity statements. While powerful, the original specification lacks:

- Formal semantic definitions (ontology)
- Machine-readable validation constraints
- Inference capabilities for derived facts
- Policy-based access control
- Verifiable credential integration

HD-XAPI addresses these gaps by providing a complete semantic stack.

### 1.2 Goals

1. **Interoperability**: Enable seamless data exchange between LRS implementations
2. **Validation**: Provide machine-readable constraints for statement validation
3. **Inference**: Derive implicit facts (PROV links, competency assertions)
4. **Governance**: Apply data policies at appropriate boundaries
5. **Trust**: Integrate verifiable credentials for non-repudiation

### 1.3 Scope

This specification covers:

- OWL ontology for xAPI core concepts
- SHACL shapes for validation and inference
- SKOS vocabularies for profiles
- Hydra API documentation
- ODRL policies for data governance
- VC/DID integration for credentials

---

## 2. Design Principles

### 2.1 Separation of Concerns

Each aspect of the system lives in a dedicated named graph:

| Graph | Content | Update Frequency |
|-------|---------|------------------|
| Ontology | OWL class/property definitions | Rare (versioned) |
| Profile Vocab | SKOS concepts (verbs, activity types) | Occasional |
| Profile Shapes | SHACL constraints + rules | Per profile version |
| Runtime Data | Statements, agents, activities | Continuous |
| API Docs | Hydra operations | Per deployment |
| Policies | ODRL rules | Per governance decision |
| Credentials | VCs, DIDs, proofs | Per issuance |

### 2.2 Validation at Boundaries

- **Ingest**: Validate against profile shapes
- **Storage**: Apply inference rules
- **Export**: Enforce ODRL policies (anonymization, filtering)

### 2.3 Progressive Enhancement

Start minimal, add complexity only where needed:

1. Core ontology + basic shapes (MVP)
2. Profile vocabularies (interoperability)
3. Inference rules (analytics)
4. Policies (compliance)
5. Credentials (trust)

---

## 3. Named Graph Architecture

### 3.1 Graph URIs

```
Base: https://example.org/xapi/

Graphs:
  /ontology          - Core OWL ontology
  /vocab/verbs       - SKOS verb concepts
  /vocab/activities  - SKOS activity type concepts
  /vocab/extensions  - Extension definitions
  /shapes/core       - Core SHACL shapes
  /shapes/{profile}  - Profile-specific shapes
  /data/statements   - Runtime statement data
  /data/agents       - Agent registry
  /data/activities   - Activity registry
  /api               - Hydra API documentation
  /policies          - ODRL policies
  /credentials       - VC/DID documents
```

### 3.2 Graph Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                     CREDENTIALS GRAPH                        │
│                    (VC/DID documents)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      POLICY GRAPH                            │
│                    (ODRL policies)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API GRAPH                              │
│                  (Hydra operations)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RUNTIME DATA GRAPH                        │
│              (Statements, Agents, Activities)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SHAPES GRAPH                            │
│              (SHACL constraints + rules)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      VOCAB GRAPH                             │
│           (SKOS verbs, activity types, extensions)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ONTOLOGY GRAPH                            │
│                (OWL class definitions)                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 SPARQL Dataset Configuration

```turtle
# Example Fuseki configuration
:dataset a ja:RDFDataset ;
    ja:defaultGraph [ ja:graphName <https://example.org/xapi/data/statements> ] ;
    ja:namedGraph [ ja:graphName <https://example.org/xapi/ontology> ;
                    ja:graph <file:ontology/xapi-core.owl.ttl> ] ;
    ja:namedGraph [ ja:graphName <https://example.org/xapi/shapes/core> ;
                    ja:graph <file:shapes/xapi-profile.shapes.ttl> ] .
```

---

## 4. Core Ontology

### 4.1 Namespace

```turtle
@prefix xapi: <https://w3id.org/xapi/ontology#> .
```

### 4.2 Core Classes

| Class | Description | xAPI Equivalent |
|-------|-------------|-----------------|
| `xapi:Statement` | Learning activity record | Statement |
| `xapi:Actor` | Entity performing activity | Actor |
| `xapi:Agent` | Individual actor | Agent |
| `xapi:Group` | Collection of agents | Group |
| `xapi:Verb` | Action performed | Verb |
| `xapi:Activity` | Object of the action | Activity (object) |
| `xapi:Result` | Outcome of the action | Result |
| `xapi:Context` | Situational information | Context |
| `xapi:Authority` | Statement asserter | Authority |
| `xapi:Attachment` | Supporting documents | Attachments |

### 4.3 Key Properties

| Property | Domain | Range | Description |
|----------|--------|-------|-------------|
| `xapi:actor` | Statement | Actor | Who did it |
| `xapi:verb` | Statement | Verb | What they did |
| `xapi:object` | Statement | Activity/Agent/Statement | To what |
| `xapi:result` | Statement | Result | Outcome |
| `xapi:context` | Statement | Context | Situational info |
| `xapi:timestamp` | Statement | xsd:dateTime | When |
| `xapi:stored` | Statement | xsd:dateTime | When stored |
| `xapi:authority` | Statement | Agent | Who asserts |
| `xapi:id` | Statement | xsd:string | UUID |

### 4.4 Alignments

The ontology aligns with:

- **PROV-O**: `xapi:Statement` → `prov:Activity`
- **FOAF**: `xapi:Agent` → `foaf:Agent`
- **SKOS**: Verb/Activity vocabularies
- **Schema.org**: Course, Organization mappings

---

## 5. Profile System

### 5.1 Profile Structure

Each xAPI profile provides:

1. **Vocabulary** (SKOS): Verbs, activity types, extensions
2. **Shapes** (SHACL): Validation constraints
3. **Rules** (SHACL): Inference rules
4. **Metadata** (DCAT): Discovery information

### 5.2 Profile Registry

Profiles are discoverable via DCAT catalog:

```turtle
:profileCatalog a dcat:Catalog ;
    dcterms:title "xAPI Profile Registry" ;
    dcat:dataset :cmiProfile, :scormProfile, :tlaProfile .

:cmiProfile a dcat:Dataset ;
    dcterms:identifier "https://w3id.org/xapi/cmi5" ;
    dcterms:title "cmi5 Profile" ;
    dcat:distribution [
        dcat:accessURL <https://example.org/xapi/shapes/cmi5> ;
        dcterms:format "text/turtle"
    ] .
```

### 5.3 Profile Validation Flow

```
Incoming Statement
        │
        ▼
┌───────────────────┐
│ Identify Profile  │ (from context.contextActivities.category)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Load Profile      │ (shapes + vocab)
│ Shapes            │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ SHACL Validate    │
└───────────────────┘
        │
        ├── VALID ──────► Store + Apply Rules
        │
        └── INVALID ────► Return 400 + Violations
```

---

## 6. Validation & Inference

### 6.1 SHACL Validation

Core shapes validate:

- Required properties (actor, verb, object)
- Value types (IRI, literal, nested structure)
- Cardinality constraints
- Profile-specific requirements

### 6.2 SHACL-AF Rules

Inference rules generate:

1. **PROV Links**: Statement → prov:Activity chain
2. **Registration Joins**: Link statements by registration UUID
3. **Competency Assertions**: Derive mastery from results
4. **Activity Aggregations**: Roll up to parent activities

### 6.3 Example Rule: PROV Generation

```turtle
:ProvActivityRule a sh:NodeShape ;
    sh:target [ a sh:SPARQLTarget ;
        sh:select """
            SELECT ?this WHERE {
                ?this a xapi:Statement .
                FILTER NOT EXISTS { ?this prov:generated ?any }
            }
        """ ] ;
    sh:rule [
        a sh:SPARQLRule ;
        sh:construct """
            CONSTRUCT {
                ?this a prov:Activity ;
                    prov:wasAssociatedWith ?actor ;
                    prov:used ?object ;
                    prov:endedAtTime ?timestamp .
            } WHERE {
                ?this xapi:actor ?actor ;
                      xapi:object ?object ;
                      xapi:timestamp ?timestamp .
            }
        """
    ] .
```

---

## 7. API Layer

### 7.1 Hydra Documentation

The LRS API is documented using Hydra:

```json-ld
{
  "@context": "http://www.w3.org/ns/hydra/context.jsonld",
  "@id": "https://example.org/xapi/api",
  "@type": "ApiDocumentation",
  "title": "HD-XAPI LRS API",
  "entryPoint": "https://example.org/xapi/",
  "supportedClass": [
    {
      "@id": "xapi:Statement",
      "supportedOperation": [
        {
          "@type": "Operation",
          "method": "POST",
          "expects": "xapi:Statement",
          "returns": "xsd:string"
        }
      ]
    }
  ]
}
```

### 7.2 Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/statements` | GET/POST/PUT | Statement resource |
| `/agents` | GET | Agent query |
| `/activities` | GET | Activity query |
| `/agents/profile` | GET/POST/PUT/DELETE | Agent profile |
| `/activities/profile` | GET/POST/PUT/DELETE | Activity profile |
| `/activities/state` | GET/POST/PUT/DELETE | Activity state |
| `/about` | GET | LRS information |

### 7.3 Content Negotiation

| Accept Header | Response Format |
|---------------|-----------------|
| `application/json` | xAPI JSON |
| `application/ld+json` | JSON-LD |
| `text/turtle` | Turtle RDF |
| `application/n-triples` | N-Triples |

---

## 8. Policy Framework

### 8.1 ODRL Integration

Policies are expressed in ODRL and enforced at export boundaries:

```turtle
:exportPolicy a odrl:Policy ;
    odrl:permission [
        odrl:action odrl:read ;
        odrl:target :statementsCollection ;
        odrl:constraint [
            odrl:leftOperand :isAnonymized ;
            odrl:operator odrl:eq ;
            odrl:rightOperand true
        ]
    ] .
```

### 8.2 Policy Types

| Policy | Enforcement Point | Purpose |
|--------|-------------------|---------|
| Retention | Background job | Data lifecycle |
| Anonymization | Export | Privacy compliance |
| Access Control | Query | Authorization |
| Rate Limiting | Ingest | Resource protection |

### 8.3 Anonymization Flow

```
Export Request
      │
      ▼
┌─────────────────┐
│ Load Policy     │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Check Constraint│ (isAnonymized required?)
└─────────────────┘
      │
      ├── NO ────────► Return raw data
      │
      └── YES ───────► Apply anonymization
                              │
                              ▼
                       ┌─────────────────┐
                       │ Hash identifiers│
                       │ Remove PII      │
                       │ Generalize dates│
                       └─────────────────┘
                              │
                              ▼
                       Return anonymized data
```

---

## 9. Credential Integration

### 9.1 Use Cases

| Entity | Credential Type | Purpose |
|--------|-----------------|---------|
| Learner | DID | Portable identity |
| Instructor | VC (Role) | Authority assertion |
| Tool | VC (Client) | OAuth replacement |
| Achievement | VC (Badge) | Portable credential |
| Roster | VC (Membership) | Group membership |

### 9.2 DID Integration

Agents can be identified by DID:

```json
{
  "actor": {
    "objectType": "Agent",
    "account": {
      "homePage": "did:web:example.org",
      "name": "did:web:example.org:users:alice"
    }
  }
}
```

### 9.3 Verifiable Credentials

Achievements can be issued as VCs:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/xapi/ontology"
  ],
  "type": ["VerifiableCredential", "xapi:Achievement"],
  "issuer": "did:web:example.org",
  "credentialSubject": {
    "id": "did:web:example.org:users:alice",
    "achievement": {
      "type": "xapi:Activity",
      "id": "https://example.org/courses/intro-python",
      "name": "Introduction to Python"
    },
    "result": {
      "score": { "scaled": 0.95 },
      "completion": true,
      "success": true
    }
  },
  "proof": { ... }
}
```

---

## 10. Implementation Guide

### 10.1 Minimal Implementation (MVP)

**Phase 1: Core (Week 1-2)**
1. Deploy triplestore (Fuseki, GraphDB, etc.)
2. Load `xapi-core.owl.ttl`
3. Load `xapi-profile.shapes.ttl`
4. Implement statement POST with SHACL validation

**Phase 2: Profiles (Week 3-4)**
1. Add SKOS vocabularies for verbs/activities
2. Implement profile-based validation routing
3. Add DCAT profile registry

**Phase 3: Inference (Week 5-6)**
1. Enable SHACL-AF rule execution
2. Implement PROV link generation
3. Add registration/launch joins

### 10.2 Full Implementation

**Phase 4: API (Week 7-8)**
1. Add Hydra documentation
2. Implement content negotiation
3. Add SPARQL endpoint

**Phase 5: Policies (Week 9-10)**
1. Add ODRL policy graph
2. Implement export filtering
3. Add anonymization transforms

**Phase 6: Credentials (Week 11-12)**
1. Add DID resolution
2. Implement VC issuance
3. Add proof verification

### 10.3 File Reference

| File | Purpose |
|------|---------|
| `ontology/xapi-core.owl.ttl` | Core OWL ontology |
| `shapes/xapi-profile.shapes.ttl` | SHACL shapes + rules |
| `shapes/tla.shapes.ttl` | TLA profile shapes |
| `ontology/tla.owl.ttl` | TLA ontology extensions |
| `examples/hydra-api.jsonld` | Hydra API documentation |
| `examples/odrl-policies.ttl` | ODRL policy examples |
| `examples/credentials.jsonld` | VC/DID examples |
| `config/graphs.trig` | Named graph configuration |

---

## Appendix A: Namespace Prefixes

```turtle
@prefix xapi:    <https://w3id.org/xapi/ontology#> .
@prefix xapi-v:  <https://w3id.org/xapi/vocab/> .
@prefix tla:     <https://w3id.org/xapi/tla#> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix shacl:   <http://www.w3.org/ns/shacl#> .
@prefix hydra:   <http://www.w3.org/ns/hydra/core#> .
@prefix odrl:    <http://www.w3.org/ns/odrl/2/> .
@prefix dcat:    <http://www.w3.org/ns/dcat#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix foaf:    <http://xmlns.com/foaf/0.1/> .
@prefix schema:  <http://schema.org/> .
@prefix vc:      <https://www.w3.org/2018/credentials#> .
@prefix did:     <https://www.w3.org/ns/did#> .
```

## Appendix B: Conformance Levels

| Level | Requirements |
|-------|--------------|
| **Level 1: Core** | OWL ontology + basic SHACL validation |
| **Level 2: Profiles** | SKOS vocabularies + profile routing |
| **Level 3: Inference** | SHACL-AF rules + PROV generation |
| **Level 4: API** | Hydra documentation + content negotiation |
| **Level 5: Governance** | ODRL policies + anonymization |
| **Level 6: Trust** | VC/DID integration + proofs |

---

*Specification Version: 1.0.0-draft*
*Last Updated: 2026-01-07*
