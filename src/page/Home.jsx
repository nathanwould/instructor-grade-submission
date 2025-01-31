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
    userTokenDataConnectQuery, 
    MultiDataQueryProvider 
} from '@ellucian/experience-extension-extras';
import { usePageControl } from '@ellucian/experience-extension-utils';
import { useGraphQLFetch } from '../utils/hooks/useGraphQl';
import { useStudents } from '../utils/hooks/useStudents';
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

    const { data } = useGraphQLFetch();

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
                    {data.isLoading ?
                        <DropdownItem label={<Skeleton paragraph={{ width: '10sku' }} />} />
                        :   data.totalCount === 0 ? 
                            <DropdownItem>
                                <Typography>No courses found</Typography>
                            </DropdownItem>
                            : data.fetchedData.map(section => (
                                <DropdownItem
                                    key={section.id}
                                    value={section.section16.sectionID}
                                    label={`${course?.subject?.title} ${course?.number}`}
                                />
                            ))
                    }
                </Dropdown>
            </div>
            { isFetching ? 
                <div>
                    <div>
                        <Skeleton paragraph={{ width: '40%'}} />
                    </div>
                </div>
                :
                <div>
                    <Typography variant='h1'>{course ? course?.titles[0]?.value : "Not Found"}</Typography>
                    <Typography variant='h3'>{course ? `${course?.subject?.title} ${course?.number}` : "Not Found"}</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>BannerID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Midterm Status</TableCell>
                                <TableCell>Midterm Grade</TableCell>
                                <TableCell>Midterm Comments</TableCell>
                                <TableCell>Final Status</TableCell>
                                <TableCell>Final Grade</TableCell>
                                <TableCell>Final Comments</TableCell>
                                <TableCell>Edit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {registrations && registrations.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.credentials?.bannerId}</TableCell>
                                        <TableCell>{student.names[0].fullName}</TableCell>
                                        <TableCell>{student.grades.midtermGrade?.grade.value}</TableCell>
                                        <TableCell>{student.grades.midtermGrade?.grade.comments}</TableCell>
                                        <TableCell><StatusLabel type="success" text="submitted" /></TableCell>
                                        <TableCell>{student.grades.finalGrade?.grade.value}</TableCell>
                                        <TableCell>{student.grades.finalGrade?.grade.comments}</TableCell>
                                        <TableCell><StatusLabel type="pending" text="saved" /></TableCell>
                                        <TableCell>
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

    const [schemeId, setSchemeId] = useState();
    
    const defaultParams = useMemo(() => ({ accept: "application/vnd.hedtech.integration.v1+json" }), [])

    const options = useMemo(() => ([
        {
            resource: 'get-registered-students',
            queryFunction: userTokenDataConnectQuery,
            queryParameters: defaultParams,
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
]), [sectionId, schemeId, defaultParams]);

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