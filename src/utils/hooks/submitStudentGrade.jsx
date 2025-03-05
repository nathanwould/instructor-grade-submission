import log from 'loglevel';
import { formatComment } from '../helperFunctions/formatComment';
const logger = log.getLogger('default');

export async function submitStudentGrade({ 
    authenticatedEthosFetch, 
    cardId, 
    cardPrefix, 
    sectionRegistrationId, 
    grade,
    status,
    selectedStudent,
    midtermGradeType,
    finalGradeType
}) {
    const resource = 'submit-student-grades';

    try {
        let text;
        let json;
        const start = new Date();

        const urlSearchParams = new URLSearchParams({
            cardId,
            cardPrefix
        }).toString();

        const resourcePath = `${resource}?${urlSearchParams}`;

        if (grade.comments) {
            console.log(formatComment(grade.comments).split('').length)
            if (formatComment(grade.comments).split('').length > 4000) {
                throw new Error("Comments are too long!")
            }
        }
        
        // console.log(JSON.stringify({ sectionRegistrationId, grade, status }))

        const bannerId = selectedStudent.credentials.bannerId;
        const crn = selectedStudent.section.crn;
        const academicPeriod = selectedStudent.section.academicPeriod;


        console.log(midtermGradeType, grade.type)

        let xgrdcomPayload = {
            id: "00000000-0000-0000-0000-000000000000",
            xbannerId: bannerId,
            xgrdcomCrn: crn,
            xgrdcomTermCode: academicPeriod
        };

        if (grade.gradeType === midtermGradeType.id && grade.comments) xgrdcomPayload.xgrdcomMidCom = formatComment(grade?.comments);
        if (grade.gradeType === midtermGradeType.id && grade.absences) xgrdcomPayload.xgrdcomMidAbs = grade.absences;
        if (grade.gradeType === midtermGradeType.id) xgrdcomPayload.xgrdcomMidStat = status;
        if (grade.gradeType === finalGradeType.id && grade.comments) xgrdcomPayload.xgrdcomFinCom = formatComment(grade?.comments);
        if (grade.gradeType === finalGradeType.id && grade.absences) xgrdcomPayload.xgrdcomFinAbs = grade.absences;
        if (grade.gradeType === finalGradeType.id) xgrdcomPayload.xgrdcomFinStat = status;

        console.log(JSON.stringify(xgrdcomPayload));

        const response = await authenticatedEthosFetch(resourcePath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/vnd.hedtech.integration.student-unverified-grades-submissions.v1+json',
                Accept: 'application/vnd.hedtech.integration.v1.0.19+json'
            },
            body: JSON.stringify({ sectionRegistrationId, grade, status })
        });

        const end = new Date();
        logger.debug(`post ${resource} time: ${end.getTime() - start.getTime()}`);

        let result;
        if (response) {
            // console.log(response)
            switch (response.status) {
                case 200:
                    try {
                        const xgrdcomResponse = await authenticatedEthosFetch(`submit-comments?${urlSearchParams}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/vnd.hedtech.integration.v1+json'
                            },
                            body: JSON.stringify(xgrdcomPayload)
                        })
                        if (xgrdcomResponse) {
                            switch (xgrdcomResponse.status) {
                                case 200:
                                    try {
                                        const data = await xgrdcomResponse.json()
                                        result = {
                                            data,
                                            status: 'success'
                                        }
                                    } catch (error) {
                                        text = await response.text()
                                        json = JSON.parse(text)
                                        throw new Error(JSON.parse(json.errors[0].description).errors[0].message)
                                    }
                            }
                        }
                        } catch (error) {
                            text = await response.text()
                            json = JSON.parse(text)
                            throw new Error(JSON.parse(json.errors[0].description).errors[0].message)
                        }
                    break;
                default:
                    text = await response.text()
                    json = JSON.parse(text)
                    throw new Error(JSON.parse(json.errors[0].description).errors[0].message)
            }
        }
        return result;
    } catch (error) {
         logger.error('unable to submit grade: ', error);
         return error
    }

}