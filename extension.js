// const { default: gql } = require("graphql-tag");

module.exports = {
    name: 'InstructorSectionRegistrationViewer',
    publisher: 'Bard College',
    configuration: {
        server: [{
            key: 'ethosAPIKey',
            label: 'Ethos API Key',
            type: 'password',
            require: true
        }]
    },
    cards: [{
        type: 'InstructorSectionRegistrationViewerCard',
        source: './src/cards/InstructorSections.jsx',
        title: 'Instructor Section Registration Viewer Card',
        displayCardType: 'InstructorSectionRegistrationViewer Card',
        description: 'This is an introductory card to the Ellucian Experience SDK',
    }],
    page: {
        source: './src/page/router.jsx'
    },
    queries: {
        'get-sections': [{
            resourceVersions: {
                'sections': { min: 16 },
                'courses': { min: 16 }
                // 'instructors': { min: 12 }
            },
            query: `
                query getInstructorSections($personId: ID) {
                    sectionInstructors10(
                        sort: { section16: { course16: { titles: { value: ASC } } } }
                        filter: {
                            instructor12: { id: { EQ: $personId } }
                            section16: {
                                academicPeriod16: {
                                    ext: { 
                                        OR: {
                                            midtermGradingInd: { EQ: "Y" } 
                                            finalGradingInd: { EQ: "Y" }
                                        }
                                    }
                                }
                            }
                        }
                    ) {
                        totalCount
                        edges {
                            node {
                                id
                                instructor12 {
                                    instructorID: id
                                    names {
                                        firstName
                                        lastName
                                    }
                                }
                                section16 {
                                    sectionID: id
                                    number
                                    course16 {
                                        titles {
                                            value
                                        }
                                        subject6 {
                                            title
                                        }
                                        number
                                    }
                                    academicPeriod16 {
                                        id
                                        ext {
                                            termCode
                                            midtermGradingInd
                                            finalGradingInd
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `
        }],
        'get-grade-definitions': [{
            query: `
                query getGradeDefinitions($schemeId: ID) {
                    gradeDefinitions: gradeDefinitions6(
                        filter: {
                            scheme6: { id: { EQ: $schemeId} }
                        }
                    ) {
                        edges {
                            node {
                                id
                                grade {
                                    value
                                }
                            }
                        }
                    }
                }
            `
        }],
        'get-grade-types': [{
            query: `
                {
                    sectionGradeTypes6(
		                sort: { title: DESC }
	                )  {
                        edges {
                            node {
                                id
                                title
                            }
                        }
                    }
                }
            `
        }],
        'instructional-events': [{
            query: `
                query getInstructionalEvents($sectionId: ID) {
                    instructionalEvents11(
                        filter: {
                            section16: {
                                id: { EQ: $sectionId }
                            }
                        }
                    ) {
                        edges {
                            node {
                                id
                                section16 {
                                    id
                                    course16 {
                                        titles {
                                            value
                                        }
                                    }
                                }
                                recurrence {
                                    repeatRule {
                                        daysOfWeek
                                    }
                                    timePeriod {
                                        startOn
                                        endOn
                                    }
                                }
                            }
                        }
                    }
                }
            `
        }]
    }
};