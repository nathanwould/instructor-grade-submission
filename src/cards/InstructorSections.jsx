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
import { useDataQuery, DataQueryProvider } from '@ellucian/experience-extension-extras';
import { getSections } from '../utils/queries/getSections';

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
    const { data: sections, isFetching } = useDataQuery('instructor-section-registration-viewer');
    const classes = useStyles();
    const { navigateToPage } = useCardControl();

    const lastSectionIndex = !sections?.length ? 0 : sections?.length - 1;

    return (
        <div>
            {
                isFetching ?
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
                    : sections?.length === 0 ?
                        <>
                            <Illustration name={IMAGES.NEWS} />
                            <Typography>No sections found.</Typography>
                        </> 
                        :
                        <List
                            className={classes.list}
                        >
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
                                                primary={isFetching ? <Skeleton paragraph={{ width: '10sku' }} /> : <strong>{section.course.title}</strong>}
                                                secondary={isFetching ? <Skeleton paragraph={{ width: '6sku' }} /> : `${section.course.subject.title} ${section.course.courseNumber} | ${daysOfWeek} ${startOn}-${endOn}`}
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
            }

        </div>
    )
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