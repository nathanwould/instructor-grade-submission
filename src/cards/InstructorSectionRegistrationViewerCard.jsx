// import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    makeStyles,
    Typography, 
    List,
    ListItem,
    Divider,
    Illustration,
    IMAGES,
    IconButton
} from '@ellucian/react-design-system/core';
import { ArrowRight } from '@ellucian/ds-icons/lib';
import { useDataQuery, DataQueryProvider } from '@ellucian/experience-extension-extras';
import React, { Fragment, useMemo } from 'react';
import { useData, useCardControl } from '@ellucian/experience-extension-utils';
import { getSections } from '../utils/queries/getSections';
import { useInstructorSections } from '../utils/hooks/useInstructorSections';

const useStyles = makeStyles(() => ({
    card: {
        marginTop: 0,
        // marginRight: spacing40,
        marginBottom: 0,
        // marginLeft: spacing40
    },
    list: {
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    listItem: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    listItemLine: {
        width: "100%",
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    iconButton: {
        width: '1.5rem',
        height: '1.5rem',
    },
    icon: {
        "&:hover": {
            color: 'red',
        }
    },
    divider: {
        marginTop: '0px',
        marginBottom: '0px'
    },
    noSections: {
        height: '100%',
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }
}));

const resource = 'instructor-section-registration-viewer'

const InstructorSectionRegistrationViewerCard = () => {
    const classes = useStyles();

    const { navigateToPage } = useCardControl();

    const { data } = useDataQuery(resource);
    const sections = data;

    const test = useInstructorSections();

    console.log(test)

    const lastSectionIndex = !sections?.length ? 0 : sections?.length - 1;

    if (sections && sections.length > 0) {
        return (
            <div className={classes.card}>
                <List className={classes.list}>
                    {sections.map((section, index) => (
                        <Fragment key={section.id}>
                            <ListItem className={classes.listItem}>
                                <div className={classes.listItemLine}>
                                    <Typography variant={'h3'}>{section.section16.course16.titles[0].value}</Typography>
                                    <IconButton 
                                        className={classes.iconButton} 
                                        color="secondary"
                                        onClick={() => navigateToPage({ route: `sections/${section.section16.sectionID}`})}
                                    >
                                        <ArrowRight className={classes.icon} />
                                    </IconButton>
                                </div>
                                <div className={classes.listItemLine}>
                                    <Typography variant={'body2'}>{section.section16.course16.subject6.title} {section.section16.course16.number}</Typography>
                                </div>
                            </ListItem>
                            {index !== lastSectionIndex && (
                                <Divider className={classes.divider} variant={'middle'} />
                            )}
                        </Fragment>
                    ))}
                </List>
            </div>
        )
    } else {
        return (
            <div classes={classes.noSections}>
                <Illustration name={IMAGES.NEWS} />
                <Typography>No sections found.</Typography>
            </div>
        )
    }
};

function CardWithProvider() {
    const { getEthosQuery } = useData();

    const options = useMemo(() => ({
        resource: resource,
        queryFunction: getSections,
        queryParameters: { getEthosQuery },
        queryKeys: 'get-sections'
    }), [getEthosQuery]);

    return (
        <DataQueryProvider options={options}>
            <InstructorSectionRegistrationViewerCard />
        </DataQueryProvider>
    )
}

export default CardWithProvider;