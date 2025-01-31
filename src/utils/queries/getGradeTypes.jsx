// export async function getGradeTypes({ queryParameters }) {
//     const { getEthosQuery } = queryParameters;
//     try {
//         const gradeTypeData = await getEthosQuery({ queryId: 'get-grade-types' });
//         // const { data: { sectionInstructors10: { edges: sectionEdges } = [] } = {} } = sectionEdges ? sectionData : mockSections;
//         const { data: { sectionGradeTypes6: { edges: gradeTypeEdges } = [] } = {} } = gradeTypeData;
//         const fetchedTypes = gradeTypeEdges.map(edge => edge.node);
//         return { data: fetchedTypes }
//     } catch (error) {
//         return { error }
//     }
// }
import React, { useEffect } from 'react';
import { useData } from '@ellucian/experience-extension-utils';

export const useGradeTypes = () => {
    const { getEthosQuery } = useData();
    const [data, setData] = React.useState({ loading: true, gradeTypes: [] });
    useEffect(() => {
        (
            async () => {
                try {
                    setData({ loading: true, gradeTypes: [] });
                    const fromEthos = await getEthosQuery({ queryId: 'get-grade-types' });
                    console.log(fromEthos)
                    const edges = fromEthos.data.sectionGradeTypes6.edges
                    const mappedData = edges.map((edge) => {
                        return {
                            ...edge.node
                        };
                    })
                    setData({ loading: false, gradeTypes: mappedData });
                } catch (error) {
                    console.error('ethosQuery', error);
                }
            }
        )()
    }, [getEthosQuery]);
    return data;
};