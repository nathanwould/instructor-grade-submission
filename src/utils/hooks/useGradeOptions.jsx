import { useCardInfo, useData } from "@ellucian/experience-extension-utils";
import { useState, useEffect } from "react";

const grades = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", "H", "I", "P", "R", "W"]

export const useGradeOptions = ({ sectionRegistrationId }) => {
    const { authenticatedEthosFetch } = useData();
    const { cardId } = useCardInfo();

    const [gradeOptions, setGradeOptions] = useState();
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!sectionRegistrationId) return
        (
            async () => {
                setFetching(true)
                // console.log(sectionRegistrationId)
                authenticatedEthosFetch(`get-grade-options?cardId=${cardId}&sectionRegistrationId=${sectionRegistrationId.toString()}`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/vnd.hedtech.integration.v3+json',
                    }
                }) 
                .then(response => response.json())
                .then(data => setGradeOptions(grades.map(grade => data.grades.find(fetchedGrade => fetchedGrade.value === grade)
                )))
                .then(setFetching(false))
            }
        )()

    }, [sectionRegistrationId, authenticatedEthosFetch, cardId])

    return { gradeOptions, fetching }
}