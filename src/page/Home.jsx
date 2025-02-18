import { spacing20 } from '@ellucian/react-design-system/core/styles/tokens';
import { 
    makeStyles, 
    Dropdown,
    DropdownItem,
    Typography,
    Button,
    Grid,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton,
    Skeleton,
    Snackbar,
    StatusLabel
} from '@ellucian/react-design-system/core';
import { Edit as EditIcon, Comments as CommentsIcon } from '@ellucian/ds-icons/lib';
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

    const { data: sections, isFetching: isFetchingSections } = useDataQuery('instructor-section-registration-viewer');
    
    const { course, registrations, isFetching } = useStudents();
    const { gradeTypes } = useGradeTypes();

    useEffect(() => {
        setSection(sections?.find(section => section.id === sectionId))
    }, [sections, sectionId]);

    const handleChangeSection = (e) => {
        navigateToPage({ route: `sections/${e.target.value}` })
    };

    const handleSubmitAll = () => {
        const allSaved = registrations?.filter(student => 
            student.grades?.midtermGrade?.status === 'saved'
            || student.grades?.finalGrade?.status === 'saved'
        )
        submitAllSaved({ authenticatedEthosFetch, cardId, cardPrefix, allSaved })
    }

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
                        :   sections?.length === 0 ? 
                            <DropdownItem>
                                <Typography>No sections found</Typography>
                            </DropdownItem>
                            : sections?.map(section => {
                                const { daysOfWeek, startOn, endOn } = section.instructionalEvents[0];
                                return (
                                    <DropdownItem
                                        key={section.id}
                                        value={section.id}
                                        label={`${section.course.subject.title} ${section.course.courseNumber} ${section.number} | ${daysOfWeek} ${startOn}-${endOn}`}
                                    />
                            )})
                    }
                </Dropdown>
            </div>
            { isFetching ? 
                <div>
                    <div>
                        <Skeleton paragraph={{ width: '40%'}} />
                    </div>
                </div>
                : section ?
                <div>
                    
                    <Typography variant='h1'>{section ? section?.course?.title : "Not Found"}</Typography>
                    <Grid 
                        container
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Grid>
                            <Typography variant='h3'>{section ? `${section?.course?.subject?.title || "Not"} ${section.course?.courseNumber || " found"} ${section.number !== "0" ? section.number : null}` : "Not Found"}</Typography>
                            <Typography variant='p' sx={{ marginBottom: ".5rem"}}>{`${section.instructionalEvents[0].daysOfWeek} ${section.instructionalEvents[0].startOn}-${section.instructionalEvents[0].endOn}`}</Typography>
                        </Grid>
                        <Grid>
                            <Button color="secondary" onClick={handleSubmitAll}>Submit All Saved</Button>
                        </Grid>
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
                        <TableBody>
                            {registrations && registrations.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell columnName="BannerID">
                                            {student.credentials?.bannerId}
                                        </TableCell>
                                        <TableCell columnName="Name">
                                            {student.names[0].lastName}, {student.names[0].firstName}
                                        </TableCell>
                                        <TableCell columnName="Midterm Grade">
                                            {student.grades.midtermGrade?.grade.value}
                                        </TableCell>
                                        <TableCell columnName="Midterm Comments" size="sm">
                                            {student.grades.midtermGrade?.comments ?
                                                <IconButton
                                                    color="secondary" 
                                                    title="View Comments"
                                                    onClick={() => {
                                                        setSelectedStudent(student)
                                                        setSelectedComment(student.grades.midtermGrade.comments)
                                                        setOpenComment(true)
                                                    }}
                                                >
                                                    <CommentsIcon />
                                                </IconButton>
                                                : null
                                            }
                                        </TableCell>
                                        <TableCell columnName="Midterm Status">
                                            {student.grades.midtermGrade?.status === "saved" && 
                                                <StatusLabel type="pending" text="saved" />
                                            }
                                            {student.grades.midtermGrade?.status === "submitted" && 
                                                <StatusLabel type="success" text="submitted" />
                                            }
                                        </TableCell>
                                        <TableCell columnName="Final Grade">
                                            {student.grades.finalGrade?.grade.value}
                                        </TableCell>
                                        <TableCell columnName="Final Comments" size="sm">
                                            {student.grades.finalGrade?.comments ?
                                                <IconButton
                                                    color="secondary" 
                                                    title="View Comments"
                                                    onClick={() => {
                                                        setSelectedStudent(student)
                                                        setSelectedComment(student.grades.finalGrade.comments)
                                                        setOpenComment(true)
                                                    }}
                                                >
                                                    <CommentsIcon />
                                                </IconButton>
                                                : null
                                            }
                                        </TableCell>
                                        <TableCell columnName="Final Status">
                                            {student.grades.finalGrade?.status === "saved" && 
                                                <StatusLabel type="pending" text="saved" />
                                            }
                                            {student.grades.finalGrade?.status === "submitted" && 
                                                <StatusLabel type="success" text="submitted" />
                                            }
                                        </TableCell>
                                        <TableCell columnName="Edit">
                                            <IconButton 
                                                color="secondary" 
                                                title="Edit"
                                                onClick={() => {
                                                    setSelectedStudent(student)
                                                    setSectionRegistrationId(student.sectionRegistration)
                                                    setOpen(true)
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                </div>
                :
                <div>
                    <Typography variant='h1'>{course ? course?.titles[0]?.value : "Not Found"}</Typography>
                    <Typography variant='h3'>{course ? `${course?.subject?.title || "Not"} ${course?.number || " found"}` : "Not Found"}</Typography>
                </div>
            }
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

    const options = /*useMemo(() => (*/[
        {
            resource: 'get-registered-students',
            queryFunction: userTokenDataConnectQuery,
            queryParameters: { accept: "application/vnd.hedtech.integration.v1.0.7+json" },
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
            queryKeys: 'get-sections'
        }
]/*), [sectionId, schemeId, defaultParams, getEthosQuery, sectionRegistrationId]);*/

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