import log from 'loglevel';
import { formatComment } from '../helperFunctions/formatComment';
const logger = log.getLogger('default');

// const getTheErrorMessage = async (error) => {
//     let text = await error.text()
//     let json = JSON.parse(text)
//     console.log(JSON.parse(json.errors[0].description).errors[0].message)
//     let string = JSON.parse(json.errors[0].description).errors[0].message
//     return string
// }

export async function changeMidtermGrade({ 
    authenticatedEthosFetch, 
    cardId, 
    cardPrefix, 
    sectionRegistrationId,
    gradeId,
    grade, 
    status,
    selectedStudent,
    midtermGradeType,
    finalGradeType,
    incompleteGrade
}) {
    const resource = 'change-midterm-grade';
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

    let putBody = {
        sectionRegistration: {
            id: sectionRegistrationId
        },
        grade: {
            type: {
                id: grade.gradeType
            },
            grade: {
                id: grade.grade
            }
        }
    };

    if (grade.id === incompleteGrade) putBody.incompleteGrade = {
        extensionDate: grade.extensionDate,
        finalGrade: {
            id: grade.finalGrade
        }
    };

    if (grade.lastAttendance) putBody.lastAttendance = { date: grade.lastAttendance };

    const nullGuid = "00000000-0000-0000-0000-000000000000";

    const bannerId = selectedStudent.credentials.bannerId;
    const crn = selectedStudent.section.crn;
    const academicPeriod = selectedStudent.section.academicPeriod;
    const id = selectedStudent.grades.xgrdId ? selectedStudent.grades.xgrdId : nullGuid;

    let xgrdcomPayload = {
        id,
        xbannerId: bannerId,
        xgrdcomCrn: crn,
        xgrdcomTermCode: academicPeriod
    };

    if (grade.gradeType === midtermGradeType.id && grade.comments) xgrdcomPayload.xgrdcomMidCom = formatComment(grade.comments);
    if (grade.gradeType === midtermGradeType.id && grade.absences) xgrdcomPayload.xgrdcomMidAbs = grade.absences;
    if (grade.gradeType === midtermGradeType.id) xgrdcomPayload.xgrdcomMidStat = status;
    if (grade.gradeType === finalGradeType.id && grade.comments) xgrdcomPayload.xgrdcomFinCom = formatComment(grade.comments);
    if (grade.gradeType === finalGradeType.id && grade.absences) xgrdcomPayload.xgrdcomFinAbs = grade.absences;
    if (grade.gradeType === finalGradeType.id) xgrdcomPayload.xgrdcomFinStat = status;

    try {
        let text;
        let json;

        const response = await authenticatedEthosFetch(resourcePath, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/vnd.hedtech.integration.v1.0.6+json',
            },
            body: JSON.stringify({ gradeId, putBody })
        });

        const end = new Date();
        logger.debug(`post ${resource} time: ${end.getTime() - start.getTime()}`);

        let result;
        if (response) {
            switch (response.status) {
                case 200:
                    try {
                        if (xgrdcomPayload.id === nullGuid) {
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
                                            console.log("we made it to the second nested catch!")
                                            result = {
                                                error: {
                                                    message: 'unable to parse response',
                                                    statusCode: 500
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                        if (xgrdcomPayload.id && xgrdcomPayload.id !== nullGuid) {
                            const xgrdcomResponse = await authenticatedEthosFetch(`x-grade-comments-put?${urlSearchParams}`, {
                                method: 'PUT',
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
        // console.log(error.message)
        logger.error('unable to submit grade: ', error);
        // throw new Error(JSON.parse(await error.text()))
        // throw new Error(error)
        return error
    }

}