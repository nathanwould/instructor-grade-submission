import { useDataQuery } from '@ellucian/experience-extension-extras';
import { useMemo } from 'react';

export function useStudents() {
    const { data } = useDataQuery('get-registered-students')

    return useMemo(() => {
        let course, registrations, gradeSchemeId;

        if (data && Array.isArray(data.data.sectionRegistrations.edges)) {
            // courseName = data?.data?.sectionRegistrations?.edges[0]?.node?.section?.course?.titles[0]?.value;
            const { data: { sectionRegistrations: { edges } = [] } = {} } = data;
            // console.log(edges)
            course = edges[0].node.section.course
            gradeSchemeId = edges[0].node.gradingOption.gradeScheme6.id
            const sectionRegistration = edges[0].node.id
            let fetchedStudents = edges.map(edge => edge.node).map(record => record.student)
            // console.log(fetchedStudents)
            registrations = fetchedStudents.map(student => {
                student.gradeScheme = gradeSchemeId
                student.sectionRegistration = sectionRegistration
                if (student.credentials && student.credentials.length) {
                    const bannerId = student.credentials.find(credential => credential.type === 'bannerId') || {}
                    student.credentials = { bannerId: bannerId.value }                
                }
                return student
            })
        }
        return { course, registrations }
    }, [data])
}