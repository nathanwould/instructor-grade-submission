export async function getGradeDefinitions({ queryParameters }) {
    const { getEthosQuery, schemeId } = queryParameters;
    console.log(schemeId)
    try {
        const gradeData = await getEthosQuery({ queryId: 'get-grade-definitions', queryKeys: { searchParameters: schemeId } });
        // const { data: { sectionInstructors10: { edges: sectionEdges } = [] } = {} } = sectionEdges ? sectionData : mockSections;
        const { data: { gradeDefinitions6: { edges: gradeEdges } = [] } = {} } = gradeData;
        const fetchedGrades = gradeEdges.map(edge => edge.node);
        return { data: fetchedGrades }
    } catch (error) {
        return { error }
    }
}