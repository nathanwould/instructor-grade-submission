// import { mockSections } from "../mockData/mockSections";

export async function getSections({ queryParameters }) {
    const { getEthosQuery } = queryParameters;
    try {
        const sectionData = await getEthosQuery({ queryId: 'get-sections' });
        // const { data: { sectionInstructors10: { edges: sectionEdges } = [] } = {} } = sectionEdges ? sectionData : mockSections;
        const { data: { sectionInstructors10: { edges: sectionEdges } = [] } = {} } = sectionData;
        const fetchedSections = sectionEdges.map(edge => edge.node);
        return { data: fetchedSections }
    } catch (error) {
        return { error }
    }
}
