import { useState, useEffect } from "react"
import { useData } from '@ellucian/experience-extension-utils';

export const useFetchData = ({ schemeId }) => {
    const { getEthosQuery } = useData();
    const [gradeDefinitions, setGradeDefinitions] = useState();

    useEffect(() => {
        if (!schemeId) return
        (
            async () => {
                const { data } = await getEthosQuery({ queryId: 'get-grade-definitions', properties: { schemeId } })
                const { gradeDefinitions: { edges: gradeEdges = [] } = {} } = data;
                const fetchedGrades = gradeEdges.map(edge => edge.node)
                    .filter(item => item.grade.value.length < 3)
                    .sort((a, b) => a.grade.value - b.grade.value)
                setGradeDefinitions(fetchedGrades)
            }
        ) ()
    }, [getEthosQuery, schemeId])
    
    return gradeDefinitions
}