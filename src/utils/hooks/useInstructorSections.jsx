import { useData } from "@ellucian/experience-extension-utils";
import { useEffect, useState } from "react"

export function useInstructorSections() {
    const { getEthosQuery } = useData();
    const [data, setData] = useState({
        fetchedData: [],
        loading: true,
        totalCount: 0
    });
    useEffect(() => {
        (
            async () => {
                const fromEthos = await getEthosQuery({ queryId: 'get-sections', properties: { instructorId: "8ab5150b-b59b-49e3-8db7-dce74dab6f01" } });
                console.log(fromEthos)
               const count = fromEthos.data.sectionInstructors10.totalCount
               console.log(count)
               const edges = fromEthos.data.sectionInstructors10.edges
                setData({
                    fetchedData: edges,
                    loading: false,
                    totalCount: count
                })
            }
        )()
    }, [getEthosQuery])
    return data;
}