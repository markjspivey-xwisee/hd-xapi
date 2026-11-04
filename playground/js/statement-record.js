/** Source-qualified HD activity / informational record projection; no ontology alias. */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.HDXAPIRecord = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
    'use strict';
    const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
    const PROV = 'http://www.w3.org/ns/prov#';
    const DCT = 'http://purl.org/dc/terms/';
    const XSD = 'http://www.w3.org/2001/XMLSchema#';
    const HD = 'https://w3id.org/xapi/ontology#';
    const FOXXI = 'https://foxxi-bridge.interego.xwisee.com/ns/xapi#';
    const SOURCE = Object.freeze({
        repository: 'https://github.com/markjspivey-xwisee/hd-xapi',
        modelCommit: 'b7a1e64f468109305fd0acce453d0c2480826811',
        model: 'https://w3id.org/xapi/ontology',
        version: 'https://w3id.org/xapi/ontology/1.0.0',
        file: 'https://github.com/markjspivey-xwisee/hd-xapi/blob/b7a1e64f468109305fd0acce453d0c2480826811/ontology/xapi-core.owl.ttl',
        targetVersion: 'https://foxxi-bridge.interego.xwisee.com/ns/xapi/2026.10.1',
        adapter: 'hd-json-record/1'
    });
    const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    const canonical = value => Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']'
        : object(value) ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}'
        : JSON.stringify(value);
    function iri(value, field) {
        if (typeof value !== 'string' || !/^[a-z][a-z0-9+.-]*:/i.test(value) || /[\u0000-\u0020<>"{}|^`\\]/.test(value)) throw new Error(field + ' must be an absolute IRI');
        return value;
    }
    async function digest(value) {
        const bytes = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
        return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
    }
    function checkActor(actor, member = false) {
        if (!object(actor) || (actor.objectType && !['Agent', 'Group'].includes(actor.objectType)) || (member && actor.objectType === 'Group')) throw new Error('Actor must be an Agent or Group');
        const identifiers = ['mbox', 'mbox_sha1sum', 'openid', 'account'].filter(key => actor[key] !== undefined);
        if (identifiers.length > 1 || (identifiers.length === 0 && actor.objectType !== 'Group')) throw new Error('An Agent needs exactly one inverse functional identifier');
        if (actor.mbox !== undefined && (typeof actor.mbox !== 'string' || !/^mailto:[^\s<>]+@[^\s<>]+$/.test(actor.mbox))) throw new Error('actor.mbox must be a mailto IRI');
        if (actor.mbox_sha1sum !== undefined && !/^[0-9a-f]{40}$/i.test(actor.mbox_sha1sum)) throw new Error('actor.mbox_sha1sum must be a SHA-1 digest');
        if (actor.openid !== undefined) iri(actor.openid, 'actor.openid');
        if (actor.account !== undefined) {
            if (!object(actor.account) || typeof actor.account.name !== 'string' || !actor.account.name) throw new Error('actor.account needs a name');
            iri(actor.account.homePage, 'actor.account.homePage');
        }
        if (actor.member !== undefined) {
            if (actor.objectType !== 'Group' || !Array.isArray(actor.member)) throw new Error('Only a Group has member Agents');
            actor.member.forEach(value => checkActor(value, true));
        }
        if (!identifiers.length && !actor.member?.length) throw new Error('An anonymous Group needs member Agents');
    }
    async function project(statement, options = {}) {
        if (!object(statement) || !object(statement.actor) || !object(statement.verb) || !object(statement.object)) throw new Error('A whole JSON statement with actor, verb and object is required; RDF/type labels alone are not input');
        if (Object.keys(options).some(key => key !== 'sourceText')) throw new Error('The source model is fixed by this HD adapter');
        if (statement.id !== undefined && !UUID.test(statement.id)) throw new Error('id must be an xAPI UUID');
        if (statement.version !== undefined && (typeof statement.version !== 'string' || !/^(1\.0(?:\.\d+)?|2\.0(?:\.\d+)?)$/.test(statement.version))) throw new Error('version must be a supported source xAPI protocol version');
        const verb = iri(statement.verb.id, 'verb.id');
        // The existing HD exporter supports Activity/StatementRef objects with IDs.
        // Other xAPI object forms are retained by the source payload but refused
        // here rather than silently flattened into an unrelated Activity.
        if (statement.object.objectType && !['Activity', 'StatementRef'].includes(statement.object.objectType)) throw new Error('This bounded projection supports Activity and StatementRef objects only');
        let activity = statement.object.id;
        if (statement.object.objectType === 'StatementRef') {
            if (!UUID.test(activity)) throw new Error('StatementRef.id must be an xAPI UUID');
            activity = 'urn:uuid:' + activity;
        } else activity = iri(activity, 'object.id');
        const raw = options.sourceText === undefined ? JSON.stringify(statement) : options.sourceText;
        if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > 128000 || canonical(JSON.parse(raw)) !== canonical(statement)) throw new Error('Source JSON must match the statement and fit within 128000 UTF-8 bytes');
        const hash = await digest(canonical(statement));
        const eventIri = statement.id ? 'urn:uuid:' + statement.id : statement['@id'] ? iri(statement['@id'], '@id') : 'urn:hd-xapi:activity:sha256:' + hash;
        if (statement.id && statement['@id'] && statement['@id'] !== eventIri) throw new Error('id and @id identify different source activities');
        const recordIri = 'urn:hd-xapi:record:sha256:' + hash;
        const sourceIri = 'urn:hd-xapi:source-json:sha256:' + await digest(raw);
        const triples = [];
        const resource = (subject, predicate, target) => triples.push([subject, predicate, { iri: target }]);
        const literal = (subject, predicate, value, datatype = XSD + 'string') => triples.push([subject, predicate, { value: String(value), datatype }]);
        resource(eventIri, RDF + 'type', HD + 'Statement');
        resource(eventIri, RDF + 'type', PROV + 'Activity');
        const actor = statement.actor;
        checkActor(actor);
        let actorIri;
        if (actor.mbox) actorIri = iri(actor.mbox, 'actor.mbox');
        else if (actor.openid) actorIri = iri(actor.openid, 'actor.openid');
        else actorIri = sourceIri + '#actor';
        resource(eventIri, HD + 'actor', actorIri);
        resource(eventIri, HD + 'verb', verb);
        resource(eventIri, HD + 'object', activity);
        for (const field of ['timestamp', 'stored']) if (statement[field] !== undefined) {
            if (typeof statement[field] !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(statement[field]) || !Number.isFinite(Date.parse(statement[field]))) throw new Error(field + ' must be a date-time');
            literal(eventIri, HD + field, statement[field], XSD + 'dateTime');
        }
        for (const field of ['success', 'completion']) if (statement.result?.[field] !== undefined) {
            if (typeof statement.result[field] !== 'boolean') throw new Error('result.' + field + ' must be boolean');
            literal(eventIri, HD + field, statement.result[field], XSD + 'boolean');
        }
        if (statement.result?.score?.scaled !== undefined) {
            const score = statement.result.score.scaled;
            if (typeof score !== 'number' || !Number.isFinite(score) || score < -1 || score > 1) throw new Error('result.score.scaled must be between -1 and 1');
            literal(eventIri, HD + 'scaledScore', score, XSD + 'double');
        }
        resource(recordIri, RDF + 'type', FOXXI + 'Statement');
        resource(recordIri, RDF + 'type', PROV + 'Entity');
        resource(recordIri, 'https://schema.org/about', eventIri);
        // wasDerivedFrom ranges over Entities. Pointing it at the HD Activity
        // would reintroduce the very Activity/Entity conflation being avoided.
        resource(recordIri, PROV + 'wasDerivedFrom', sourceIri);
        resource(recordIri, DCT + 'references', SOURCE.targetVersion);
        if (statement.version !== undefined) literal(recordIri, FOXXI + 'version', statement.version);
        literal(recordIri, DCT + 'description', 'Source-qualified informational record projection; no achievement inference or full Foxxi SHACL conformance is claimed.');
        resource(sourceIri, RDF + 'type', PROV + 'Entity');
        literal(sourceIri, RDF + 'value', raw);
        literal(sourceIri, DCT + 'format', 'application/json');
        resource(sourceIri, DCT + 'source', SOURCE.file);
        resource(sourceIri, DCT + 'references', SOURCE.model);
        resource(sourceIri, DCT + 'references', SOURCE.version);
        literal(sourceIri, 'https://schema.org/version', SOURCE.adapter);
        return { eventIri, recordIri, sourceIri, triples, source: { ...SOURCE },
            scope: 'JSON-to-RDF record projection only; no SHACL-AF engine, learner achievement or canonical adoption',
            protocolVersion: statement.version ?? null, hasStatementUuid: statement.id !== undefined };
    }
    function serialize(projection, format, n3) {
        if (format === 'jsonld') {
            const graph = new Map();
            for (const [s, p, o] of projection.triples) {
                if (!graph.has(s)) graph.set(s, { '@id': s });
                const node = graph.get(s), key = p === RDF + 'type' ? '@type' : p;
                (node[key] ||= []).push(key === '@type' ? o.iri : o.iri ? { '@id': o.iri } : { '@value': o.value, '@type': o.datatype });
            }
            return JSON.stringify({ '@graph': [...graph.values()] }, null, 2);
        }
        if (!n3?.DataFactory || !n3.Writer) throw new Error('The pinned N3 serializer is required');
        const { namedNode, literal, quad } = n3.DataFactory;
        const quads = projection.triples.map(([s, p, o]) => quad(namedNode(s), namedNode(p), o.iri ? namedNode(o.iri) : literal(o.value, namedNode(o.datatype))));
        return new n3.Writer({ format: format === 'ntriples' ? 'N-Triples' : 'Turtle' }).quadsToString(quads);
    }
    return Object.freeze({ project, serialize, SOURCE, RDF, PROV, HD, FOXXI });
});
