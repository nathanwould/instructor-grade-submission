import React, { useState, useEffect, useCallback } from 'react';
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
import { useCardInfo, useData } from '@ellucian/experience-extension-utils';
// import { useGradeDefinitions } from '../../utils/hooks/useGradeDefinitions';
import PropTypes from 'prop-types';
import { useFetchData } from '../../utils/hooks/useFetchData';
import { submitStudentGrade } from '../../utils/hooks/submitStudentGrade';

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

const initialGrade = {
    grade: null,
    gradeType: null,
    comments: null,
    lastAttendance: null,
    extensionDate: null
}

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

    // const { setErrorMessage } = useExtensionControl();
    const { serverConfigContext: { cardPrefix }, cardId } = useCardInfo();
    const { authenticatedEthosFetch } = useData();

    console.log(selectedStudent?.sectionRegistration)

    const [grade, setGrade] = useState(initialGrade);

    const gradeDefinitions = useFetchData({ schemeId });
    // const grades = gradeDefinitions?.sort((a,b) => a.grade.value > b.grade.value)

    const clearInputs = () => {
        setGrade(initialGrade)
    };

    const handleClose = () => {
        setSelectedStudent(undefined)
        setOpen(false)
        clearInputs()
    };

    useEffect(() => {
        console.log(grade)
    }, [grade]);

    const handleChange = (e) => {
        setGrade(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleDateChange = (date, key) => {
        setGrade(prev => ({
            ...prev,
            [key]: date.toISOString().slice(0,10)
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        submitGrade({ selectedStudent, grade });
    };

    const submitGrade = useCallback(async ({ selectedStudent, grade }) => {
        const sectionRegistrationId = selectedStudent?.sectionRegistration;
        const res = await submitStudentGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, grade })
        if (res.status === 'success') {
            console.log('Success!')
        }
    }, [authenticatedEthosFetch, cardId, cardPrefix])

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
                        <Dropdown
                            className={classes.DialogItem}
                            name="gradeType"
                            label="Grade Type" 
                            value={grade?.gradeType} 
                            onChange={handleChange}
                            required
                        >
                            <DropdownItem label="Midterm" value="3de8f785-d20a-4409-ade1-151414b8e423" />
                            <DropdownItem label="Final" value="dbcdc999-58db-4f43-b38c-a29eb1bd5507" />
                        </Dropdown>
                        <Dropdown 
                            className={classes.DialogItem}
                            name="grade"
                            label="Grade" 
                            value={grade?.grade}
                            onChange={handleChange}
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
                        {grade.grade === 'aeb7fba5-072e-483f-90ad-62aa58c5c61a' &&
                            <div className={classes.DialogItem}>
                                <DatePicker
                                    // className={classes.DialogItem}
                                    label="Last Attended"
                                    placeholder="Select a date"
                                    value={grade?.lastAttendance}
                                    onDateChange={(date) => handleDateChange(date, 'lastAttendance')}
                                    required
                                />
                                <div className={classes.DialogItem} style={{marginTop: "1.5rem"}}>
                                    <DatePicker
                                        // className={classes.DialogItem}
                                        label="Extension Date"
                                        placeholder="Select a date"
                                        value={grade?.extensionDate}
                                        onDateChange={(date) => handleDateChange(date, 'extensionDate')}
                                        required
                                    />
                                </div>
                            </div>
                        }
                        <TextField
                            className={classes.DialogItem}
                            name="comments" 
                            label="Comments"
                            value={grade?.comments}
                            onChange={handleChange}
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
