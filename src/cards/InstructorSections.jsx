import { ArrowRight } from '@ellucian/ds-icons/lib';
import { useCardControl, useData } from '@ellucian/experience-extension-utils';
import {
    makeStyles,
    IconButton,
    Illustration,
    IMAGES,
    List,
    ListItem,
    ListItemText,
    Typography,
    Divider,
    Skeleton
} from '@ellucian/react-design-system/core';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import React, { useMemo, Fragment } from "react";
import { 
    // useDataQuery, 
    DataQueryProvider 
} from '@ellucian/experience-extension-extras';
import { getSections } from '../utils/queries/getSections';
import { useSections } from '../utils/hooks/useSections';

const useStyles = makeStyles(() => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
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
const InstructorSections = () => {
    // const { data: sections, isLoading } = useDataQuery('instructor-section-registration-viewer');
    const classes = useStyles();
    const { navigateToPage } = useCardControl();

    const { sections, isLoading } = useSections()
    console.log(sections)
    console.log(isLoading)
    const lastSectionIndex = !sections?.length ? 0 : sections?.length - 1;

    if (isLoading) {
        console.log("isLoading")
        return (
            <List className={classes.list}>
                <ListItem className={classes.ListItem}>
                    <ListItemText primary={<Skeleton paragraph={{ width: '10sku' }} />} />
                </ListItem>
                <ListItem className={classes.ListItem}>
                    <ListItemText primary={<Skeleton paragraph={{ width: '10sku' }} />}/>
                </ListItem>
                <ListItem className={classes.ListItem}>
                    <ListItemText primary={<Skeleton paragraph={{ width: '10sku' }} />}/>
                </ListItem>
            </List> 
        )
    } else if (sections && !isLoading && sections?.length > 0) {
            console.log("sections && !isLoading && sections?.length > 0")
            return (
                <div>
                <List className={classes.list}>
                    {sections?.map((section, index) => {
                        const { daysOfWeek, startOn, endOn } = section.instructionalEvents[0]
                        return (
                            <Fragment key={section.id}>
                            <ListItem
                                className={classes.listItem}
                                >
                                <div
                                    className={classes.listItemLine}
                                    >
                                    <ListItemText 
                                        variant={'h3'} 
                                        primary={isLoading ? <Skeleton paragraph={{ width: '10sku' }} /> : <strong>{section.course.title}</strong>}
                                        secondary={isLoading ? <Skeleton paragraph={{ width: '6sku' }} /> : `${section.course.subject.title} ${section.course.courseNumber} | ${daysOfWeek} ${startOn}-${endOn}`}
                                        />
                                    <IconButton
                                        className={classes.iconButton}
                                        color="secondary"
                                        onClick={() => navigateToPage({ route: `sections/${section.id}` })}
                                        >
                                        <ArrowRight
                                            className={classes.icon}
                                            />
                                    </IconButton>
                                </div>
                            </ListItem>
                            {index !== lastSectionIndex && (
                                <Divider className={classes.divider} variant={'middle'} />
                            )}
                        </Fragment>
                    )})}
                </List>
            </div>
        )
    } else if (sections && sections?.length === 0) {
        console.log("sections && sections?.length === 0")
        return (
            <>
                <Illustration name={IMAGES.NEWS} />
                <Typography>No sections found.</Typography>
            </> 
        )
    } else if (!sections && !isLoading) {
        console.log("!sections && !isLoading")
        return (
            <>
                <Illustration name={IMAGES.NEWS} />
                <Typography>No sections found.</Typography>
            </> 
        )
    }
}

function CardWithProvider() {
    const { getEthosQuery } = useData();

    const options = useMemo(() => ({
            resource: 'instructor-section-registration-viewer',
            queryFunction: getSections,
            queryParameters: { getEthosQuery },
            queryKeys: 'get-sections'
    }), [getEthosQuery]);

    return (
        <DataQueryProvider options={options}>
            <InstructorSections />
        </DataQueryProvider>
    )
}
export default CardWithProvider;