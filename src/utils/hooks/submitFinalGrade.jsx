import log from 'loglevel';
const logger = log.getLogger('default');

export async function submitFinalGrade({ 
    authenticatedEthosFetch, 
    cardId, 
    cardPrefix, 
    sectionRegistrationId,
    gradeId,
    grade 
}) {

    const resource = 'submit-final-grades';

    try {
        const start = new Date();

        const urlSearchParams = new URLSearchParams({
            cardId,
            cardPrefix
        }).toString();

        const resourcePath = `${resource}?${urlSearchParams}`;

        console.log(JSON.stringify({ sectionRegistrationId, gradeId, grade }))

        const response = await authenticatedEthosFetch(resourcePath, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/vnd.hedtech.integration.v0.0.5+json',
            },
            body: JSON.stringify({ sectionRegistrationId, gradeId, grade })
        });

        const end = new Date();
        logger.debug(`post ${resource} time: ${end.getTime() - start.getTime()}`);

        let result;
        if (response) {
            switch (response.status) {
                case 200:
                    try {
                        const data = await response.json();

                        result = {
                            data,
                            status: 'success'
                        };
                    } catch (error) {
                        result = {
                            error: {
                                message: 'unable to parse response',
                                statusCode: 500
                            }
                        };
                    }
                    break;
                default:
                    result = {
                        error: {
                            message: 'server error',
                            statusCode: response.status
                        }
                    };
            }
        }
        return result;
    } catch (error) {
        logger.error('unable to search for persons: ', error);
        throw error;
    }

}