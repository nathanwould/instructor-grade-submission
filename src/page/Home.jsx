import { spacing20 } from '@ellucian/react-design-system/core/styles/tokens';
import { 
    makeStyles, 
    Dropdown,
    DropdownItem,
    Typography,
    Button,
    Grid,
    ConfirmationDialog,
    FormControl,
    FormLabel,
    FormControlLabel,
    FormHelperText,
    RadioGroup,
    Radio,
    Skeleton,
    Snackbar,
    CircularProgress
} from '@ellucian/react-design-system/core';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    useDataQuery, 
    userTokenDataConnectQuery, 
    MultiDataQueryProvider 
} from '@ellucian/experience-extension-extras';
import {
    useData, 
    usePageControl,
    useCardInfo
} from '@ellucian/experience-extension-utils';
// import { useGraphQLFetch } from '../utils/hooks/useGraphQl';
import { useStudents } from '../utils/hooks/useStudents';
import { getSections } from '../utils/queries/getSections';
import GradeDialog from './components/GradeDialog';
import PropTypes from 'prop-types';
import { useGradeTypes } from '../utils/queries/getGradeTypes';
import CommentsDialog from './components/CommentsDialog';
import { submitAllSaved } from '../utils/hooks/submitAllSaved';
import { useSections } from '../utils/hooks/useSections';
import SkeletonTable from './components/SkeletonTable';
import StudentsTable from './components/StudentsTable';

const useStyles = makeStyles(() => ({
    card: {
        margin: `0 ${spacing20} 4rem`
    },
    Dropdown: {
        margin: `1.5rem 0`
    }
}));

const SectionRegistrations = ({ 
    sectionId, 
    sectionRegistrationId,
    setSectionRegistrationId
 }) => {
    const classes = useStyles();
    const { setPageTitle, navigateToPage } = usePageControl("Sections");
    setPageTitle(' ');

    const { serverConfigContext: { cardPrefix }, cardId } = useCardInfo();
    const { authenticatedEthosFetch } = useData();

    const [section, setSection] = useState();
    const [open, setOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState();
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState();
    const [selectedComment, setSelectedComment] = useState();
    const [openComment, setOpenComment] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [radioValue, setRadioValue] = useState();
    const [submitting, setSubmitting] = useState(false);
    const [submittingError, setSubmittingError] = useState();

    // const { data: sections, isFetching: isFetchingSections } = useDataQuery('instructor-section-registration-viewer');
    const { sections, isLoading: isFetchingSections } = useSections();
    const { refresh: refetchGrades/*, isRefreshing: isRefreshingGrades */} = useDataQuery('get-grades');

    // console.log(isRefreshingGrades)

    const { course, registrations, isLoading } = useStudents();
    // const { refresh: refetchRegistrations } = useDataQuery('get-registered-students')
    const { gradeTypes } = useGradeTypes();

    useEffect(() => {
        setSection(sections?.find(section => section.id === sectionId))
    }, [sections, sectionId]);

    const handleChangeSection = (e) => {
        console.log(e.target.value)
        navigateToPage({ route: `sections/${e.target.value}` })
        window.location.reload()
        // setReload(prev => !prev)
    };

    const handleOpenEdit = ({ student }) => {
        setSelectedStudent(student)
        setSectionRegistrationId(student.sectionRegistration)
        setOpen(true)
    }

    const handleOpenComment = ({ student }, comment) => {
        setSelectedStudent(student)
        setSelectedComment(comment)
        setOpenComment(true)
    }

    const handleSubmitAll = async (e, { type }) => {
        const allSaved = registrations?.filter(student => 
            student.grades?.midtermGrade?.status === 'saved'
            || student.grades?.finalGrade?.status === 'saved'
        )
        setSubmitting(true);
        const res = await submitAllSaved({ authenticatedEthosFetch, cardId, cardPrefix, allSaved, type, setSubmitting, setSubmittingError });
        console.log(res)
        if (res && res[0]?.status === 200) {
            setSubmitting(false);
            setOpenConfirm(false);
            refetchGrades();
            
        } else {
            console.log(res)
            setSubmitting(false);
        }
    };

    return (
        <div className={classes.card}>
            <div>
                <Dropdown
                    id="section_dropdown"
                    className={classes.Dropdown}
                    label="Section"
                    value={sectionId}
                    onChange={handleChangeSection}
                >
                    {isFetchingSections ?
                        <DropdownItem label={<Skeleton paragraph={{ width: '10sku' }} />} />
                        : sections?.length === 0 ? 
                            <DropdownItem>
                                <Typography>No sections found</Typography>
                            </DropdownItem>
                            : sections?.map(section => {
                                const { daysOfWeek, startOn, endOn } = section.instructionalEvents[0];
                                return (
                                    <DropdownItem
                                        key={section.id}
                                        value={section.id}
                                        label={`${section.course.subject.title} ${section.course.courseNumber} ${section.number ? section.number : ''} | ${daysOfWeek} ${startOn}-${endOn}`}
                                    />
                            )})
                    }
                </Dropdown>
            </div>
            {section ?
                <div>
                    
                    <Typography variant='h1'>{section ? section?.course?.title : "Not Found"}</Typography>
                    <Grid 
                        container
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Grid>
                            <Typography variant='h3'>{section ? `${section?.course?.subject?.title || "Not"} ${section.course?.courseNumber || " found"} ${section.number ? section.number : ''}` : "Not Found"}</Typography>
                            <Typography variant='p' sx={{ marginBottom: ".5rem"}}>{`${section.instructionalEvents[0].daysOfWeek} ${section.instructionalEvents[0].startOn}-${section.instructionalEvents[0].endOn}`}</Typography>
                        </Grid>
                        <Grid>
                            <Button color="secondary" onClick={() => setOpenConfirm(true)}>Submit All Saved</Button>
                        </Grid>
                    </Grid>
                </div>
                :
                <div>
                    <Typography variant='h1'>{course ? course?.titles[0]?.value : "Not Found"}</Typography>
                    <Typography variant='h3'>{course ? `${course?.subject?.title || "Not"} ${course?.number || " found"}` : "Not Found"}</Typography>
                </div>
            }
            { isLoading ? 
                <SkeletonTable />
                : registrations ?
                    <StudentsTable 
                        registrations={registrations}
                        handleOpenEdit={handleOpenEdit}
                        handleOpenComment={handleOpenComment}
                    />
                :
                <div>
                    <Typography variant='h1'>{course ? course?.titles[0]?.value : "Not Found"}</Typography>
                    <Typography variant='h3'>{course ? `${course?.subject?.title || "Not"} ${course?.number || " found"}` : "Not Found"}</Typography>
                </div>
            }
            <GradeDialog 
                open={open}
                setOpen={setOpen}
                selectedStudent={selectedStudent}
                setSelectedStudent={setSelectedStudent}
                courseName={course?.titles[0].value}
                gradeTypes={gradeTypes}
                setShowSnackbar={setShowSnackbar}
                setSnackbarMessage={setSnackbarMessage}
                sectionRegistrationId={sectionRegistrationId}
                setSectionRegistrationId={setSectionRegistrationId}
            />
            <CommentsDialog 
                openComment={openComment}
                setOpenComment={setOpenComment}
                selectedComment={selectedComment}
                setSelectedComment={setSelectedComment}
                selectedStudent={selectedStudent}
                setSelectedStudent={setSelectedStudent}
                courseName={course?.titles[0].value}
            />
            <ConfirmationDialog 
                open={openConfirm}
                content={(
                    <FormControl error={!!submittingError}>
                        <FormLabel id="confirmation-dialog-confirmation-dialog">Which saved grades should be submitted?</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="confirmation-dialog-confirmation-dialog"
                            value={radioValue}
                            onChange={(e) => setRadioValue(e.target.value)}
                        >
                            <FormControlLabel value="midterm" control={<Radio />} label="Midterm" />
                            <FormControlLabel value="final" control={<Radio />} label="Final" />
                            <FormControlLabel value="all" control={<Radio />} label="All" />
                        </RadioGroup>
                        {submittingError && <FormHelperText>{submittingError.message}</FormHelperText>}
                    </FormControl>
                )}
                title="Submit Grades"
                primaryActionText={submitting ? <CircularProgress color="inherit"/> : "Submit"}
                primaryActionOnClick={(e) => handleSubmitAll(e, { type: radioValue })}
                primaryActionProps={{
                    disabled: !radioValue && !submitting
                }}
                secondaryActionText="Cancel"
                secondaryActionOnClick={() => {
                    setOpenConfirm(false);
                    setRadioValue();
                    setSubmittingError();
                }}
                secondaryActionProps={{
                    disabled: submitting
                }}
            />
            <Snackbar
                open={showSnackbar}
                message={snackbarMessage}
                onClose={() => { setShowSnackbar(false) }}
            />
        </div>
    );
};

SectionRegistrations.propTypes = {
    sectionId: PropTypes.string,
    sectionRegistrationId: PropTypes.string,
    setSectionRegistrationId: PropTypes.func.isRequired
}

function SectionRegistrationsWithProvider() {
    const { sectionId } = useParams();
    const { getEthosQuery } = useData();

    const [sectionRegistrationId, setSectionRegistrationId] = useState();
    
    const defaultParams = useMemo(() => ({ accept: "application/vnd.hedtech.integration.v1+json" }), [])

    const options = useMemo(() => ([
        {
            resource: 'get-registered-students',
            queryFunction: userTokenDataConnectQuery,
            queryParameters: { accept: "application/vnd.hedtech.integration.v1.0.8+json" },
            queryKeys: { searchParameters: { sectionId } }
        },
        {
            resource: 'get-grade-options',
            queryFunction: userTokenDataConnectQuery,
            queryParameters: defaultParams,
            // queryKeys: { searchParameters: { sectionRegistrationId } },
        },
        {
            resource: 'get-grades',
            queryFunction: userTokenDataConnectQuery,
            queryParameters: defaultParams,
            queryKeys: { searchParameters: { sectionId } }
        },
        {
            resource: 'instructor-section-registration-viewer',
            queryFunction: getSections,
            queryParameters: { getEthosQuery },
            queryKeys: 'get-sections',
            cacheEnabled: false
        }
]), [sectionId, defaultParams, getEthosQuery]);

    return (
        <MultiDataQueryProvider options={options}>
            <SectionRegistrations 
                sectionId={sectionId}
                sectionRegistrationId={sectionRegistrationId}
                setSectionRegistrationId={setSectionRegistrationId}
            />
        </MultiDataQueryProvider>
    )
}

export default SectionRegistrationsWithProvider;