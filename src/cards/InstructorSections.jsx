import { ArrowRight } from '@ellucian/ds-icons/lib';
import { useCardControl } from '@ellucian/experience-extension-utils';
import {
    IconButton,
    Illustration,
    IMAGES,
    List,
    ListItem,
    Typography,
    Divider,
    Skeleton
} from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import PropTypes from 'prop-types';
import React, { Fragment } from "react";
import { useGraphQLFetch } from '../utils/hooks/useGraphQl';

const styles = () => ({
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
});
const Test = (props) => {
    const { data } = useGraphQLFetch();
    const { classes } = props;
    const { navigateToPage } = useCardControl();

    const lastSectionIndex = !data.fetchedData.sections?.length ? 0 : data.totalCount;

    return (
        <div>
            {
                data.loading ?
                    <List className={classes.list}>
                        <ListItem className={classes.ListItem}>
                            <Skeleton paragraph={{ width: '10sku' }} />
                        </ListItem>
                        <ListItem className={classes.ListItem}>
                            <Skeleton paragraph={{ width: '10sku' }} />
                        </ListItem>
                        <ListItem className={classes.ListItem}>
                            <Skeleton paragraph={{ width: '10sku' }} />
                        </ListItem>
                    </List> :
                    data.totalCount === 0 ?
                        <>
                            <Illustration name={IMAGES.NEWS} />
                            <Typography>No sections found.</Typography>
                        </> :
                        <List
                            className={classes.list}
                        >
                            {data.fetchedData.map((section, index) => (
                                <Fragment key={section.id}>
                                    <ListItem
                                        className={classes.listItem}
                                    >
                                        <div
                                            className={classes.listItemLine}
                                        >
                                            <Typography variant={'h3'}>{section.section16.course16.titles[0].value}</Typography>
                                            <IconButton
                                                className={classes.iconButton}
                                                color="secondary"
                                                onClick={() => navigateToPage({ route: `sections/${section.section16.sectionID}` })}
                                            >
                                                <ArrowRight
                                                    className={classes.icon}
                                                />
                                            </IconButton>
                                        </div>
                                        <div
                                            className={classes.listItemLine}
                                        >
                                            <Typography variant={'body2'}>{section.section16.course16.subject6.title} {section.section16.course16.number}</Typography>
                                        </div>
                                    </ListItem>
                                    {index !== lastSectionIndex && (
                                        <Divider className={classes.divider} variant={'middle'} />
                                    )}
                                </Fragment>
                            ))}
                        </List>
            }

        </div>
    )
}
Test.propTypes = {
    classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(Test);