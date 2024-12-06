import React, { useState } from 'react';
import {
    makeStyles, 
    Dialog, 
    withMobileDialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    FormControl,
    Dropdown,
    DropdownItem,
    TextField,
    DatePicker,
    Button
} from '@ellucian/react-design-system/core';
// import { useGradeDefinitions } from '../../utils/hooks/useGradeDefinitions';
import PropTypes from 'prop-types';
import { useFetchData } from '../../utils/hooks/useFetchData';

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
}))

// const dropdownItems = ["A+","A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "I", "W", "P", "F"]

const GradeDialog = ({
    open, 
    setOpen, 
    selectedStudent,
    setSelectedStudent,
    courseName,
    schemeId
}) => {
    const classes = useStyles();

    const [gradeType, setGradeType] = useState();
    const [grade, setGrade] = useState();
    const [comments, setComments] = useState();
    const [lastAttendance, setLastAttendance] = useState();
    const [extensionDate, setExtensionDate] = useState();

    // const { gradeDefinitions } = useGradeDefinitions({schemeId});

    const gradeDefinitions = useFetchData({ schemeId });
    const grades = gradeDefinitions?.sort((a,b) => {
        // console.log(a.grade.value > b.grade.value)    
        return a.grade.value > b.grade.value
    })
    console.log(grades)

    const handleClose = () => {
        setSelectedStudent(undefined)
        setOpen(false)
        clearInputs()
    };

    const clearInputs = () => {
        setGradeType(undefined)
        setGrade(undefined)
        setComments(undefined)
        setLastAttendance(undefined)
        setExtensionDate(undefined)
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Grade Type:", gradeType)
        console.log("Grade:", grade)
        console.log("Comments:", comments)
        console.log("Last Attendance:", lastAttendance)
        console.log("Extension Date:", extensionDate)
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            className={classes.Dialog}
        >
            <DialogTitle className={classes.DialogTitle}>
                <Typography variant="h2">{selectedStudent?.names[0].fullName}</Typography>
                <Typography variant="body1">{courseName}</Typography>
            </DialogTitle>

            <form name="grade-submission-form" onSubmit={handleSubmit}>
                <FormControl component="fieldset">
                    <DialogContent>
                        {/* <div style={{
                            display: 'flex',
                            // justifyContent: 'space-between'
                        }}> */}
                            <Dropdown
                                className={classes.DialogItem}
                                label="Grade Type" 
                                value={gradeType} 
                                onChange={(e) => setGradeType(e.target.value)}
                                // fullWidth
                                required
                            >
                                <DropdownItem label="Midterm" value="3de8f785-d20a-4409-ade1-151414b8e423" />
                                <DropdownItem label="Final" value="dbcdc999-58db-4f43-b38c-a29eb1bd5507" />
                            </Dropdown>
                            <Dropdown 
                                className={classes.DialogItem}
                                label="Grade" 
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                // fullWidth
                                required 
                            >
                                {gradeDefinitions?.map(item => 
                                    <DropdownItem 
                                        key={item.id} 
                                        label={item.grade.value} 
                                        value={item.id} 
                                    />
                                )}
                            </Dropdown>
                        {/* </div> */}
                        {grade === 'aeb7fba5-072e-483f-90ad-62aa58c5c61a' &&
                            <div className={classes.DialogItem}>
                                <DatePicker
                                    // className={classes.DialogItem}
                                    label="Last Attended"
                                    placeholder="Select a date"
                                    value={lastAttendance}
                                    onDateChange={(date) => setLastAttendance(date.toISOString().slice(0,10))}
                                    required
                                />
                                <div className={classes.DialogItem} style={{marginTop: "1.5rem"}}>
                                    <DatePicker
                                        // className={classes.DialogItem}
                                        label="Extension Date"
                                        placeholder="Select a date"
                                        value={extensionDate}
                                        onDateChange={(date) => setExtensionDate(date.toISOString().slice(0,10))}
                                        required
                                    />
                                </div>
                            </div>
                        }
                        <TextField
                            className={classes.DialogItem}
                            name="comments" 
                            label="Comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            fullWidth
                            multiline
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            type="submit" 
                            label="Submit"
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </FormControl>
            </form>

        </Dialog>
    )
}

GradeDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    selectedStudent: PropTypes.object.isRequired,
    setSelectedStudent: PropTypes.func.isRequired,
    courseName: PropTypes.string.isRequired,
    schemeId: PropTypes.string.isRequired
};

export default withMobileDialog()(GradeDialog);
