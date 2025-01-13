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
    Button,
    Skeleton,
    Snackbar,
    CircularProgress
} from '@ellucian/react-design-system/core';
import { useCardInfo, useData } from '@ellucian/experience-extension-utils';
import { useDataQuery } from '@ellucian/experience-extension-extras';
import PropTypes from 'prop-types';
import { useFetchData } from '../../utils/hooks/useFetchData';
import { submitStudentGrade } from '../../utils/hooks/submitStudentGrade';
import { changeMidtermGrade } from '../../utils/hooks/changeMidtermGrade';
import { submitFinalGrade } from '../../utils/hooks/submitFinalGrade';

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

    const [grade, setGrade] = useState(initialGrade);
    // const [editMode, setEditMode] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackBarMessage] = useState();

    const { gradeDefinitions, loading } = useFetchData({ schemeId });
    const { refresh: refetchGrades } = useDataQuery('get-grades');

    console.log(selectedStudent)
    
    const clearInputs = () => {
        setGrade(initialGrade)
    };

    const handleClose = useCallback(() => {
        setSubmitting(false)
        setSuccess(false)
        setSelectedStudent(undefined)
        setOpen(false)
    }, [setOpen, setSelectedStudent]);

    useEffect(() => {
        if(!selectedStudent) clearInputs()
    }, [selectedStudent])

    const handleChange = (e) => {
        console.log(e.target.value)
        setGrade(prev => {
            if (e.target.name === 'gradeType') {
                if (e.target.value === "3de8f785-d20a-4409-ade1-151414b8e423") {
                    return {
                        ...prev,
                        [e.target.name]: e.target.value,
                        grade: selectedStudent.grades.midtermGrade?.grade.id || null
                    }
                }
                if (e.target.value === "dbcdc999-58db-4f43-b38c-a29eb1bd5507") {
                    return {
                        ...prev,
                        [e.target.name]: e.target.value,
                        grade: selectedStudent.grades.finalGrade?.grade.id || null
                    }
                }
            }
            return {
                ...prev,
                [e.target.name]: e.target.value
            }
        })
    }

    const handleDateChange = (date, key) => {
        setGrade(prev => ({
            ...prev,
            [key]: date.toISOString().slice(0,10)
        }))
    };

    const handleSubmit = useCallback((e) => {
        e.preventDefault()
        submitGrade({ selectedStudent, grade });
    }, [grade, selectedStudent, submitGrade]);

    const handleSuccess = useCallback((message) => {
        console.log('Success!')
        handleClose()
        showSnackbarMessage(message)
        setSubmitting(false)
        setSuccess(true)
        refetchGrades()
    }, [refetchGrades, handleClose, showSnackbarMessage]);

    const handleFailure = useCallback((res) => {
        setSubmitting(false)
        console.log(res.status)
        console.error(res.status)
        showSnackbarMessage(res.status)
    }, [showSnackbarMessage]);

    const showSnackbarMessage = useCallback(message => {
        setShowSnackbar(true)
        setSnackBarMessage(message)
    }, [setShowSnackbar, setSnackBarMessage])

    const submitGrade = useCallback(async ({ selectedStudent, grade }) => {
        const sectionRegistrationId = selectedStudent?.sectionRegistration;
        if (!selectedStudent.grades.midtermGrade && grade.gradeType === "3de8f785-d20a-4409-ade1-151414b8e423") {
            setSubmitting(true)
            // console.log('firing!')
            const res = await submitStudentGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, grade })
            if (res.status === 'success') {
                handleSuccess('Grade submitted!')
            } else {
                handleFailure(res.status)
            }
        } else if (grade.gradeType === "3de8f785-d20a-4409-ade1-151414b8e423" && selectedStudent.grades.midtermGrade) {
            setSubmitting(true)
            const gradeId = selectedStudent.grades.id
            // console.log(gradeId)
            const res = await changeMidtermGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, gradeId, grade })
            if (res.status === 'success') {
                handleSuccess('Grade submitted!')
            } else {
                handleFailure(res)
            }
        } else if (grade.gradeType === "dbcdc999-58db-4f43-b38c-a29eb1bd5507") {
            setSubmitting(true)
            const gradeId = selectedStudent.grades.id
            // console.log(gradeId)
            const res = await submitFinalGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, gradeId, grade })
            if (res.status === 'success') {
                handleSuccess('Grade submitted!')
            } else {
                handleFailure(res)
            }
        }
    }, [authenticatedEthosFetch, cardId, cardPrefix, handleSuccess, handleFailure])

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
                            { loading ?
                                <>
                                    <DropdownItem label={<Skeleton paragraph={{ width: '10sku' }} />} />
                                </>
                            
                                : gradeDefinitions?.map(item => 
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
                            color="primary"
                        >
                            {success ?
                                "Success!"
                                :
                                submitting ? 
                                    <CircularProgress color="inherit" aria-valuetext="Submitting grade"/>
                                    : "Submit"
                            }
                        </Button>
                    </DialogActions>
                </FormControl>
            </form>
            <Snackbar
                open={showSnackbar}
                message={snackbarMessage}
                onClose={() => { setShowSnackbar(false); }}
            />
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
