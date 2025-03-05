import { 
    makeStyles,
    Grid,
    Table,
    TableHead,
    TableCell,
    TableRow,
    Skeleton,
} from '@ellucian/react-design-system/core';
import React from 'react';

const useStyles = makeStyles(() => ({
    headerItem: {
        marginTop: ".5rem"
    }
}))

export default function SkeletonTable() {
    const classes = useStyles();

    return (
        <div>                
            <Skeleton sx={{ marginBottom: ".5rem" }} rectangle={{ height: "2.5rem", width: "24rem" }} />
            <Skeleton className={classes.headerItem} paragraph={{ width: "18rem" }} />
            <Skeleton className={classes.headerItem} paragraph={{ width: "18rem" }} />

            <Grid 
                container
                direction="row"
                justifyContent="space-between"
            >
                <Grid>
                    {/* <Skeleton />
                    <Skeleton /> */}
                </Grid>
                {/* <Grid>
                    <Button color="secondary" onClick={() => setOpenConfirm(true)}>Submit All Saved</Button>
                </Grid> */}
            </Grid>

            <Table layout={{ variant: 'card', breakpoint: 'sm' }} stickyHeader={true}>
                <TableHead>
                    <TableRow>
                        <TableCell>BannerID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Midterm Grade</TableCell>
                        <TableCell size="sm">Midterm Comments</TableCell>
                        <TableCell>Midterm Status</TableCell>
                        <TableCell>Final Grade</TableCell>
                        <TableCell size="sm">Final Comments</TableCell>
                        <TableCell>Final Status</TableCell>
                        <TableCell>Edit</TableCell>
                    </TableRow>
                </TableHead>
            </Table>
        </div>
    )
}