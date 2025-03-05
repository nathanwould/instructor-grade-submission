import React from 'react';
import { 
    // makeStyles,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton,
    StatusLabel
} from '@ellucian/react-design-system/core';
import { Edit as EditIcon, Comments as CommentsIcon } from '@ellucian/ds-icons/lib';
import PropTypes from 'prop-types';

export default function StudentsTable({
    registrations,
    handleOpenEdit,
    handleOpenComment
}) {
    return (
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
                {registrations.map(student => {
                    const { names, grades, credentials } = student;
                    return (
                        <TableRow key={student.id}>
                            <TableCell columnName="BannerID">
                                {credentials?.bannerId}
                            </TableCell>
                            <TableCell columnName="Name">
                                {names[0].lastName}, {names[0].firstName}
                            </TableCell>
                            <TableCell columnName="Midterm Grade">
                                {grades.midtermGrade?.grade.value}
                            </TableCell>
                            <TableCell columnName="Midterm Comments" size="sm">
                                {grades.midtermGrade?.comments ?
                                    <IconButton
                                        color="secondary" 
                                        title="View Comments"
                                        onClick={() => {
                                            handleOpenComment({ student }, grades.midtermGrade.comments)
                                        }}
                                    >
                                        <CommentsIcon />
                                    </IconButton>
                                    : null
                                }
                            </TableCell>
                            <TableCell columnName="Midterm Status">
                                {grades.midtermGrade?.status === "saved" && 
                                    <StatusLabel type="pending" text="saved" />
                                }
                                {grades.midtermGrade?.status === "submitted" && 
                                    <StatusLabel type="success" text="submitted" />
                                }
                            </TableCell>
                            <TableCell columnName="Final Grade">
                                {grades.finalGrade?.grade.value}
                            </TableCell>
                            <TableCell columnName="Final Comments" size="sm">
                                {grades.finalGrade?.comments ?
                                    <IconButton
                                        color="secondary" 
                                        title="View Comments"
                                        onClick={() => {
                                            handleOpenComment({ student }, grades.finalGrade.comments)
                                        }}
                                    >
                                        <CommentsIcon />
                                    </IconButton>
                                    : null
                                }
                            </TableCell>
                            <TableCell columnName="Final Status">
                                {grades.finalGrade?.status === "saved" && 
                                    <StatusLabel type="pending" text="saved" />
                                }
                                {grades.finalGrade?.status === "submitted" && 
                                    <StatusLabel type="success" text="submitted" />
                                }
                            </TableCell>
                            <TableCell columnName="Edit">
                                <IconButton 
                                    color="secondary" 
                                    title="Edit"
                                    onClick={() => {
                                        handleOpenEdit({ student })
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

StudentsTable.propTypes = {
    registrations: PropTypes.array.isRequired,
    handleOpenEdit: PropTypes.func.isRequired,
    handleOpenComment: PropTypes.func.isRequired
};