# HD-XAPI Reference Architecture

## Overview

This document describes the reference architecture for HD-XAPI, a semantic web-based implementation of the Experience API (xAPI) specification.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   LMS/LXP   │  │   Content   │  │  Analytics  │  │  Admin UI   │        │
│  │   Clients   │  │   Tools     │  │  Dashboard  │  │             │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  Authentication │  │  Rate Limiting  │  │  Content Negot. │              │
│  │  (OAuth/DID)    │  │                 │  │  (JSON/RDF)     │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         LRS SERVICE                                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │ │
│  │  │  Statement   │  │   Profile    │  │   State      │                  │ │
│  │  │  Processor   │  │   Manager    │  │   Manager    │                  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  VALIDATION      │  │  INFERENCE       │  │  POLICY          │          │
│  │  SERVICE         │  │  ENGINE          │  │  ENGINE          │          │
│  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │          │
│  │  │   SHACL    │  │  │  │  SHACL-AF  │  │  │  │   ODRL     │  │          │
│  │  │  Validator │  │  │  │   Rules    │  │  │  │  Evaluator │  │          │
│  │  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                                 │
│  │  CREDENTIAL      │  │  PROFILE         │                                 │
│  │  SERVICE         │  │  REGISTRY        │                                 │
│  │  ┌────────────┐  │  │  ┌────────────┐  │                                 │
│  │  │  VC/DID    │  │  │  │   DCAT     │  │                                 │
│  │  │  Handler   │  │  │  │  Catalog   │  │                                 │
│  │  └────────────┘  │  │  └────────────┘  │                                 │
│  └──────────────────┘  └──────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      TRIPLESTORE (Named Graphs)                         │ │
│  │                                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │ │
│  │  │  ONTOLOGY    │  │   VOCAB      │  │   SHAPES     │                   │ │
│  │  │   GRAPH      │  │   GRAPH      │  │   GRAPH      │                   │ │
│  │  │              │  │              │  │              │                   │ │
│  │  │  xapi-core   │  │  SKOS verbs  │  │  SHACL       │                   │ │
│  │  │  .owl.ttl    │  │  activities  │  │  constraints │                   │ │
│  │  │              │  │  extensions  │  │  + rules     │                   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                   │ │
│  │                                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │ │
│  │  │   DATA       │  │    API       │  │   POLICY     │                   │ │
│  │  │   GRAPH      │  │   GRAPH      │  │   GRAPH      │                   │ │
│  │  │              │  │              │  │              │                   │ │
│  │  │  Statements  │  │  Hydra docs  │  │  ODRL        │                   │ │
│  │  │  Agents      │  │  Operations  │  │  policies    │                   │ │
│  │  │  Activities  │  │              │  │              │                   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                   │ │
│  │                                                                          │ │
│  │  ┌──────────────┐                                                        │ │
│  │  │ CREDENTIAL   │                                                        │ │
│  │  │   GRAPH      │                                                        │ │
│  │  │              │                                                        │ │
│  │  │  VCs, DIDs   │                                                        │ │
│  │  │  Proofs      │                                                        │ │
│  │  └──────────────┘                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. API Gateway

**Responsibilities:**
- Authentication via OAuth 2.0 or DID-based auth
- Rate limiting and throttling
- Content negotiation (JSON ↔ RDF)
- Request routing

**Technologies:**
- Kong, NGINX, or custom gateway
- OAuth 2.0 / OpenID Connect
- DID Authentication

### 2. LRS Service

**Statement Processor:**
- Receives xAPI statements
- Validates statement structure
- Generates UUIDs if not provided
- Sets stored timestamp

**Profile Manager:**
- Handles agent/activity profile documents
- Supports merge semantics
- Enforces concurrency (ETags)

**State Manager:**
- Manages activity state documents
- Supports registration-scoped state
- Handles state conflicts

### 3. Validation Service

**SHACL Validator:**
- Loads shapes from profile graph
- Validates statements against constraints
- Returns validation report

```
Input: Statement JSON
          │
          ▼
    ┌─────────────┐
    │ JSON → RDF  │
    │ Conversion  │
    └─────────────┘
          │
          ▼
    ┌─────────────┐
    │ Load Profile│
    │ Shapes      │
    └─────────────┘
          │
          ▼
    ┌─────────────┐
    │ SHACL       │
    │ Validate    │
    └─────────────┘
          │
          ├── Valid ───► Continue
          │
          └── Invalid ──► Return 400 + Report
```

### 4. Inference Engine

**SHACL-AF Rules:**
- Triggered post-validation
- Generates derived triples
- Maintains materialized views

**Rule Categories:**

| Rule Type | Input | Output |
|-----------|-------|--------|
| PROV Generation | Statement | prov:Activity links |
| Registration Join | Statements with same registration | reg:memberOf links |
| Competency Inference | Result with success | Competency assertions |
| Activity Rollup | Child activities | Parent aggregations |

### 5. Policy Engine

**ODRL Evaluator:**
- Loads policies from policy graph
- Evaluates constraints at export
- Applies transformations

**Export Pipeline:**

```
Export Request
      │
      ▼
┌─────────────┐
│ Load Policy │
└─────────────┘
      │
      ▼
┌─────────────┐     ┌─────────────────┐
│ Evaluate    │────►│ Constraints:    │
│ Constraints │     │ - isAnonymized  │
└─────────────┘     │ - hasConsent    │
      │             │ - dateRange     │
      ▼             └─────────────────┘
┌─────────────┐
│ Apply       │
│ Transform   │
└─────────────┘
      │
      ▼
   Response
```

### 6. Credential Service

**VC/DID Handler:**
- Resolves DID documents
- Verifies credential proofs
- Issues achievement VCs

**Integration Points:**
- Agent identification (DID as account)
- Authority verification (VC roles)
- Achievement issuance (VC badges)

### 7. Profile Registry

**DCAT Catalog:**
- Lists available profiles
- Provides profile metadata
- Links to profile shapes/vocab

## Data Flow

### Statement Ingestion

```
1. Client POSTs statement
         │
         ▼
2. Gateway authenticates
         │
         ▼
3. Gateway routes to LRS
         │
         ▼
4. LRS identifies profile (from context.category)
         │
         ▼
5. Validation service validates against profile shapes
         │
         ├── Invalid → Return 400
         │
         ▼
6. LRS stores statement in data graph
         │
         ▼
7. Inference engine applies rules
         │
         ▼
8. Return 200 + statement ID
```

### Statement Query

```
1. Client GETs statements with filters
         │
         ▼
2. Gateway authenticates
         │
         ▼
3. LRS builds SPARQL query
         │
         ▼
4. Triplestore executes query
         │
         ▼
5. Policy engine evaluates export policies
         │
         ├── Anonymization required?
         │   └── Yes → Apply transforms
         │
         ▼
6. Content negotiation (JSON/RDF)
         │
         ▼
7. Return statements
```

## Named Graph Layout

### Graph URIs

| Graph | URI Pattern | Contents |
|-------|-------------|----------|
| Ontology | `{base}/ontology` | OWL classes, properties |
| Core Vocab | `{base}/vocab/core` | Core SKOS concepts |
| Profile Vocab | `{base}/vocab/{profile}` | Profile-specific vocab |
| Core Shapes | `{base}/shapes/core` | Core SHACL shapes |
| Profile Shapes | `{base}/shapes/{profile}` | Profile-specific shapes |
| Statements | `{base}/data/statements` | Runtime statements |
| Agents | `{base}/data/agents` | Agent registry |
| Activities | `{base}/data/activities` | Activity registry |
| API | `{base}/api` | Hydra documentation |
| Policies | `{base}/policies` | ODRL policies |
| Credentials | `{base}/credentials` | VCs, DIDs |

### Example Configuration (TriG format)

```trig
@prefix : <https://example.org/xapi/> .

:ontology {
    # OWL ontology loaded from xapi-core.owl.ttl
}

:vocab/core {
    # Core SKOS concepts
}

:shapes/core {
    # Core SHACL shapes + rules
}

:data/statements {
    # Runtime statement data
}

:api {
    # Hydra API documentation
}

:policies {
    # ODRL policies
}

:credentials {
    # VC/DID documents
}
```

## Deployment Patterns

### Single Node (Development)

```
┌────────────────────────────────┐
│         Docker Host            │
│  ┌──────────────────────────┐  │
│  │    Application Server    │  │
│  │    (Node.js / Python)    │  │
│  └──────────────────────────┘  │
│              │                 │
│  ┌──────────────────────────┐  │
│  │       Triplestore        │  │
│  │   (Fuseki / GraphDB)     │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

### Clustered (Production)

```
                    ┌──────────────┐
                    │   Load       │
                    │   Balancer   │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│   LRS Node 1   │ │   LRS Node 2   │ │   LRS Node N   │
└───────┬────────┘ └───────┬────────┘ └───────┬────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Triplestore Cluster  │
              │   (Primary + Replicas) │
              └────────────────────────┘
```

### Cloud Native (Kubernetes)

```yaml
# Simplified K8s deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hd-xapi-lrs
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: lrs
        image: hd-xapi/lrs:latest
        env:
        - name: TRIPLESTORE_URL
          value: "http://triplestore:3030"
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: triplestore
spec:
  serviceName: triplestore
  replicas: 1
  template:
    spec:
      containers:
      - name: fuseki
        image: stain/jena-fuseki:latest
```

## Technology Stack

### Recommended Stack

| Layer | Technology | Alternatives |
|-------|------------|--------------|
| Gateway | Kong | NGINX, Traefik |
| Application | Node.js + TypeScript | Python + FastAPI |
| SHACL Engine | TopBraid SHACL | pySHACL, shacl-js |
| Triplestore | Apache Jena Fuseki | GraphDB, Stardog |
| Cache | Redis | Memcached |
| Queue | RabbitMQ | Kafka |

### Library Dependencies

**Node.js Stack:**
```json
{
  "dependencies": {
    "@rdfjs/data-model": "^2.0.0",
    "n3": "^1.17.0",
    "rdf-validate-shacl": "^0.5.0",
    "sparql-http-client": "^2.4.0",
    "express": "^4.18.0",
    "jsonld": "^8.3.0"
  }
}
```

**Python Stack:**
```
rdflib>=7.0.0
pyshacl>=0.25.0
SPARQLWrapper>=2.0.0
fastapi>=0.100.0
python-jose>=3.3.0
```

## Security Considerations

### Authentication

1. **OAuth 2.0**: Standard xAPI authentication
2. **DID Auth**: Decentralized identity verification
3. **API Keys**: Simple machine-to-machine auth

### Authorization

1. **Scope-based**: OAuth scopes for operations
2. **ODRL Policies**: Fine-grained data access
3. **Graph-level ACL**: Per-graph permissions

### Data Protection

1. **Encryption at rest**: Triplestore encryption
2. **Encryption in transit**: TLS 1.3
3. **Anonymization**: ODRL-enforced at export
4. **Audit logging**: All operations logged

## Monitoring & Observability

### Metrics

| Metric | Description |
|--------|-------------|
| `lrs_statements_total` | Total statements ingested |
| `lrs_validation_errors_total` | Validation failures |
| `lrs_query_duration_seconds` | Query latency |
| `lrs_inference_duration_seconds` | Rule execution time |

### Health Checks

```
GET /health/live    → 200 if process running
GET /health/ready   → 200 if triplestore connected
GET /health/startup → 200 if graphs loaded
```

### Logging

```json
{
  "timestamp": "2026-01-07T12:00:00Z",
  "level": "INFO",
  "service": "lrs",
  "operation": "statement.store",
  "statement_id": "uuid",
  "profile": "cmi5",
  "duration_ms": 45
}
```

---

*Architecture Version: 1.0.0-draft*
*Last Updated: 2026-01-07*
