import log from 'loglevel';
const logger = log.getLogger('default');

export async function submitAllSaved({
    authenticatedEthosFetch,
    cardId,
    cardPrefix,
    allSaved,
}) {
    const resource = 'change-midterm-grade';

    let gradesToSubmit =  [];
    
    allSaved.forEach(student => {
        const { id, sectionRegistration, grades } = student
        if (grades.midtermGrade.status === "saved") {
            gradesToSubmit.push({
                gradeId: id,
                sectionRegistrationId: sectionRegistration,
                status: "submitted"
            })
        }
        if (grades.finalGrade.status === "saved") {
            gradesToSubmit.push({
                gradeId: id,
                sectionRegistrationId: sectionRegistration,
                status: "submitted"
            })
        }
    })

    console.log(gradesToSubmit)

    // try {
    //     const start = new Date();

    //     const urlSearchParams = new URLSearchParams({
    //         cardId,
    //         cardPrefix
    //     }).toString();

    //     const resourcePath = `${resource}?${urlSearchParams}`;

    //     const response = await authenticatedEthosFetch(resourcePath, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/vnd.hedtech.integration.student-unverified-grades-submissions.v1+json',
    //             Accept: 'application/vnd.hedtech.integration.v1.0.16+json'
    //         },
    //         body: JSON.stringify({ sectionRegistrationId, grade, status: "saved" })
    //     });

    //     const end = new Date();
    //     logger.debug(`post ${resource} time: ${end.getTime() - start.getTime()}`);

    //     let result;
    //     if (response) {
    //         console.log(response)
    //         switch (response.status) {
    //             case 200:
    //                 try {
    //                     const data = await response.json();

    //                     result = {
    //                         data,
    //                         status: 'success'
    //                     };
    //                 } catch (error) {
    //                     result = {
    //                         error: {
    //                             message: 'unable to parse response',
    //                             statusCode: 500
    //                         }
    //                     };
    //                 }
    //                 break;
    //             default:
    //                 result = {
    //                     error: {
    //                         message: 'server error',
    //                         statusCode: response.status
    //                     }
    //                 };
    //         }
    //     }
    //     return result;
    // } catch (error) {
    //     logger.error('unable to search for persons: ', error);
    //     throw error;
    // }

}