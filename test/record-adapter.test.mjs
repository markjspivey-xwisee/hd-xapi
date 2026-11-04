import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { test } from 'node:test';
import * as N3 from 'n3';
import jsonld from 'jsonld';
import adapter from '../playground/js/statement-record.js';

const { RDF, PROV, HD, FOXXI } = adapter;
const DCT = 'http://purl.org/dc/terms/';
const sample = () => ({ id: '12345678-1234-5678-1234-567812345678',
    '@context': 'https://untrusted.invalid/context-never-loaded',
    actor: { objectType: 'Agent', account: { homePage: 'https://example.org/', name: 'diagnostic-agent' } },
    verb: { id: 'http://adlnet.gov/expapi/verbs/experienced' },
    object: { id: 'https://example.org/catalog', definition: { name: { en: 'A "quoted" <record>\n☃' } } },
    timestamp: '2026-11-04T19:00:00.000Z', stored: '2026-11-04T19:00:01.000Z', version: '1.0.3',
    context: { extensions: { 'urn:example:opaque': { nested: [true, 2, null, 'unchanged'] } } } });
const parsed = text => new N3.Parser().parse(text);
const terms = quads => quads.map(q => JSON.stringify([q.subject.value, q.predicate.value, q.object.termType, q.object.value, q.object.language, q.object.datatype?.value])).sort();
function sandbox() {
    const context = { HDXAPIRecord: adapter, N3, crypto: webcrypto, URL, TextEncoder };
    vm.createContext(context);
    vm.runInContext(readFileSync(new URL('../playground/js/validator.js', import.meta.url), 'utf8') + '\nthis.exportTurtle=statementToTurtle;this.exportNT=statementToNTriples;', context);
    return context;
}

test('actual HD exporters preserve the activity and add a distinct source-qualified informational record', async () => {
    const input = sample(), before = structuredClone(input), raw = JSON.stringify(input, null, 2);
    const context = sandbox(), turtle = await context.exportTurtle(input, raw), nt = await context.exportNT(input, raw);
    const p = await adapter.project(input, { sourceText: raw }), graph = parsed(turtle);
    assert.deepEqual(input, before);
    assert.notEqual(p.eventIri, p.recordIri); assert.notEqual(p.sourceIri, p.eventIri);
    assert.equal(p.eventIri, 'urn:uuid:' + input.id);
    const has = (s, pred, o) => graph.some(q => q.subject.value === s && q.predicate.value === pred && q.object.value === o);
    assert(has(p.eventIri, RDF + 'type', HD + 'Statement'));
    assert(has(p.eventIri, RDF + 'type', PROV + 'Activity'));
    assert(!has(p.eventIri, RDF + 'type', FOXXI + 'Statement'));
    assert(!has(p.eventIri, RDF + 'type', PROV + 'Entity'));
    assert(has(p.recordIri, RDF + 'type', FOXXI + 'Statement'));
    assert(has(p.recordIri, RDF + 'type', PROV + 'Entity'));
    assert(has(p.recordIri, PROV + 'wasDerivedFrom', p.sourceIri));
    assert(!has(p.recordIri, PROV + 'wasDerivedFrom', p.eventIri));
    assert(has(p.recordIri, 'https://schema.org/about', p.eventIri));
    assert(has(p.sourceIri, RDF + 'value', raw));
    assert.deepEqual(JSON.parse(graph.find(q => q.subject.value === p.sourceIri && q.predicate.value === RDF + 'value').object.value), input);
    assert(has(p.sourceIri, DCT + 'source', adapter.SOURCE.file));
    assert(has(p.sourceIri, DCT + 'references', adapter.SOURCE.version));
    assert(has(p.recordIri, DCT + 'references', adapter.SOURCE.targetVersion));
    assert.equal(p.protocolVersion, '1.0.3');
    assert(has(p.recordIri, FOXXI + 'version', '1.0.3'));
    assert.notEqual(p.protocolVersion, adapter.SOURCE.targetVersion);
    assert.deepEqual(terms(graph), terms(parsed(nt)));
    assert(!graph.some(q => /equivalentClass|sameAs|assertsCompetency|qualifiedFor|isClassifiedBy/.test(q.predicate.value)));
});

test('expanded JSON-LD is the same actual graph, without fetching the source payload context', async () => {
    const p = await adapter.project(sample()), document = JSON.parse(adapter.serialize(p, 'jsonld'));
    const nquads = await jsonld.toRDF(document, { format: 'application/n-quads', documentLoader: async () => { throw new Error('No remote document may be loaded'); } });
    assert.deepEqual(terms(parsed(nquads)), terms(parsed(adapter.serialize(p, 'ntriples', N3))));
});

test('identifiers are deterministic, source text stays exact, and ID-less examples do not mint random statements', async () => {
    const first = sample(), second = Object.fromEntries(Object.entries(first).reverse());
    const a = await adapter.project(first), b = await adapter.project(second);
    assert.equal(a.recordIri, b.recordIri); assert.equal(a.eventIri, b.eventIri);
    delete first.id; const c = await adapter.project(first), d = await adapter.project(first);
    assert.equal(c.eventIri, d.eventIri); assert.equal(c.recordIri, d.recordIri); assert.equal(c.hasStatementUuid, false);
});

test('the real browser conversion handler serializes one projection in all three format tabs', async () => {
    const input = sample(), raw = JSON.stringify(input), modal = { classList: { add(value) { assert.equal(value, 'active'); } } };
    const output = { textContent: '' }, context = { HDXAPIRecord: adapter, N3, document: { addEventListener() {}, getElementById(id) { return id === 'rdf-modal' ? modal : output; } } };
    vm.createContext(context);
    vm.runInContext(readFileSync(new URL('../playground/js/playground.js', import.meta.url), 'utf8') + '\neditor={getValue:()=> ' + JSON.stringify(raw) + '}; this.convert=convertToRDF;this.outputs=()=>currentRDFOutput;this.clear=clearResults;', context);
    await context.convert();
    const values = context.outputs(); assert.deepEqual(Object.keys(values), ['turtle', 'ntriples', 'jsonld']);
    assert.deepEqual(terms(parsed(values.turtle)), terms(parsed(values.ntriples)));
    assert.match(output.textContent, /foxxi-bridge/);
    context.clear();
    assert.match(output.innerHTML, /Validate checks browser structural rules\. Full SHACL validation requires a separate engine\./);
    assert.doesNotMatch(output.innerHTML, /check it against SHACL shapes/);
});

test('the current page can initialize its example menu without the absent optional examples grid', () => {
    const context = { document: { addEventListener() {}, getElementById(id) { return id === 'example-select' ? { addEventListener() {} } : null; } } };
    vm.createContext(context);
    vm.runInContext(readFileSync(new URL('../playground/js/examples.js', import.meta.url), 'utf8'), context);
    vm.runInContext(readFileSync(new URL('../playground/js/playground.js', import.meta.url), 'utf8') + '\nthis.initialize=initExamples;', context);
    assert.doesNotThrow(() => context.initialize());
});

test('all four real inference handlers execute actual projections, not their canned achievement rules', async () => {
    const results = { textContent: '', children: [], replaceChildren(...children) { this.children = children; } };
    const context = { document: { getElementById() { return results; }, createElement() { return { textContent: '' }; } }, HDXAPIRecord: adapter, N3 };
    vm.createContext(context);
    vm.runInContext(readFileSync(new URL('../playground/js/inference.js', import.meta.url), 'utf8') + '\nthis.examples=INFERENCE_EXAMPLES;this.choose=id=>{currentInferenceExample=id;};this.run=runInference;', context);
    assert.equal(Object.keys(context.examples).length, 4);
    for (const [id, example] of Object.entries(context.examples)) {
        const p = await adapter.project(example.statement);
        assert(p.triples.some(([s, pred, o]) => s === p.recordIri && pred === RDF + 'type' && o.iri === FOXXI + 'Statement'));
        assert(!p.triples.some(([, pred]) => /assertsCompetency|confidenceLevel|qualifiedFor/.test(pred)));
        context.choose(id); await context.run();
        assert.equal(results.children.length, 4);
        assert.match(results.children[1].textContent, /not executed here/);
        assert.deepEqual(terms(parsed(results.children[3].textContent)), terms(parsed(adapter.serialize(p, 'ntriples', N3))));
    }
});

test('refuses incomplete/foreign-type-only inputs, identifier conflicts, RDF injection and fabricated source authority', async () => {
    const cases = [null, [], { '@type': HD + 'Account' }, '<urn:a> a <https://w3id.org/xapi/ontology#Statement> .'];
    for (const value of cases) await assert.rejects(adapter.project(value), /whole JSON statement/);
    const mutations = [s => s.id = 'not-a-uuid', s => s['@id'] = 'urn:conflict', s => s.verb.id = 'https://example.org/x> <urn:injected>',
        s => s.actor.mbox = 'mailto:other@example.org', s => s.object.objectType = 'SubStatement', s => s.timestamp = '2026', s => s.version = '2026.10.1', s => s.result = { success: 'true' }, s => s.result = { score: { scaled: 2 } }];
    for (const mutate of mutations) { const value = sample(); mutate(value); await assert.rejects(adapter.project(value)); }
    await assert.rejects(adapter.project(sample(), { sourceText: '{}' }), /Source JSON/);
    const large = sample(); large.note = 'x'.repeat(128000);
    await assert.rejects(adapter.project(large), /128000/);
    await assert.rejects(adapter.project(sample(), { sourceModel: 'https://evil.invalid/#Statement' }), /source model is fixed/);
});
