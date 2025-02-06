import { spacing20 } from '@ellucian/react-design-system/core/styles/tokens';
import { 
    makeStyles, 
    Dropdown,
    DropdownItem,
    Typography,
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
import { Edit as EditIcon } from '@ellucian/ds-icons/lib';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    useDataQuery, 
    userTokenDataConnectQuery, 
    MultiDataQueryProvider 
} from '@ellucian/experience-extension-extras';
import { 
    // useUserInfo,
    useData, 
    usePageControl } from '@ellucian/experience-extension-utils';
// import { useGraphQLFetch } from '../utils/hooks/useGraphQl';
import { useStudents } from '../utils/hooks/useStudents';
import { getSections } from '../utils/queries/getSections';
import GradeDialog from './components/GradeDialog';
import PropTypes from 'prop-types';
import { useGradeTypes } from '../utils/queries/getGradeTypes';

const useStyles = makeStyles(() => ({
    card: {
        margin: `0 ${spacing20} 4rem`
    },
    Dropdown: {
        margin: `1.5rem 0`
    }
}));

const SectionRegistrations = ({ 
    schemeId, 
    setSchemeId, 
    sectionId
 }) => {
    const classes = useStyles();
    const { setPageTitle, navigateToPage } = usePageControl("Sections");
    setPageTitle(' ')

    const [open, setOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState();
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState();

    const { data: sections, isFetching: isFetchingSections } = useDataQuery('instructor-section-registration-viewer')

    // console.log(sections)

    const { course, registrations, isFetching } = useStudents();
    const { gradeTypes } = useGradeTypes();

    useEffect(() => {
        setSchemeId(selectedStudent?.gradeScheme)
    }, [selectedStudent, setSchemeId])

    const handleChangeSection = (e) => {
        navigateToPage({ route: `sections/${e.target.value}` })
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
                                <Typography>No courses found</Typography>
                            </DropdownItem>
                            : sections?.map(section => {
                                const { daysOfWeek, startOn, endOn } = section.instructionalEvents[0];
                                return (
                                    <DropdownItem
                                        key={section.id}
                                        value={section.id}
                                        label={`${section.course.subject.title} ${section.course.number} | ${daysOfWeek} ${startOn}-${endOn}`}
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
                : course ?
                <div>
                    <Typography variant='h1'>{course ? course?.titles[0]?.value : "Not Found"}</Typography>
                    <Typography variant='h3'>{course ? `${course?.subject?.title || "Not"} ${course?.number || " found"}` : "Not Found"}</Typography>
                    <Table layout={{ variant: 'card', breakpoint: 'sm' }}>
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
                                            {student.grades.midtermGrade?.grade.comments}
                                        </TableCell>
                                        <TableCell columnName="Midterm Status">
                                            <StatusLabel type="success" text="submitted" />
                                        </TableCell>
                                        <TableCell columnName="Final Grade">
                                            {student.grades.finalGrade?.grade.value}
                                        </TableCell>
                                        <TableCell columnName="Final Comments" size="sm">
                                            {student.grades.finalGrade?.grade.comments}
                                        </TableCell>
                                        <TableCell columnName="Final Status">
                                            <StatusLabel type="pending" text="saved" />
                                        </TableCell>
                                        <TableCell columnName="Edit">
                                            <IconButton 
                                                color="secondary" 
                                                title="Edit"
                                                onClick={() => {
                                                    setSelectedStudent(student)
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
                        schemeId={schemeId}
                        gradeTypes={gradeTypes}
                        setShowSnackbar={setShowSnackbar}
                        setSnackbarMessage={setSnackbarMessage}
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
    schemeId: PropTypes.string,
    setSchemeId: PropTypes.func.isRequired,
    sectionId: PropTypes.string
}

function SectionRegistrationsWithProvider() {
    const { sectionId } = useParams();
    const { getEthosQuery } = useData();

    const [schemeId, setSchemeId] = useState();
    
    const defaultParams = useMemo(() => ({ accept: "application/vnd.hedtech.integration.v1+json" }), [])

    const options = useMemo(() => ([
        {
            resource: 'get-registered-students',
            queryFunction: userTokenDataConnectQuery,
            queryParameters: { accept: "application/vnd.hedtech.integration.v1.0.7+json" },
            queryKeys: { searchParameters: { sectionId } }
        },
        {
            resource: 'get-grade-definitions',
            queryFunction: userTokenDataConnectQuery,
            queryParameters: defaultParams,
            queryKeys: { searchParameters: { schemeId } },
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
]), [sectionId, schemeId, defaultParams, getEthosQuery]);

    return (
        <MultiDataQueryProvider options={options}>
            <SectionRegistrations 
                setSchemeId={setSchemeId} 
                schemeId={schemeId} 
                sectionId={sectionId}
            />
        </MultiDataQueryProvider>
    )
}

export default SectionRegistrationsWithProvider;