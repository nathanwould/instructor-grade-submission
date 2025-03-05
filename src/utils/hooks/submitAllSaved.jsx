import log from 'loglevel';
const logger = log.getLogger('default');

const resource = 'x-grade-comments-put';

export async function submitAllSaved({
    authenticatedEthosFetch,
    cardId,
    cardPrefix,
    allSaved,
    type, 
    setSubmitting,
    setSubmittingError
}) {
   
    const urlSearchParams = new URLSearchParams({
        cardId,
        cardPrefix
    }).toString();

    const resourcePath = `${resource}?${urlSearchParams}`;

    const gradesToSubmit = [];

    let allMidtermGrades = [];
    let allFinalGrades = [];
    
    allSaved.forEach(student => {
        // console.log(student)
        const {
            credentials: { bannerId }, 
            grades: { 
                xgrdId, 
                midtermGrade, 
                finalGrade 
            }, 
            section: { 
                academicPeriod, 
                crn
            } 
        } = student;

        if (midtermGrade?.status === "saved") {
            allMidtermGrades.push({
                id: xgrdId,
                xbannerId: bannerId,
                xgrdcomCrn: crn,
                xgrdcomTermCode: academicPeriod,
                xgrdcomMidStat: "submitted"
            })
        }
        if (finalGrade?.status === "saved") {
            allFinalGrades.push({
                id: xgrdId,
                xbannerId: bannerId,
                xgrdcomCrn: crn,
                xgrdcomTermCode: academicPeriod,
                xgrdcomFinStat: "submitted"
            })
        }
    })

    if (type === "midterm") gradesToSubmit.push(...allMidtermGrades);
    if (type === "final") gradesToSubmit.push(...allFinalGrades);
    if (type === "all") gradesToSubmit.push(...allMidtermGrades, ...allFinalGrades);
   
    console.log(gradesToSubmit.length > 0)
    
    try {
        console.log(gradesToSubmit)
        setSubmitting(true)

        if (gradesToSubmit.length > 0) {
            let allPromises = [];
            
            for (const grade of gradesToSubmit) {
                console.log(grade)
                const promise = await authenticatedEthosFetch(`${resourcePath}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/vnd.hedtech.integration.v1+json'
                    },
                    body: JSON.stringify(grade)
                });
                allPromises.push(promise)
            }
            const results = await Promise.all(allPromises);
            // console.log(results)
            setSubmitting(false)
            return results
        }
        else {
            setSubmittingError({ message: "No grades to submit." })
            return
        }
    } catch (error) {
        setSubmitting(false)
        logger.error('Unable to submit grades')
        setSubmittingError(error)
    }

    setSubmitting(false);
}