import { useData } from '@ellucian/experience-extension-utils';
import React, { useEffect } from 'react';


export const useGraphQLFetch = () => {
    const { getEthosQuery } = useData();
    const [data, setData] = React.useState({ loading: false, fetchedData: [], totalCount: undefined });
    useEffect(() => {
        (
            async () => {
                // console.log('Fetching courses')
                try {
                    setData(prev => ({ ...prev, loading: true }))
                    // console.log(data.loading)
                    const res = await getEthosQuery({ 
                        queryId: 'get-sections', 
                        properties: { instructorId: "8ab5150b-b59b-49e3-8db7-dce74dab6f01" } 
                    })
    
                    const count = res.data.sectionInstructors10.totalCount
                    const edges = res.data.sectionInstructors10.edges
                    const mappedData = edges.map((edge) => ({ ...edge.node }))

                    setData({ loading: false, fetchedData: mappedData, totalCount: count })
                    } catch (error) {
                    console.error('ethosQuery', error);
                }
            }
        )()
    }, [getEthosQuery]);
    return { data };
};
