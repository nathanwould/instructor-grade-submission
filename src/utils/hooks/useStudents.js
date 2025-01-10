import { useDataQuery } from '@ellucian/experience-extension-extras';
import { useMemo } from 'react';

export function useStudents() {
    const { data: registrationData } = useDataQuery('get-registered-students');
    const { data: gradeData } = useDataQuery('get-grades');
    // console.log(gradeData)

    return useMemo(() => {
        let course, registrations, gradeSchemeId;

        if (registrationData 
                && Array.isArray(registrationData.data.sectionRegistrations.edges) 
                && gradeData
        ) {

            const { data: { sectionRegistrations: { edges } = [] } = {} } = registrationData;

            course = edges[0].node.section.course
            gradeSchemeId = edges[0].node.gradingOption.gradeScheme6.id
            const fetchedStudents = edges.map(edge => edge.node)
            
            registrations = fetchedStudents.map(registration => {
                const { student } = registration
                student.gradeScheme = gradeSchemeId
                student.sectionRegistration = registration.id

                if (student.credentials && student.credentials.length) {
                    const bannerId = student.credentials.find(credential => credential.type === 'bannerId') || {}
                    student.credentials = { bannerId: bannerId.value }                
                }

                student.grades = {
                    midtermGrade: null,
                    finalGrade: null,
                }

                const studentGrades = gradeData.find(grade => grade.student.id === student.id)
                if (studentGrades) {
                    student.grades.id = studentGrades.id
                    if (studentGrades.details?.grades.some(grade => grade.type.title === "Midterm")) {
                        student.grades.midtermGrade = studentGrades.details?.grades.find(grade => grade.type.title === "Midterm")
                    } else if (studentGrades.details?.grades.some(grade => grade.type.title === "Final")) {
                        student.grades.finalGrade = studentGrades.details?.grades.find(grade => grade.type.title === "Midterm")
                    }
                }
                return student
            })
        }
        return { course, registrations }
    }, [registrationData, gradeData])
}