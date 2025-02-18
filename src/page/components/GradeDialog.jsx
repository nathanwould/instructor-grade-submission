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
    InputAdornment,
    DatePicker,
    Button,
    Skeleton,
    CircularProgress
} from '@ellucian/react-design-system/core';
import { useCardInfo, useData, useExtensionControl } from '@ellucian/experience-extension-utils';
import { useDataQuery } from '@ellucian/experience-extension-extras';
import PropTypes from 'prop-types';
import { submitStudentGrade } from '../../utils/hooks/submitStudentGrade';
import { changeMidtermGrade } from '../../utils/hooks/changeMidtermGrade';
// import { submitFinalGrade } from '../../utils/hooks/submitFinalGrade';
import { useGradeOptions } from '../../utils/hooks/useGradeOptions';

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
    gradeTypes,
    setShowSnackbar,
    setSnackbarMessage,
    sectionRegistrationId,
    setSectionRegistrationId
}) => {
    const classes = useStyles();

    const { setErrorMessage } = useExtensionControl();
    const { serverConfigContext: { cardPrefix }, cardId } = useCardInfo();
    const { authenticatedEthosFetch } = useData();

    const [grade, setGrade] = useState(initialGrade);

    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const { gradeOptions, fetching } = useGradeOptions({ sectionRegistrationId });
    
    const { refresh: refetchGrades } = useDataQuery('get-grades');
    
    const midtermGradeType = useMemo(() => (gradeTypes?.find(type => type.title === "Midterm")), [gradeTypes]);
    const finalGradeType = useMemo(() => (gradeTypes?.find(type => type.title === "Final")), [gradeTypes]);
    const incompleteGrade = gradeOptions?.find(grade => grade.value === "I");
    const incompleteGradeOptions = gradeOptions?.filter(grade => grade.value !== "I" && grade.value !== "W");
    
    // console.log(selectedStudent)
    console.log(grade)
    
    const clearInputs = () => {
        setGrade(initialGrade)
    };
    
    const handleClose = useCallback(() => {
        setSubmitting(false)
        setSuccess(false)
        setSelectedStudent(undefined)
        setSectionRegistrationId(undefined)
        setOpen(false)
    }, [setOpen, setSelectedStudent, setSectionRegistrationId]);

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
                        ...(selectedStudent.grades.lastAttendance ? { lastAttendance: new Date(selectedStudent.grades.lastAttendance) } : { lastAttendance: null }),
                        ...(selectedStudent.grades.incompleteGrade?.extensionDate ? { extensionDate: new Date(selectedStudent.grades.incompleteGrade.extensionDate) } : { extensionDate: null }),
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
                        ...(selectedStudent.grades.lastAttendance ? { lastAttendance: new Date(selectedStudent.grades.lastAttendance) } : { lastAttendance: null }),
                        ...(selectedStudent.grades.incompleteGrade?.extensionDate ? { extensionDate: new Date(selectedStudent.grades.incompleteGrade.extensionDate) } : { extensionDate: null }),
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
        submitGrade({ selectedStudent, grade, status: "submitted" });
    }, [grade, selectedStudent, submitGrade]);

    const handleSave = useCallback((e) => {
        e.preventDefault()
        saveGrade({ selectedStudent, grade, status: "saved" });
    }, [grade, selectedStudent, saveGrade]);

    const handleSuccess = useCallback((message) => {
        setSuccess(true)
        setSubmitting(false)
        console.log('Success!')
        handleClose()
        refetchGrades()
        setTimeout(showSnackbarMessage, 400, message)
    }, [refetchGrades, handleClose, showSnackbarMessage]);

    const handleSaveSuccess = useCallback((message) => {
        setSaving(false)
        setSaveSuccess(true)
        console.log(message)
        refetchGrades()
        setTimeout(setSaveSuccess, 1500, false)
    }, [refetchGrades]);

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

    const submitGrade = useCallback(async ({ selectedStudent, grade, status }) => {
        console.log(status)
        const sectionRegistrationId = selectedStudent?.sectionRegistration;
        if (!selectedStudent.grades.id) {
            setSubmitting(true)
            const res = await submitStudentGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, grade, status })
            if (res.status === 'success') {
                handleSuccess('Grade submitted!')
            } else {
                console.log(res)
                handleFailure(res)
            }
        } else {
            setSubmitting(true)
            const gradeId = selectedStudent.grades.id
            const res = await changeMidtermGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, gradeId, grade, status })
            if (res.status === 'success') {
                handleSuccess('Grade submitted!')
            } else {
                handleFailure(res)
            }
        }
    }, [authenticatedEthosFetch, cardId, cardPrefix, handleSuccess, handleFailure]);

    const saveGrade = useCallback(async ({ selectedStudent, grade, status }) => {
        const sectionRegistrationId = selectedStudent?.sectionRegistration;
        if (!selectedStudent.grades.id) {
            setSaving(true)
            const res = await submitStudentGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, grade, status })
            if (res.status === 'success') {
                handleSaveSuccess('Grade saved!')
            } else {
                console.log(res)
                handleFailure(res)
            }
        } else {
            setSaving(true)
            const gradeId = selectedStudent.grades.id
            const res = await changeMidtermGrade({ authenticatedEthosFetch, cardId, cardPrefix, sectionRegistrationId, gradeId, grade, status })
            if (res.status === 'success') {
                handleSaveSuccess('Grade saved!')
            } else {
                handleFailure(res)
            }
        }
    }, [authenticatedEthosFetch, cardId, cardPrefix, handleSaveSuccess, handleFailure]);

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
                        <Typography variant="h2">{selectedStudent?.names[0].firstName} {selectedStudent?.names[0].lastName}</Typography>
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
                            { fetching ?
                                <>
                                    <DropdownItem label={<Skeleton paragraph={{ width: '10sku' }} />} />
                                </>
                            
                                : gradeOptions?.map(item =>
                                    <DropdownItem 
                                        key={item.grade.id}
                                        label={item.value}
                                        value={item.grade.id}
                                    />
                                )
                            }
                        </Dropdown>
                        {grade.grade === incompleteGrade?.grade.id &&
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
                                            key={item.grade.id} 
                                            label={item.value} 
                                            value={item.grade.id} 
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
                                min={ 0}
                                max={20}
                                step={1}
                                precision={0}
                            />
                        </div>
                        <TextField
                            className={classes.DialogItem}
                            name="comments" 
                            label="Comments"
                            placeholder="Comments"
                            value={grade?.comments ? grade.comments : ''}
                            onChange={handleChange}
                            maxCharacters={4000}
                            rows="10"
                            fullWidth
                            multiline
                            required
                            inputProps={{
                                startAdornment: <InputAdornment position="start"> </InputAdornment>
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            label="Save"
                            color="secondary"
                            onClick={handleSave}
                            disabled={submitting}
                        >
                            {saveSuccess ?
                                "Success!"
                                :
                                saving ? 
                                    <CircularProgress color="inherit" aria-valuetext="Submitting grade"/>
                                    : "Save"
                            }
                        </Button>
                        <Button 
                            type="submit" 
                            label="Submit"
                            color="primary"
                            disabled={saving}
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
    setSnackbarMessage: PropTypes.func.isRequired,
    sectionRegistrationId: PropTypes.string.isRequired,
    setSectionRegistrationId: PropTypes.func.isRequired
};

export default withMobileDialog({ breakpoint: 'md' })(GradeDialog);
