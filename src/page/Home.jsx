import { spacing20 } from '@ellucian/react-design-system/core/styles/tokens';
import { 
    makeStyles, 
    Typography,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton
} from '@ellucian/react-design-system/core';
import { Edit as EditIcon } from '@ellucian/ds-icons/lib';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    userTokenDataConnectQuery, 
    MultiDataQueryProvider 
} from '@ellucian/experience-extension-extras';
import { usePageControl } from '@ellucian/experience-extension-utils';
import { useStudents } from '../utils/hooks/useStudents';
import GradeDialog from './components/GradeDialog';
import PropTypes from 'prop-types';
// import { useGradeDefinitions } from '../utils/hooks/useGradeDefinitions';

const useStyles = makeStyles(() => ({
    card: {
        margin: `0 ${spacing20}`
    }
}));

const SectionRegistrations = ({ schemeId, setSchemeId }) => {
    const classes = useStyles();
    const { setPageTitle } = usePageControl("Sections");
    setPageTitle(' ')

    const [open, setOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState();

    const { course, registrations } = useStudents();

    useEffect(() => {
        setSchemeId(selectedStudent?.gradeScheme)
    }, [selectedStudent, setSchemeId])

    return (
        <div className={classes.card}>
            <Typography variant='h1'>{course?.titles[0]?.value || "Not Found"}</Typography>
            <Typography variant='h3'>{`${course?.subject?.title} ${course?.number}` || "Not Found"}</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>BannerID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Midterm Grade</TableCell>
                        <TableCell>Midterm Comments</TableCell>
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
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
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
            />
        </div>
    );
};

SectionRegistrations.propTypes = {
    schemeId: PropTypes.string,
    setSchemeId: PropTypes.func.isRequired
}

function SectionRegistrationsWithProvider() {
    const { sectionId } = useParams();
    const [schemeId, setSchemeId] = useState();

    const options = useMemo(() => ([
        {
            resource: 'get-registered-students',
            queryFunction: userTokenDataConnectQuery,
            queryParameters: { accept: "application/vnd.hedtech.integration.v1.0.4+json" },
            queryKeys: { searchParameters: { sectionId } }
        },
        {
            resource: 'get-grade-definitions',
            queryFunction: userTokenDataConnectQuery,
            queryParameters: { accept: "application/vnd.hedtech.integration.v1+json" },
            queryKeys: { searchParameters: { schemeId } },
        }
]), [sectionId, schemeId]);

    return (
        <MultiDataQueryProvider options={options}>
            <SectionRegistrations setSchemeId={setSchemeId} schemeId={schemeId} />
        </MultiDataQueryProvider>
    )
}

export default SectionRegistrationsWithProvider;