// import { mockSections } from "../mockData/mockSections";

const dayMap = {
    "monday": "Mon",
    "tuesday": "Tue",
    "wednesday": "Wed",
    "thursday": "Thu",
    "friday": "Fri",
    "saturday": "Sat",
    "sunday": "Sun"
};

export async function getSections({ queryParameters }) {

    const { getEthosQuery } = queryParameters;
    try {
        const sections = []
        const sectionData = await getEthosQuery({ queryId: 'get-sections' });
        // const { data: { sectionInstructors10: { edges: sectionEdges } = [] } = {} } = sectionEdges ? sectionData : mockSections;
        const { data: { sectionInstructors10: { edges: sectionEdges } = [] } = {} } = sectionData;
        const fetchedSections = sectionEdges.map(edge => edge.node);
        
        const instructionalEventPromises = [];
        for (const section of fetchedSections) {
            const promise = getEthosQuery({ queryId: 'instructional-events', properties: { sectionId: section.section16.sectionID } })
            instructionalEventPromises.push(promise)
        }

        const results = await Promise.all(instructionalEventPromises)
        results.forEach((result, index) => {
            const fetchedSection = fetchedSections[index];
            const { section16: { sectionID, number, course16: { number: courseNumber, subject6, titles } } } = fetchedSection;
            const title = titles && titles.length > 0 ? titles[0].value : '';
            
            const instructionalEvents = result?.data?.instructionalEvents11?.edges;
            const events = instructionalEvents.map(edge => edge.node);

            const section = {
                id: sectionID,
                number,
                course: {
                    courseNumber,
                    title,
                    subject: subject6
                },
                instructionalEvents: []
            }

            for (const event of events) {
                let {
                    id,
                    recurrence: {
                        timePeriod: { startOn, endOn },
                        repeatRule: { daysOfWeek }
                    }
                } = event;

                startOn = startOn.split('')[11] === "0" ? startOn.slice(12,16) : startOn.slice(11,16)
                endOn = endOn.split('')[11] === "0" ? endOn.slice(12,16) : endOn.slice(11.16)

                const meetingDays = daysOfWeek.map(day => dayMap[day]).join("-")

                section.instructionalEvents.push({
                    id,
                    startOn,
                    endOn,
                    daysOfWeek: meetingDays
                })
                // console.log(section)
                sections.push(section)
            }
        })

        return { data: sections }
    } catch (error) {
        return { error }
    }
}
