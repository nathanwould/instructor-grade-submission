import { useState, useEffect } from "react"
import { useData } from '@ellucian/experience-extension-utils';

export const useFetchData = ({ schemeId }) => {
    const { getEthosQuery } = useData();
    const [gradeDefinitions, setGradeDefinitions] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!schemeId) return
        (
            async () => {
                setLoading(true);
                const { data } = await getEthosQuery({ queryId: 'get-grade-definitions', properties: { schemeId } });
                const { gradeDefinitions: { edges: gradeEdges = [] } = {} } = data;
                const fetchedGrades = gradeEdges.map(edge => edge.node)
                    .filter(item => item.grade.value.length < 3)
                    .sort((a, b) => {
                        if (a.grade.value[0] < b.grade.value[0]) {
                            return -1;
                        } else if (a.grade.value[0] > b.grade.value[0]) {
                            return 1;
                        } else {
                            if (a.grade.value[1] && a.grade.value[1] === "+") {
                                return -1
                            } else if (a.grade.value[1] && a.grade.value[1] === "-") {
                                return 1
                            } else return 0
                        }
                    });
                setGradeDefinitions(fetchedGrades);
                setLoading(false)
            }
        ) ()
    }, [getEthosQuery, schemeId]);
    
    return { gradeDefinitions, loading };
}