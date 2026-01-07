/**
 * HD-XAPI Playground - Example Statements
 */

const EXAMPLES = {
    'simple-completed': {
        name: 'Simple Completion',
        description: 'A basic statement showing a learner completing a course.',
        tag: 'core',
        statement: {
            "@context": "https://w3id.org/xapi/ontology",
            "id": "12345678-1234-5678-1234-567812345678",
            "actor": {
                "objectType": "Agent",
                "name": "Alice Learner",
                "mbox": "mailto:alice@example.org"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/completed",
                "display": {
                    "en-US": "completed"
                }
            },
            "object": {
                "objectType": "Activity",
                "id": "https://example.org/activities/intro-to-xapi",
                "definition": {
                    "name": {
                        "en-US": "Introduction to xAPI"
                    },
                    "description": {
                        "en-US": "A comprehensive introduction to the Experience API specification."
                    },
                    "type": "http://adlnet.gov/expapi/activities/course"
                }
            },
            "timestamp": "2026-01-07T10:00:00Z"
        }
    },

    'assessment-passed': {
        name: 'Assessment Passed',
        description: 'A learner passing an assessment with a score.',
        tag: 'core',
        statement: {
            "@context": "https://w3id.org/xapi/ontology",
            "actor": {
                "objectType": "Agent",
                "name": "Bob Student",
                "account": {
                    "homePage": "https://lms.example.org",
                    "name": "bob.student"
                }
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/passed",
                "display": {
                    "en-US": "passed"
                }
            },
            "object": {
                "objectType": "Activity",
                "id": "https://example.org/assessments/xapi-fundamentals-exam",
                "definition": {
                    "name": {
                        "en-US": "xAPI Fundamentals Exam"
                    },
                    "type": "http://adlnet.gov/expapi/activities/assessment"
                }
            },
            "result": {
                "score": {
                    "scaled": 0.85,
                    "raw": 85,
                    "min": 0,
                    "max": 100
                },
                "success": true,
                "completion": true,
                "duration": "PT45M"
            },
            "timestamp": "2026-01-07T14:30:00Z"
        }
    },

    'video-watched': {
        name: 'Video Watched',
        description: 'A learner watching a video with progress tracking.',
        tag: 'core',
        statement: {
            "@context": "https://w3id.org/xapi/ontology",
            "actor": {
                "objectType": "Agent",
                "name": "Carol Viewer",
                "mbox_sha1sum": "ebd31e95054c018b10727ccffd2ef2ec3a016ee9"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/experienced",
                "display": {
                    "en-US": "experienced"
                }
            },
            "object": {
                "objectType": "Activity",
                "id": "https://example.org/videos/semantic-web-intro",
                "definition": {
                    "name": {
                        "en-US": "Introduction to Semantic Web"
                    },
                    "description": {
                        "en-US": "A 15-minute video explaining semantic web concepts."
                    },
                    "type": "http://adlnet.gov/expapi/activities/video"
                }
            },
            "result": {
                "completion": true,
                "duration": "PT15M30S"
            },
            "context": {
                "platform": "Video Learning Platform",
                "language": "en-US"
            },
            "timestamp": "2026-01-07T09:15:00Z"
        }
    },

    'tla-competency': {
        name: 'TLA Competency Assertion',
        description: 'A Total Learning Architecture statement asserting a competency.',
        tag: 'tla',
        statement: {
            "@context": [
                "https://w3id.org/xapi/ontology",
                "https://w3id.org/xapi/tla"
            ],
            "actor": {
                "objectType": "Agent",
                "name": "Diana Developer",
                "account": {
                    "homePage": "did:web:example.org",
                    "name": "did:web:example.org:users:diana"
                }
            },
            "verb": {
                "id": "https://w3id.org/xapi/tla/verbs/asserted",
                "display": {
                    "en-US": "asserted"
                }
            },
            "object": {
                "objectType": "Activity",
                "id": "https://example.org/competencies/xapi-implementation",
                "definition": {
                    "name": {
                        "en-US": "xAPI Implementation"
                    },
                    "description": {
                        "en-US": "Ability to implement xAPI in learning systems."
                    },
                    "type": "https://w3id.org/xapi/tla#Competency",
                    "extensions": {
                        "https://w3id.org/xapi/tla#competencyLevel": {
                            "id": "https://example.org/levels/proficient",
                            "name": "Proficient"
                        },
                        "https://w3id.org/xapi/tla#framework": {
                            "id": "https://example.org/frameworks/learning-tech",
                            "name": "Learning Technology Competency Framework"
                        }
                    }
                }
            },
            "result": {
                "success": true,
                "extensions": {
                    "https://w3id.org/xapi/tla#confidenceLevel": 0.85
                }
            },
            "context": {
                "contextActivities": {
                    "category": [
                        {
                            "id": "https://w3id.org/xapi/tla",
                            "definition": {
                                "type": "http://adlnet.gov/expapi/activities/profile"
                            }
                        }
                    ]
                }
            },
            "timestamp": "2026-01-07T16:00:00Z"
        }
    },

    'tla-credential': {
        name: 'TLA Credential Conferred',
        description: 'A credential being conferred to a learner.',
        tag: 'tla',
        statement: {
            "@context": [
                "https://w3id.org/xapi/ontology",
                "https://w3id.org/xapi/tla"
            ],
            "actor": {
                "objectType": "Agent",
                "name": "Example Learning Organization",
                "account": {
                    "homePage": "did:web:example.org",
                    "name": "did:web:example.org"
                }
            },
            "verb": {
                "id": "https://w3id.org/xapi/tla/verbs/conferred",
                "display": {
                    "en-US": "conferred"
                }
            },
            "object": {
                "objectType": "Activity",
                "id": "https://example.org/credentials/xapi-certified-developer",
                "definition": {
                    "name": {
                        "en-US": "xAPI Certified Developer"
                    },
                    "description": {
                        "en-US": "Professional certification for xAPI development expertise."
                    },
                    "type": "https://w3id.org/xapi/tla#Certification"
                }
            },
            "result": {
                "success": true
            },
            "context": {
                "instructor": {
                    "objectType": "Agent",
                    "name": "Certification Board",
                    "account": {
                        "homePage": "https://example.org",
                        "name": "certification-board"
                    }
                },
                "contextActivities": {
                    "category": [
                        {
                            "id": "https://w3id.org/xapi/tla"
                        }
                    ]
                },
                "extensions": {
                    "https://w3id.org/xapi/tla#recipient": {
                        "name": "Diana Developer",
                        "account": {
                            "homePage": "did:web:example.org",
                            "name": "did:web:example.org:users:diana"
                        }
                    }
                }
            },
            "timestamp": "2026-01-07T17:00:00Z"
        }
    },

    'with-context': {
        name: 'With Full Context',
        description: 'A statement with full context including instructor, team, and related activities.',
        tag: 'core',
        statement: {
            "@context": "https://w3id.org/xapi/ontology",
            "actor": {
                "objectType": "Agent",
                "name": "Eve Engineer",
                "mbox": "mailto:eve@example.org"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/completed",
                "display": {
                    "en-US": "completed"
                }
            },
            "object": {
                "objectType": "Activity",
                "id": "https://example.org/activities/module-3-exercise",
                "definition": {
                    "name": {
                        "en-US": "Module 3 Exercise"
                    },
                    "type": "http://adlnet.gov/expapi/activities/simulation"
                }
            },
            "context": {
                "registration": "ec531277-b57b-4c15-8d91-d292c5b2b8f7",
                "instructor": {
                    "objectType": "Agent",
                    "name": "Professor Smith",
                    "mbox": "mailto:smith@university.edu"
                },
                "team": {
                    "objectType": "Group",
                    "name": "Team Alpha",
                    "member": [
                        {
                            "objectType": "Agent",
                            "name": "Eve Engineer",
                            "mbox": "mailto:eve@example.org"
                        },
                        {
                            "objectType": "Agent",
                            "name": "Frank Developer",
                            "mbox": "mailto:frank@example.org"
                        }
                    ]
                },
                "contextActivities": {
                    "parent": [
                        {
                            "id": "https://example.org/activities/module-3",
                            "definition": {
                                "name": { "en-US": "Module 3: Advanced Topics" }
                            }
                        }
                    ],
                    "grouping": [
                        {
                            "id": "https://example.org/courses/advanced-xapi",
                            "definition": {
                                "name": { "en-US": "Advanced xAPI Course" }
                            }
                        }
                    ],
                    "category": [
                        {
                            "id": "https://w3id.org/xapi/cmi5",
                            "definition": {
                                "type": "http://adlnet.gov/expapi/activities/profile"
                            }
                        }
                    ]
                },
                "revision": "2.1",
                "platform": "Learning Management System v5",
                "language": "en-US"
            },
            "timestamp": "2026-01-07T11:45:00Z"
        }
    },

    'with-result': {
        name: 'With Score Result',
        description: 'A statement with detailed score result including scaled, raw, min, and max.',
        tag: 'core',
        statement: {
            "@context": "https://w3id.org/xapi/ontology",
            "actor": {
                "objectType": "Agent",
                "name": "Grace Learner",
                "openid": "https://openid.example.org/grace"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/scored",
                "display": {
                    "en-US": "scored"
                }
            },
            "object": {
                "objectType": "Activity",
                "id": "https://example.org/quizzes/chapter-5-quiz",
                "definition": {
                    "name": {
                        "en-US": "Chapter 5 Quiz"
                    },
                    "description": {
                        "en-US": "Quiz covering semantic web concepts from Chapter 5."
                    },
                    "type": "http://adlnet.gov/expapi/activities/assessment",
                    "interactionType": "choice",
                    "correctResponsesPattern": ["a", "c", "b", "d", "a"]
                }
            },
            "result": {
                "score": {
                    "scaled": 0.8,
                    "raw": 40,
                    "min": 0,
                    "max": 50
                },
                "success": true,
                "completion": true,
                "response": "a,c,b,d,b",
                "duration": "PT8M20S",
                "extensions": {
                    "https://example.org/extensions/attempts": 1,
                    "https://example.org/extensions/time-per-question": "PT1M40S"
                }
            },
            "timestamp": "2026-01-07T13:20:00Z"
        }
    },

    'invalid-missing-actor': {
        name: 'Invalid: Missing Actor',
        description: 'An invalid statement missing the required actor field.',
        tag: 'invalid',
        statement: {
            "@context": "https://w3id.org/xapi/ontology",
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/completed",
                "display": {
                    "en-US": "completed"
                }
            },
            "object": {
                "objectType": "Activity",
                "id": "https://example.org/activities/test-course",
                "definition": {
                    "name": {
                        "en-US": "Test Course"
                    }
                }
            },
            "timestamp": "2026-01-07T10:00:00Z"
        }
    },

    'invalid-bad-score': {
        name: 'Invalid: Bad Score',
        description: 'An invalid statement with scaled score outside valid range (-1 to 1).',
        tag: 'invalid',
        statement: {
            "@context": "https://w3id.org/xapi/ontology",
            "actor": {
                "objectType": "Agent",
                "name": "Test User",
                "mbox": "mailto:test@example.org"
            },
            "verb": {
                "id": "http://adlnet.gov/expapi/verbs/scored",
                "display": {
                    "en-US": "scored"
                }
            },
            "object": {
                "objectType": "Activity",
                "id": "https://example.org/activities/test-assessment",
                "definition": {
                    "name": {
                        "en-US": "Test Assessment"
                    },
                    "type": "http://adlnet.gov/expapi/activities/assessment"
                }
            },
            "result": {
                "score": {
                    "scaled": 1.5,
                    "raw": 150,
                    "min": 0,
                    "max": 100
                },
                "success": true
            },
            "timestamp": "2026-01-07T10:00:00Z"
        }
    }
};

/**
 * Get all examples as an array
 */
function getExamplesArray() {
    return Object.entries(EXAMPLES).map(([key, value]) => ({
        key,
        ...value
    }));
}

/**
 * Get a specific example by key
 */
function getExample(key) {
    return EXAMPLES[key] || null;
}

/**
 * Get statement JSON string for an example
 */
function getExampleJSON(key) {
    const example = getExample(key);
    return example ? JSON.stringify(example.statement, null, 2) : '';
}
