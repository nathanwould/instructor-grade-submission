import React from 'react';
import {
    makeStyles,
    Dialog,
    withMobileDialog,
    DialogTitle,
    DialogContent,
    Typography,
    Grid,
    Avatar
} from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';

const useStyles = makeStyles(() => ({
    Dialog: {
        marginBottom: 0
    },
    DialogTitle: {
        marginBottom: '.5rem'
    },
    DialogItem: {
        marginBottom: '1.5rem'
    }
}));

const CommentsDialog = ({
    openComment,
    setOpenComment,
    selectedComment,
    setSelectedComment,
    selectedStudent,
    setSelectedStudent,
    courseName
}) => {
    const classes = useStyles();
    
    let comment;

    if (selectedComment?.split("\n").length) {
        const filteredComment = selectedComment.split("\n").filter(item => !!item)
        comment = filteredComment.map((item, index) => (
            <Typography key={index} variant="body2" paragraph={true}>
                {item}
            </Typography>
        ))
    } else {
        comment = <Typography variant="body2" paragraph="true">{selectedComment}</Typography>
    }

    return (
        <Dialog 
            open={openComment}
            onClose={() => {
                setOpenComment(false)
                setSelectedComment(undefined)
                setSelectedStudent(undefined)
            }}
        >
            <DialogTitle className={classes.DialogTitle}>
                <Grid 
                    container
                    direction="row"
                    alignItems="center"
                    size="large"
                >
                    <Avatar sx={{ marginLeft: "1.5rem" }} />
                    <Grid>
                        <Typography variant="h2">{selectedStudent?.names[0].firstName} {selectedStudent?.names[0].lastName}</Typography>
                        <Typography variant="body1">{courseName}</Typography>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" paragraph="true">
                    {comment}
                </Typography>
            </DialogContent>

        </Dialog>
    )
}

CommentsDialog.propTypes = {
    openComment: PropTypes.bool.isRequired,
    setOpenComment: PropTypes.func.isRequired,
    selectedComment: PropTypes.object.isRequired,
    setSelectedComment: PropTypes.func.isRequired,
    selectedStudent: PropTypes.object.isRequired,
    setSelectedStudent: PropTypes.func.isRequired,
    courseName: PropTypes.string.isRequired
};

export default withMobileDialog()(CommentsDialog);