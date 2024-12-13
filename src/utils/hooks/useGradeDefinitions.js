import { useDataQuery } from '@ellucian/experience-extension-extras';
import { useEffect, useMemo } from 'react';

export function useGradeDefinitions({ schemeId }) {
    const { data, setqueryParameters, refresh } = useDataQuery('get-grade-definitions')
    setqueryParameters({schemeId})
    console.log(schemeId)

    useEffect(() => {
        if (schemeId) refresh()
    }, [schemeId])

    return useMemo(() => {
        let gradeDefinitions;
        if (data && Array.isArray(data?.data.gradeDefinitions6.edges)) {
            console.log("Hello!")
            console.log(data)
            const { data: { gradeDefinitions6: { edges } = [] } = {} } = data;
            gradeDefinitions = edges
        }
        return { gradeDefinitions }
    }, [data, refresh])
}
