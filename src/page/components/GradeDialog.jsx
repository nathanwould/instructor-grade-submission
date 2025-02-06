import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    makeStyles, 
    Dialog,
    withMobileDialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Avatar,
    Typography,
    FormControl,
    Dropdown,
    DropdownItem,
    TextField,
    DatePicker,
    Button,
    Skeleton,
    CircularProgress
} from '@ellucian/react-design-system/core';
import { useCardInfo, useData, useExtensionControl } from '@ellucian/experience-extension-utils';
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
    extensionDate: null,
    incompleteGrade: null,
    absences: null
};

const GradeDialog = ({
    open, 
    setOpen, 
    selectedStudent,
    setSelectedStudent,
    courseName,
    schemeId,
    gradeTypes,
    setShowSnackbar,
    setSnackbarMessage
}) => {
    const classes = useStyles();

    const { setErrorMessage } = useExtensionControl();
    const { serverConfigContext: { cardPrefix }, cardId } = useCardInfo();
    const { authenticatedEthosFetch } = useData();

    const [grade, setGrade] = useState(initialGrade);

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { gradeDefinitions, loading } = useFetchData({ schemeId });
    const { refresh: refetchGrades } = useDataQuery('get-grades');

    const midtermGradeType = useMemo(() => (gradeTypes?.find(type => type.title === "Midterm")), [gradeTypes]);
    const finalGradeType = useMemo(() => (gradeTypes?.find(type => type.title === "Final")), [gradeTypes]);
    const incompleteGrade = gradeDefinitions?.find(grade => grade.grade.value === "I");
    const incompleteGradeOptions = gradeDefinitions?.filter(grade => grade.grade.value !== "I" && grade.grade.value !== "W");
    
    // console.log(grade)
    // console.log(selectedStudent)
    
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
    }, [selectedStudent]);

    const handleChange = (e) => {
        console.log(e.target.value)
        setGrade(prev => {
            if (e.target.name === 'gradeType') {
                if (e.target.value === midtermGradeType.id) {
                    return {
                        ...prev,
                        [e.target.name]: e.target.value,
                        grade: selectedStudent.grades.midtermGrade?.grade.id || null,
                        comments: selectedStudent.grades.midtermGrade?.comments || null,
                        lastAttendance: new Date(selectedStudent.grades.lastAttendance) || null,
                        extensionDate: new Date(selectedStudent.grades.incompleteGrade?.extensionDate) || null,
                        incompleteGrade: selectedStudent.grades.incompleteGrade?.finalGrade.id || null,
                        absences: selectedStudent.grades.midtermGrade?.absences || null
                    }
                }
                if (e.target.value === finalGradeType.id) {
                    return {
                        ...prev,
                        [e.target.name]: e.target.value,
                        grade: selectedStudent.grades.finalGrade?.grade.id || null,
                        comments: selectedStudent.grades.finalGrade?.comments || null,
                        lastAttendance: new Date(selectedStudent.grades.lastAttendance) || null,
                        extensionDate: new Date(selectedStudent.grades.incompleteGrade?.extensionDate) || null,
                        incompleteGrade: selectedStudent.grades.incompleteGrade?.finalGrade.id || null,
                        absences: selectedStudent.grades.finalGrade?.absences || null
                    }
                }
            }
            return {
                ...prev,
                [e.target.name]: e.target.value
            }
        })
    };

    const handleDateChange = (date, key) => {
        setGrade(prev => ({
            ...prev,
            [key]: date.toISOString().slice(0,10)
        }))
    };

    const handleNumberChange = (n) => {
        setGrade(prev => ({
            ...prev,
            absences: n
        }))
    };

    const handleSubmit = useCallback((e) => {
        e.preventDefault()
        submitGrade({ selectedStudent, grade });
    }, [grade, selectedStudent, submitGrade]);

    const handleSuccess = useCallback((message) => {
        setSuccess(true)
        console.log('Success!')
        handleClose()
        refetchGrades()
        setTimeout(showSnackbarMessage, 400, message)
    }, [refetchGrades, handleClose, showSnackbarMessage]);

    const handleFailure = useCallback((res) => {
        setSubmitting(false)
        setErrorMessage(res.message)
        console.log(res.status)
        console.error(res.status)
        showSnackbarMessage(res.status)
    }, [setErrorMessage, showSnackbarMessage]);

    const showSnackbarMessage = useCallback(message => {
        setShowSnackbar(true)
        setSnackbarMessage(message)
    }, [setShowSnackbar, setSnackbarMessage]);

    const submitGrade = useCallback(async ({ selectedStudent, grade }) => {
        const sectionRegistrationId = selectedStudent?.sectionRegistration;
        if (!selectedStudent.grades.midtermGrade && grade.gradeType === midtermGradeType?.id && selectedStudent.grades.finalGrade) {
            setSubmitting(true)
            const gradeId = selectedStudent.grades.id
            const res = await changeMidtermGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, gradeId, grade })
            if (res.status === 'success') {
                handleSuccess()
            } else {
                console.log(res)
                handleFailure(res)
            }
        } else if (!selectedStudent.grades.midtermGrade && grade.gradeType === midtermGradeType?.id) {
            setSubmitting(true)
            const res = await submitStudentGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, grade })
            if (res.status === 'success') {
                handleSuccess('Grade submitted!')
            } else {
                handleFailure(res.status)
            }
        } else if (grade.gradeType === midtermGradeType?.id && selectedStudent.grades.midtermGrade) {
            setSubmitting(true)
            const gradeId = selectedStudent.grades.id
            const res = await changeMidtermGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, gradeId, grade })
            if (res.status === 'success') {
                handleSuccess('Grade submitted!')
            } else {
                handleFailure(res)
            }
        } else if (grade.gradeType === finalGradeType?.id && !selectedStudent.grades.midtermGrade) {
            setSubmitting(true)
            const res = await submitStudentGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, grade })
            if (res.status === 'success') {
                handleSuccess('Grade submitted!')
            } else {
                handleFailure(res.status)
            }
        } else if (grade.gradeType === finalGradeType?.id) {
            setSubmitting(true)
            const gradeId = selectedStudent.grades.id
            const res = await submitFinalGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, gradeId, grade })
            if (res.status === 'success') {
                handleSuccess('Grade submitted!')
            } else {
                handleFailure(res)
            }
        }
    }, [authenticatedEthosFetch, cardId, cardPrefix, handleSuccess, handleFailure, midtermGradeType?.id, finalGradeType?.id]);

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            className={classes.Dialog}
            maxWidth="md"
            fullWidth={true}
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
                        <Typography variant="h2">{selectedStudent?.names[0].fullName}</Typography>
                        <Typography variant="body1">{courseName}</Typography>
                    </Grid>
                </Grid>
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
                            {gradeTypes && gradeTypes.map(type => (
                                <DropdownItem key={type.id} label={type.title} value={type.id} />
                            ))}
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
                        {grade.grade === incompleteGrade?.id &&
                            <div className={classes.DialogItem}>
                                <Dropdown
                                    className={classes.DialogItem}
                                    name="incompleteGrade"
                                    label="Default Grade" 
                                    value={grade?.incompleteGrade}
                                    onChange={handleChange}
                                    required 
                                >
                                    {incompleteGradeOptions?.map(item => 
                                        <DropdownItem 
                                            key={item.id} 
                                            label={item.grade.value} 
                                            value={item.id} 
                                        />
                                    )}
                                </Dropdown>
                                <div className={classes.DialogItem}>
                                    <DatePicker
                                        label="Last Attendance"
                                        placeholder="Select a date"
                                        value={grade?.lastAttendance}
                                        onDateChange={(date) => handleDateChange(date, 'lastAttendance')}
                                        required
                                    />
                                </div>
                                <div className={classes.DialogItem}>
                                    <DatePicker
                                        label="Extension Date"
                                        placeholder="Select a date"
                                        value={grade?.extensionDate}
                                        onDateChange={(date) => handleDateChange(date, 'extensionDate')}
                                        required
                                    />
                                </div>
                            </div>
                        }
                        <div className={classes.DialogItem}>
                            <TextField
                                className={classes.DialogItem}
                                name="absences"
                                label="Absences"
                                type="number"
                                value={grade?.absences}
                                onChange={handleNumberChange}
                                inputProps={{
                                    min: 0,
                                    max: 20
                                }}

                            />
                        </div>
                        <TextField
                            className={classes.DialogItem}
                            name="comments" 
                            label="Comments"
                            value={grade?.comments}
                            onChange={handleChange}
                            maxCharacters={4000}
                            rows="10"
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

        </Dialog>
    )
}

GradeDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    selectedStudent: PropTypes.object.isRequired,
    setSelectedStudent: PropTypes.func.isRequired,
    courseName: PropTypes.string.isRequired,
    schemeId: PropTypes.string.isRequired,
    gradeTypes: PropTypes.array,
    setShowSnackbar: PropTypes.func.isRequired,
    setSnackbarMessage: PropTypes.func.isRequired
};

export default withMobileDialog({ breakpoint: 'md' })(GradeDialog);
