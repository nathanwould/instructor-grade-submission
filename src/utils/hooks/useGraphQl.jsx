import { useData } from '@ellucian/experience-extension-utils';
import React, { useEffect } from 'react';


export const useGraphQLFetch = () => {
    const { getEthosQuery } = useData();
    const [data, setData] = React.useState({ loading: true, fetchedData: [], totalCount: 0 });
    useEffect(() => {
        (
            async () => {
                try {
                    setData({ loading: true, fetchedData: [] });
                    const fromEthos = await getEthosQuery({ queryId: 'get-sections', properties: { instructorId: "8ab5150b-b59b-49e3-8db7-dce74dab6f01" } });
                    console.log(fromEthos)
                    const count = fromEthos.data.sectionInstructors10.totalCount
                    console.log(count)
                    const edges = fromEthos.data.sectionInstructors10.edges
                    
                        const mappedData = edges.map((edge) => {
                            return {
                                ...edge.node
                            };
                        })
                        setData({ loading: false, fetchedData: mappedData, totalCount: count });
                    } catch (error) {
                    console.error('ethosQuery', error);
                }
            }
        )()
    }, [getEthosQuery]);
    return { data };
};
