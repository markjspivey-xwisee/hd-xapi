/**
 * HD-XAPI Playground - Ontology Data for Explorer
 */

const ONTOLOGY = {
    classes: {
        'Statement': {
            label: 'Statement',
            description: 'A record of a learning experience, containing an actor, verb, and object at minimum.',
            superClass: 'prov:Activity',
            properties: [
                { name: 'id', type: 'xsd:string (UUID)', required: false, description: 'UUID identifier for the statement' },
                { name: 'actor', type: 'Actor', required: true, description: 'Who performed the action' },
                { name: 'verb', type: 'Verb', required: true, description: 'The action performed' },
                { name: 'object', type: 'Activity | Agent | StatementRef', required: true, description: 'What the action was performed on' },
                { name: 'result', type: 'Result', required: false, description: 'Outcome of the action' },
                { name: 'context', type: 'Context', required: false, description: 'Situational information' },
                { name: 'timestamp', type: 'xsd:dateTime', required: false, description: 'When the experience occurred' },
                { name: 'stored', type: 'xsd:dateTime', required: false, description: 'When stored in LRS (set by LRS)' },
                { name: 'authority', type: 'Agent', required: false, description: 'Who asserts this statement' },
                { name: 'version', type: 'xsd:string', required: false, description: 'xAPI version (e.g., "1.0.3")' },
                { name: 'attachments', type: 'Attachment[]', required: false, description: 'Files attached to statement' }
            ],
            constraints: [
                'Must have exactly one actor',
                'Must have exactly one verb',
                'Must have exactly one object',
                'ID must be valid UUID if provided',
                'Timestamp must be ISO 8601 dateTime'
            ]
        },
        'Actor': {
            label: 'Actor',
            description: 'The entity performing the action. Can be an Agent or Group.',
            superClass: 'prov:Agent, foaf:Agent',
            subClasses: ['Agent', 'Group'],
            properties: [
                { name: 'objectType', type: 'xsd:string', required: false, description: '"Agent" or "Group"' },
                { name: 'name', type: 'rdf:langString', required: false, description: 'Human-readable name' }
            ],
            constraints: []
        },
        'Agent': {
            label: 'Agent',
            description: 'An individual person or system identified by an inverse functional identifier.',
            superClass: 'Actor',
            properties: [
                { name: 'mbox', type: 'xsd:anyURI', required: false, description: 'Email address (mailto: URI)' },
                { name: 'mbox_sha1sum', type: 'xsd:string', required: false, description: 'SHA1 hash of email (40 hex chars)' },
                { name: 'openid', type: 'xsd:anyURI', required: false, description: 'OpenID identifier' },
                { name: 'account', type: 'Account', required: false, description: 'Account on existing system' }
            ],
            constraints: [
                'Must have exactly one IFI (mbox, mbox_sha1sum, openid, or account)',
                'mbox must be mailto: URI',
                'mbox_sha1sum must be 40-character hex string'
            ]
        },
        'Group': {
            label: 'Group',
            description: 'A collection of Agents. Can be identified (with IFI) or anonymous (members only).',
            superClass: 'Actor',
            properties: [
                { name: 'member', type: 'Agent[]', required: false, description: 'Agents in the group' },
                { name: 'mbox', type: 'xsd:anyURI', required: false, description: 'Email address (mailto: URI)' },
                { name: 'mbox_sha1sum', type: 'xsd:string', required: false, description: 'SHA1 hash of email' },
                { name: 'openid', type: 'xsd:anyURI', required: false, description: 'OpenID identifier' },
                { name: 'account', type: 'Account', required: false, description: 'Account on existing system' }
            ],
            constraints: [
                'Anonymous groups must have member array',
                'Identified groups must have exactly one IFI'
            ]
        },
        'Account': {
            label: 'Account',
            description: 'A user account on an existing system.',
            properties: [
                { name: 'homePage', type: 'xsd:anyURI', required: true, description: 'Home page of the account system' },
                { name: 'name', type: 'xsd:string', required: true, description: 'Unique identifier within the system' }
            ],
            constraints: [
                'homePage must be a valid IRI',
                'name must be non-empty string'
            ]
        },
        'Verb': {
            label: 'Verb',
            description: 'The action performed by the Actor.',
            superClass: 'skos:Concept',
            properties: [
                { name: 'id', type: 'xsd:anyURI', required: true, description: 'IRI identifier for the verb' },
                { name: 'display', type: 'LanguageMap', required: false, description: 'Human-readable names by language' }
            ],
            constraints: [
                'id must be a valid IRI'
            ]
        },
        'Activity': {
            label: 'Activity',
            description: 'A learning activity or content that the Actor interacted with.',
            superClass: 'prov:Entity',
            properties: [
                { name: 'objectType', type: 'xsd:string', required: false, description: 'Always "Activity"' },
                { name: 'id', type: 'xsd:anyURI', required: true, description: 'IRI identifier for the activity' },
                { name: 'definition', type: 'ActivityDefinition', required: false, description: 'Metadata about the activity' }
            ],
            constraints: [
                'id must be a valid IRI'
            ]
        },
        'ActivityDefinition': {
            label: 'Activity Definition',
            description: 'Metadata about an Activity.',
            properties: [
                { name: 'name', type: 'LanguageMap', required: false, description: 'Human-readable name' },
                { name: 'description', type: 'LanguageMap', required: false, description: 'Description of the activity' },
                { name: 'type', type: 'xsd:anyURI', required: false, description: 'Activity type IRI' },
                { name: 'moreInfo', type: 'xsd:anyURI', required: false, description: 'URL for more information' },
                { name: 'interactionType', type: 'InteractionType', required: false, description: 'Type of interaction' },
                { name: 'correctResponsesPattern', type: 'xsd:string[]', required: false, description: 'Correct responses' },
                { name: 'extensions', type: 'ExtensionMap', required: false, description: 'Custom extensions' }
            ],
            constraints: []
        },
        'Result': {
            label: 'Result',
            description: 'The outcome of the Actor\'s interaction with the Activity.',
            properties: [
                { name: 'score', type: 'Score', required: false, description: 'Score achieved' },
                { name: 'success', type: 'xsd:boolean', required: false, description: 'Whether successful' },
                { name: 'completion', type: 'xsd:boolean', required: false, description: 'Whether completed' },
                { name: 'response', type: 'xsd:string', required: false, description: 'Learner\'s response' },
                { name: 'duration', type: 'xsd:duration', required: false, description: 'Duration (ISO 8601)' },
                { name: 'extensions', type: 'ExtensionMap', required: false, description: 'Custom extensions' }
            ],
            constraints: []
        },
        'Score': {
            label: 'Score',
            description: 'A numerical result of an assessment.',
            properties: [
                { name: 'scaled', type: 'xsd:decimal', required: false, description: 'Scaled score (-1 to 1)' },
                { name: 'raw', type: 'xsd:decimal', required: false, description: 'Raw score' },
                { name: 'min', type: 'xsd:decimal', required: false, description: 'Minimum possible score' },
                { name: 'max', type: 'xsd:decimal', required: false, description: 'Maximum possible score' }
            ],
            constraints: [
                'scaled must be between -1 and 1',
                'raw must be between min and max (if all provided)'
            ]
        },
        'Context': {
            label: 'Context',
            description: 'Situational information for a Statement.',
            properties: [
                { name: 'registration', type: 'xsd:string (UUID)', required: false, description: 'Registration UUID' },
                { name: 'instructor', type: 'Actor', required: false, description: 'Instructor' },
                { name: 'team', type: 'Group', required: false, description: 'Team the actor was part of' },
                { name: 'contextActivities', type: 'ContextActivities', required: false, description: 'Related activities' },
                { name: 'revision', type: 'xsd:string', required: false, description: 'Revision of activity' },
                { name: 'platform', type: 'xsd:string', required: false, description: 'Platform used' },
                { name: 'language', type: 'xsd:language', required: false, description: 'Language code (RFC 5646)' },
                { name: 'statement', type: 'StatementRef', required: false, description: 'Related statement' },
                { name: 'extensions', type: 'ExtensionMap', required: false, description: 'Custom extensions' }
            ],
            constraints: [
                'registration must be valid UUID'
            ]
        },
        'ContextActivities': {
            label: 'Context Activities',
            description: 'Activities related to the primary Activity.',
            properties: [
                { name: 'parent', type: 'Activity[]', required: false, description: 'Parent activities (direct hierarchy)' },
                { name: 'grouping', type: 'Activity[]', required: false, description: 'Grouping activities (indirect)' },
                { name: 'category', type: 'Activity[]', required: false, description: 'Profile/category activities' },
                { name: 'other', type: 'Activity[]', required: false, description: 'Other related activities' }
            ],
            constraints: []
        },
        'Attachment': {
            label: 'Attachment',
            description: 'A file attached to a Statement.',
            properties: [
                { name: 'usageType', type: 'xsd:anyURI', required: true, description: 'IRI identifying usage type' },
                { name: 'display', type: 'LanguageMap', required: true, description: 'Display name' },
                { name: 'description', type: 'LanguageMap', required: false, description: 'Description' },
                { name: 'contentType', type: 'xsd:string', required: true, description: 'MIME type' },
                { name: 'length', type: 'xsd:integer', required: true, description: 'Size in bytes' },
                { name: 'sha2', type: 'xsd:string', required: true, description: 'SHA-256 hash (64 hex chars)' },
                { name: 'fileUrl', type: 'xsd:anyURI', required: false, description: 'URL to retrieve file' }
            ],
            constraints: [
                'sha2 must be 64-character hex string',
                'length must be positive integer'
            ]
        }
    },

    tlaClasses: {
        'Competency': {
            label: 'Competency',
            description: 'A measurable skill, knowledge, or ability.',
            superClass: 'skos:Concept',
            namespace: 'tla',
            properties: [
                { name: 'prefLabel', type: 'rdf:langString', required: true, description: 'Label' },
                { name: 'definition', type: 'rdf:langString', required: false, description: 'Definition' },
                { name: 'inFramework', type: 'CompetencyFramework', required: false, description: 'Parent framework' },
                { name: 'parentCompetency', type: 'Competency', required: false, description: 'Parent competency' }
            ]
        },
        'CompetencyAssertion': {
            label: 'Competency Assertion',
            description: 'A claim that a learner has demonstrated a competency.',
            namespace: 'tla',
            properties: [
                { name: 'assertsCompetency', type: 'Competency', required: true, description: 'The competency claimed' },
                { name: 'competencyLevel', type: 'CompetencyLevel', required: false, description: 'Proficiency level' },
                { name: 'confidenceLevel', type: 'xsd:decimal', required: false, description: 'Confidence (0-1)' },
                { name: 'assertionDate', type: 'xsd:dateTime', required: true, description: 'When asserted' },
                { name: 'evidenceUrl', type: 'xsd:anyURI', required: false, description: 'Supporting evidence' }
            ]
        },
        'Credential': {
            label: 'Credential',
            description: 'A qualification, achievement, or certification.',
            namespace: 'tla',
            subClasses: ['Badge', 'Certificate', 'Certification'],
            properties: [
                { name: 'title', type: 'rdf:langString', required: true, description: 'Title' },
                { name: 'issuedBy', type: 'CredentialIssuer', required: true, description: 'Issuing organization' },
                { name: 'validatesCompetency', type: 'Competency[]', required: false, description: 'Competencies validated' },
                { name: 'expirationDate', type: 'xsd:dateTime', required: false, description: 'Expiration date' }
            ]
        },
        'LearningPath': {
            label: 'Learning Path',
            description: 'A sequence of learning activities.',
            superClass: 'Activity',
            namespace: 'tla',
            properties: [
                { name: 'name', type: 'rdf:langString', required: true, description: 'Name' },
                { name: 'developsCompetency', type: 'Competency[]', required: true, description: 'Competencies developed' },
                { name: 'estimatedDuration', type: 'xsd:duration', required: false, description: 'Estimated time' }
            ]
        },
        'Assessment': {
            label: 'Assessment',
            description: 'An evaluation of learner competency.',
            superClass: 'Activity',
            namespace: 'tla',
            subClasses: ['FormativeAssessment', 'SummativeAssessment', 'PerformanceAssessment'],
            properties: [
                { name: 'assessesCompetency', type: 'Competency[]', required: false, description: 'Competencies assessed' }
            ]
        },
        'JobRole': {
            label: 'Job Role',
            description: 'A position requiring specific competencies.',
            namespace: 'tla',
            properties: [
                { name: 'label', type: 'rdf:langString', required: true, description: 'Role title' },
                { name: 'requiresCompetency', type: 'Competency[]', required: false, description: 'Required competencies' }
            ]
        }
    }
};

/**
 * Get all class names
 */
function getClassNames() {
    return Object.keys(ONTOLOGY.classes);
}

/**
 * Get TLA class names
 */
function getTLAClassNames() {
    return Object.keys(ONTOLOGY.tlaClasses);
}

/**
 * Get class details
 */
function getClassDetails(className) {
    return ONTOLOGY.classes[className] || ONTOLOGY.tlaClasses[className] || null;
}
