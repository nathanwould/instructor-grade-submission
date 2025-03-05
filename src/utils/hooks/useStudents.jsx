import { useDataQuery } from '@ellucian/experience-extension-extras';
import { useMemo } from 'react';
import { parseComment } from '../helperFunctions/parseComment';
// import { useCardInfo, useData } from '@ellucian/experience-extension-utils';
// import { useState, useEffect } from 'react';

export function useStudents() {
    const { data: registrationData, isLoading } = useDataQuery('get-registered-students');
    const { data: gradeData } = useDataQuery('get-grades');
    
    return useMemo(() => {
        let course, registrations, gradeSchemeId;
    
        if (
            registrationData 
            && registrationData.data.sectionRegistrations.edges.length 
            && gradeData
        ) {
            const { data: { sectionRegistrations: { edges } = [] } = {} } = registrationData;
    
            course = edges[0].node.section.course
            
            gradeSchemeId = edges[0].node.gradingOption.gradeScheme6.id
            const fetchedStudents = edges.map(edge => edge.node)
            
            registrations = fetchedStudents.map(registration => {
                const { student } = registration
                student.gradeScheme = gradeSchemeId;
                student.sectionRegistration = registration.id;
                // console.log(student)
                
                const { section: { code, academicPeriod } } = registration;
                const formattedPeriod = academicPeriod.startOn.slice(0, 4).concat(academicPeriod.startOn.slice(5, 7));
                student.section = {
                    crn: code,
                    academicPeriod: formattedPeriod
                };
    
                const favoredName = student.names.find(name => name.type.category === "favored")
                if (favoredName) student.names = [favoredName]
    
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
                    student.grades.xgrdId = studentGrades.ext?.id || null;
                    if (studentGrades.details?.grades?.some(grade => grade.type.title === "Midterm")) {
                        student.grades.midtermGrade = studentGrades.details?.grades.find(grade => grade.type.title === "Midterm")
                        student.grades.midtermGrade.absences = studentGrades.ext?.midAbs || null;
                        student.grades.midtermGrade.status = studentGrades.ext?.midtermStatus || null;
                        if (studentGrades.ext?.midtermComments) {
                            student.grades.midtermGrade.comments = parseComment(studentGrades.ext?.midtermComments) || null;
                        }
                    } 
                    if (studentGrades.details?.grades?.some(grade => grade.type.title === "Final")) {
                        student.grades.finalGrade = studentGrades.details?.grades.find(grade => grade.type.title === "Final");
                        student.grades.finalGrade.absences = studentGrades.ext?.finAbs || null;
                        student.grades.finalGrade.status = studentGrades.ext?.finalStatus || null;
                        if (studentGrades.ext?.finalComments) {
                            student.grades.finalGrade.comments = parseComment(studentGrades.ext?.finalComments) || null;
                        }
                    }
                }
                if (studentGrades?.details?.lastAttendance?.date) {
                    student.grades.lastAttendance = studentGrades.details.lastAttendance.date
                }
                if (studentGrades?.incompleteGrade) {
                    student.grades.incompleteGrade = studentGrades.incompleteGrade
                }
                return student
            })
        }
        return { course, registrations, isLoading }
    }, [registrationData, gradeData, isLoading])
}
