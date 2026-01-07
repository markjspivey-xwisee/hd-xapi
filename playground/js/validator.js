/**
 * HD-XAPI Playground - Statement Validator
 *
 * Client-side validation of xAPI statements against structural rules.
 * Note: Full SHACL validation requires a backend SHACL engine.
 * This provides comprehensive structural validation in the browser.
 */

const Validator = {
    /**
     * Validate an xAPI statement
     * @param {Object} statement - The statement to validate
     * @returns {Object} Validation result with isValid and violations
     */
    validate(statement) {
        const violations = [];

        // Check if statement is an object
        if (!statement || typeof statement !== 'object') {
            return {
                isValid: false,
                violations: [{
                    path: '/',
                    message: 'Statement must be a valid JSON object',
                    severity: 'violation'
                }]
            };
        }

        // Validate required properties
        this.validateActor(statement, violations);
        this.validateVerb(statement, violations);
        this.validateObject(statement, violations);

        // Validate optional properties if present
        if (statement.id !== undefined) {
            this.validateId(statement.id, violations);
        }
        if (statement.timestamp !== undefined) {
            this.validateTimestamp(statement.timestamp, 'timestamp', violations);
        }
        if (statement.stored !== undefined) {
            this.validateTimestamp(statement.stored, 'stored', violations);
        }
        if (statement.result !== undefined) {
            this.validateResult(statement.result, violations);
        }
        if (statement.context !== undefined) {
            this.validateContext(statement.context, violations);
        }
        if (statement.authority !== undefined) {
            this.validateActorValue(statement.authority, 'authority', violations);
        }
        if (statement.attachments !== undefined) {
            this.validateAttachments(statement.attachments, violations);
        }

        return {
            isValid: violations.filter(v => v.severity === 'violation').length === 0,
            violations
        };
    },

    /**
     * Validate actor property
     */
    validateActor(statement, violations) {
        if (!statement.actor) {
            violations.push({
                path: 'actor',
                message: 'Statement must have an actor',
                severity: 'violation'
            });
            return;
        }

        this.validateActorValue(statement.actor, 'actor', violations);
    },

    /**
     * Validate an actor value (Agent or Group)
     */
    validateActorValue(actor, path, violations) {
        if (!actor || typeof actor !== 'object') {
            violations.push({
                path,
                message: `${path} must be an object`,
                severity: 'violation'
            });
            return;
        }

        const objectType = actor.objectType || 'Agent';

        if (objectType === 'Agent') {
            this.validateAgent(actor, path, violations);
        } else if (objectType === 'Group') {
            this.validateGroup(actor, path, violations);
        } else {
            violations.push({
                path: `${path}.objectType`,
                message: 'objectType must be "Agent" or "Group"',
                severity: 'violation',
                value: objectType
            });
        }
    },

    /**
     * Validate an Agent
     */
    validateAgent(agent, path, violations) {
        const ifis = ['mbox', 'mbox_sha1sum', 'openid', 'account'];
        const presentIfis = ifis.filter(ifi => agent[ifi] !== undefined);

        if (presentIfis.length === 0) {
            violations.push({
                path,
                message: 'Agent must have exactly one inverse functional identifier (mbox, mbox_sha1sum, openid, or account)',
                severity: 'violation'
            });
        } else if (presentIfis.length > 1) {
            violations.push({
                path,
                message: `Agent must have exactly one IFI, found: ${presentIfis.join(', ')}`,
                severity: 'violation'
            });
        }

        // Validate mbox format
        if (agent.mbox) {
            if (!agent.mbox.startsWith('mailto:')) {
                violations.push({
                    path: `${path}.mbox`,
                    message: 'mbox must be a mailto: URI',
                    severity: 'violation',
                    value: agent.mbox
                });
            }
        }

        // Validate mbox_sha1sum format
        if (agent.mbox_sha1sum) {
            if (!/^[0-9a-fA-F]{40}$/.test(agent.mbox_sha1sum)) {
                violations.push({
                    path: `${path}.mbox_sha1sum`,
                    message: 'mbox_sha1sum must be a 40-character hex string',
                    severity: 'violation',
                    value: agent.mbox_sha1sum
                });
            }
        }

        // Validate account
        if (agent.account) {
            this.validateAccount(agent.account, `${path}.account`, violations);
        }
    },

    /**
     * Validate a Group
     */
    validateGroup(group, path, violations) {
        const ifis = ['mbox', 'mbox_sha1sum', 'openid', 'account'];
        const presentIfis = ifis.filter(ifi => group[ifi] !== undefined);
        const hasMembers = group.member && Array.isArray(group.member) && group.member.length > 0;

        // Either identified (has IFI) or anonymous (has members)
        if (presentIfis.length === 0 && !hasMembers) {
            violations.push({
                path,
                message: 'Group must have an IFI (identified) or member array (anonymous)',
                severity: 'violation'
            });
        }

        // Validate members if present
        if (group.member) {
            if (!Array.isArray(group.member)) {
                violations.push({
                    path: `${path}.member`,
                    message: 'member must be an array',
                    severity: 'violation'
                });
            } else {
                group.member.forEach((member, i) => {
                    this.validateAgent(member, `${path}.member[${i}]`, violations);
                });
            }
        }
    },

    /**
     * Validate an Account
     */
    validateAccount(account, path, violations) {
        if (!account.homePage) {
            violations.push({
                path: `${path}.homePage`,
                message: 'Account must have a homePage',
                severity: 'violation'
            });
        }

        if (!account.name) {
            violations.push({
                path: `${path}.name`,
                message: 'Account must have a name',
                severity: 'violation'
            });
        } else if (typeof account.name !== 'string' || account.name.length === 0) {
            violations.push({
                path: `${path}.name`,
                message: 'Account name must be a non-empty string',
                severity: 'violation',
                value: account.name
            });
        }
    },

    /**
     * Validate verb property
     */
    validateVerb(statement, violations) {
        if (!statement.verb) {
            violations.push({
                path: 'verb',
                message: 'Statement must have a verb',
                severity: 'violation'
            });
            return;
        }

        const verb = statement.verb;

        if (!verb.id) {
            violations.push({
                path: 'verb.id',
                message: 'Verb must have an id (IRI)',
                severity: 'violation'
            });
        } else if (!this.isValidIRI(verb.id)) {
            violations.push({
                path: 'verb.id',
                message: 'Verb id must be a valid IRI',
                severity: 'violation',
                value: verb.id
            });
        }

        // Validate display if present
        if (verb.display !== undefined) {
            this.validateLanguageMap(verb.display, 'verb.display', violations);
        }
    },

    /**
     * Validate object property
     */
    validateObject(statement, violations) {
        if (!statement.object) {
            violations.push({
                path: 'object',
                message: 'Statement must have an object',
                severity: 'violation'
            });
            return;
        }

        const obj = statement.object;
        const objectType = obj.objectType || 'Activity';

        switch (objectType) {
            case 'Activity':
                this.validateActivity(obj, 'object', violations);
                break;
            case 'Agent':
                this.validateAgent(obj, 'object', violations);
                break;
            case 'Group':
                this.validateGroup(obj, 'object', violations);
                break;
            case 'StatementRef':
                this.validateStatementRef(obj, 'object', violations);
                break;
            case 'SubStatement':
                this.validateSubStatement(obj, violations);
                break;
            default:
                violations.push({
                    path: 'object.objectType',
                    message: 'Invalid objectType',
                    severity: 'violation',
                    value: objectType
                });
        }
    },

    /**
     * Validate an Activity
     */
    validateActivity(activity, path, violations) {
        if (!activity.id) {
            violations.push({
                path: `${path}.id`,
                message: 'Activity must have an id (IRI)',
                severity: 'violation'
            });
        } else if (!this.isValidIRI(activity.id)) {
            violations.push({
                path: `${path}.id`,
                message: 'Activity id must be a valid IRI',
                severity: 'violation',
                value: activity.id
            });
        }

        // Validate definition if present
        if (activity.definition) {
            this.validateActivityDefinition(activity.definition, `${path}.definition`, violations);
        }
    },

    /**
     * Validate ActivityDefinition
     */
    validateActivityDefinition(def, path, violations) {
        if (def.name !== undefined) {
            this.validateLanguageMap(def.name, `${path}.name`, violations);
        }
        if (def.description !== undefined) {
            this.validateLanguageMap(def.description, `${path}.description`, violations);
        }
        if (def.type !== undefined && !this.isValidIRI(def.type)) {
            violations.push({
                path: `${path}.type`,
                message: 'Activity type must be a valid IRI',
                severity: 'violation',
                value: def.type
            });
        }
        if (def.moreInfo !== undefined && !this.isValidIRI(def.moreInfo)) {
            violations.push({
                path: `${path}.moreInfo`,
                message: 'moreInfo must be a valid IRI',
                severity: 'violation',
                value: def.moreInfo
            });
        }
    },

    /**
     * Validate StatementRef
     */
    validateStatementRef(ref, path, violations) {
        if (!ref.id) {
            violations.push({
                path: `${path}.id`,
                message: 'StatementRef must have an id (UUID)',
                severity: 'violation'
            });
        } else if (!this.isValidUUID(ref.id)) {
            violations.push({
                path: `${path}.id`,
                message: 'StatementRef id must be a valid UUID',
                severity: 'violation',
                value: ref.id
            });
        }
    },

    /**
     * Validate SubStatement
     */
    validateSubStatement(subStatement, violations) {
        // SubStatement cannot have id, stored, version, or authority
        const forbidden = ['id', 'stored', 'version', 'authority'];
        forbidden.forEach(prop => {
            if (subStatement[prop] !== undefined) {
                violations.push({
                    path: `object.${prop}`,
                    message: `SubStatement cannot have ${prop}`,
                    severity: 'violation'
                });
            }
        });

        // SubStatement cannot have nested SubStatement
        if (subStatement.object && subStatement.object.objectType === 'SubStatement') {
            violations.push({
                path: 'object.object',
                message: 'SubStatement cannot contain another SubStatement',
                severity: 'violation'
            });
        }

        // Validate as statement (minus forbidden)
        this.validateActor({ actor: subStatement.actor }, violations);
        this.validateVerb({ verb: subStatement.verb }, violations);
        if (subStatement.object) {
            this.validateObject({ object: subStatement.object }, violations);
        }
    },

    /**
     * Validate statement id
     */
    validateId(id, violations) {
        if (!this.isValidUUID(id)) {
            violations.push({
                path: 'id',
                message: 'Statement id must be a valid UUID',
                severity: 'violation',
                value: id
            });
        }
    },

    /**
     * Validate timestamp
     */
    validateTimestamp(timestamp, path, violations) {
        if (typeof timestamp !== 'string') {
            violations.push({
                path,
                message: `${path} must be a string`,
                severity: 'violation'
            });
            return;
        }

        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            violations.push({
                path,
                message: `${path} must be a valid ISO 8601 dateTime`,
                severity: 'violation',
                value: timestamp
            });
        }
    },

    /**
     * Validate result
     */
    validateResult(result, violations) {
        if (result.score) {
            this.validateScore(result.score, violations);
        }

        if (result.success !== undefined && typeof result.success !== 'boolean') {
            violations.push({
                path: 'result.success',
                message: 'success must be a boolean',
                severity: 'violation',
                value: result.success
            });
        }

        if (result.completion !== undefined && typeof result.completion !== 'boolean') {
            violations.push({
                path: 'result.completion',
                message: 'completion must be a boolean',
                severity: 'violation',
                value: result.completion
            });
        }

        if (result.duration !== undefined) {
            if (!this.isValidDuration(result.duration)) {
                violations.push({
                    path: 'result.duration',
                    message: 'duration must be a valid ISO 8601 duration',
                    severity: 'violation',
                    value: result.duration
                });
            }
        }
    },

    /**
     * Validate score
     */
    validateScore(score, violations) {
        if (score.scaled !== undefined) {
            if (typeof score.scaled !== 'number') {
                violations.push({
                    path: 'result.score.scaled',
                    message: 'scaled must be a number',
                    severity: 'violation',
                    value: score.scaled
                });
            } else if (score.scaled < -1 || score.scaled > 1) {
                violations.push({
                    path: 'result.score.scaled',
                    message: 'scaled must be between -1 and 1',
                    severity: 'violation',
                    value: score.scaled
                });
            }
        }

        if (score.raw !== undefined && typeof score.raw !== 'number') {
            violations.push({
                path: 'result.score.raw',
                message: 'raw must be a number',
                severity: 'violation',
                value: score.raw
            });
        }

        if (score.min !== undefined && typeof score.min !== 'number') {
            violations.push({
                path: 'result.score.min',
                message: 'min must be a number',
                severity: 'violation',
                value: score.min
            });
        }

        if (score.max !== undefined && typeof score.max !== 'number') {
            violations.push({
                path: 'result.score.max',
                message: 'max must be a number',
                severity: 'violation',
                value: score.max
            });
        }

        // Cross-field validation
        if (score.raw !== undefined && score.min !== undefined && score.max !== undefined) {
            if (score.raw < score.min || score.raw > score.max) {
                violations.push({
                    path: 'result.score.raw',
                    message: 'raw must be between min and max',
                    severity: 'violation',
                    value: `raw=${score.raw}, min=${score.min}, max=${score.max}`
                });
            }
        }

        if (score.min !== undefined && score.max !== undefined && score.min > score.max) {
            violations.push({
                path: 'result.score',
                message: 'min cannot be greater than max',
                severity: 'violation'
            });
        }
    },

    /**
     * Validate context
     */
    validateContext(context, violations) {
        if (context.registration !== undefined && !this.isValidUUID(context.registration)) {
            violations.push({
                path: 'context.registration',
                message: 'registration must be a valid UUID',
                severity: 'violation',
                value: context.registration
            });
        }

        if (context.instructor !== undefined) {
            this.validateActorValue(context.instructor, 'context.instructor', violations);
        }

        if (context.team !== undefined) {
            if (context.team.objectType && context.team.objectType !== 'Group') {
                violations.push({
                    path: 'context.team',
                    message: 'team must be a Group',
                    severity: 'violation'
                });
            } else {
                this.validateGroup(context.team, 'context.team', violations);
            }
        }

        if (context.contextActivities !== undefined) {
            this.validateContextActivities(context.contextActivities, violations);
        }
    },

    /**
     * Validate contextActivities
     */
    validateContextActivities(contextActivities, violations) {
        const categories = ['parent', 'grouping', 'category', 'other'];

        categories.forEach(cat => {
            if (contextActivities[cat] !== undefined) {
                let activities = contextActivities[cat];

                // Can be single activity or array
                if (!Array.isArray(activities)) {
                    activities = [activities];
                }

                activities.forEach((activity, i) => {
                    this.validateActivity(activity, `context.contextActivities.${cat}[${i}]`, violations);
                });
            }
        });
    },

    /**
     * Validate attachments
     */
    validateAttachments(attachments, violations) {
        if (!Array.isArray(attachments)) {
            violations.push({
                path: 'attachments',
                message: 'attachments must be an array',
                severity: 'violation'
            });
            return;
        }

        attachments.forEach((att, i) => {
            const path = `attachments[${i}]`;

            if (!att.usageType) {
                violations.push({
                    path: `${path}.usageType`,
                    message: 'Attachment must have usageType',
                    severity: 'violation'
                });
            }

            if (!att.display) {
                violations.push({
                    path: `${path}.display`,
                    message: 'Attachment must have display',
                    severity: 'violation'
                });
            } else {
                this.validateLanguageMap(att.display, `${path}.display`, violations);
            }

            if (!att.contentType) {
                violations.push({
                    path: `${path}.contentType`,
                    message: 'Attachment must have contentType',
                    severity: 'violation'
                });
            }

            if (att.length === undefined) {
                violations.push({
                    path: `${path}.length`,
                    message: 'Attachment must have length',
                    severity: 'violation'
                });
            } else if (typeof att.length !== 'number' || att.length <= 0) {
                violations.push({
                    path: `${path}.length`,
                    message: 'length must be a positive integer',
                    severity: 'violation',
                    value: att.length
                });
            }

            if (!att.sha2) {
                violations.push({
                    path: `${path}.sha2`,
                    message: 'Attachment must have sha2',
                    severity: 'violation'
                });
            } else if (!/^[0-9a-fA-F]{64}$/.test(att.sha2)) {
                violations.push({
                    path: `${path}.sha2`,
                    message: 'sha2 must be a 64-character hex string',
                    severity: 'violation',
                    value: att.sha2
                });
            }
        });
    },

    /**
     * Validate a LanguageMap
     */
    validateLanguageMap(langMap, path, violations) {
        if (typeof langMap !== 'object' || langMap === null || Array.isArray(langMap)) {
            violations.push({
                path,
                message: 'Must be a language map object',
                severity: 'violation'
            });
            return;
        }

        // Check that all keys are valid language tags
        Object.keys(langMap).forEach(key => {
            if (!/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]+)*$/.test(key) && key !== 'und') {
                violations.push({
                    path: `${path}.${key}`,
                    message: `Invalid language tag: ${key}`,
                    severity: 'warning'
                });
            }
        });
    },

    /**
     * Check if value is a valid IRI
     */
    isValidIRI(value) {
        if (typeof value !== 'string') return false;
        try {
            new URL(value);
            return true;
        } catch {
            // Also accept relative IRIs and URNs
            return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
        }
    },

    /**
     * Check if value is a valid UUID
     */
    isValidUUID(value) {
        if (typeof value !== 'string') return false;
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
    },

    /**
     * Check if value is a valid ISO 8601 duration
     */
    isValidDuration(value) {
        if (typeof value !== 'string') return false;
        return /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/.test(value);
    }
};

/**
 * Convert statement to RDF (Turtle format)
 */
function statementToTurtle(statement) {
    const lines = [];
    const prefixes = `@prefix xapi: <https://w3id.org/xapi/ontology#> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

`;

    lines.push(prefixes);

    const stmtId = statement.id || 'stmt:' + crypto.randomUUID();
    lines.push(`<${stmtId}> a xapi:Statement ;`);

    // Actor
    if (statement.actor) {
        const actorId = statement.actor.mbox || statement.actor.openid ||
            (statement.actor.account ? `<${statement.actor.account.homePage}#${statement.actor.account.name}>` : '_:actor');
        lines.push(`    xapi:actor ${actorId} ;`);
    }

    // Verb
    if (statement.verb && statement.verb.id) {
        lines.push(`    xapi:verb <${statement.verb.id}> ;`);
    }

    // Object
    if (statement.object && statement.object.id) {
        lines.push(`    xapi:object <${statement.object.id}> ;`);
    }

    // Timestamp
    if (statement.timestamp) {
        lines.push(`    xapi:timestamp "${statement.timestamp}"^^xsd:dateTime ;`);
    }

    // Result
    if (statement.result) {
        if (statement.result.success !== undefined) {
            lines.push(`    xapi:success ${statement.result.success} ;`);
        }
        if (statement.result.completion !== undefined) {
            lines.push(`    xapi:completion ${statement.result.completion} ;`);
        }
        if (statement.result.score && statement.result.score.scaled !== undefined) {
            lines.push(`    xapi:scaledScore ${statement.result.score.scaled} ;`);
        }
    }

    // Clean up last semicolon
    let result = lines.join('\n');
    result = result.replace(/;\s*$/, ' .');

    return result;
}

/**
 * Convert statement to N-Triples format
 */
function statementToNTriples(statement) {
    const triples = [];
    const stmtId = statement.id ? `<urn:uuid:${statement.id}>` : `<urn:uuid:${crypto.randomUUID()}>`;

    triples.push(`${stmtId} <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/xapi/ontology#Statement> .`);

    if (statement.verb && statement.verb.id) {
        triples.push(`${stmtId} <https://w3id.org/xapi/ontology#verb> <${statement.verb.id}> .`);
    }

    if (statement.object && statement.object.id) {
        triples.push(`${stmtId} <https://w3id.org/xapi/ontology#object> <${statement.object.id}> .`);
    }

    if (statement.timestamp) {
        triples.push(`${stmtId} <https://w3id.org/xapi/ontology#timestamp> "${statement.timestamp}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .`);
    }

    return triples.join('\n');
}
