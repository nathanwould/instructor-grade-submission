function transform (message, context) {
    const {
      payload: {
        sectionRegistrationId = '',
        gradeId = '',
        grade = {}
      } = {}
    } = message;
    const { '__user': user } = context;
    
    const personId = user?.id;
    
    const reqBody = {
      sectionRegistration: {
        id: sectionRegistrationId
      },
      grade: {
        type: {
          id: grade.gradeType
        },
        grade: {
          id: grade.grade
        }
      },
      incompleteGrade: {
        extensionDate: grade.extensionDate,
        finalGrade: {
          id: grade.finalGrade
        }
      },
      lastAttendance: {
        date: grade.lastAttendance
      },
      submittedBy: {
        id: personId
      }
    };
    
    return {
      payload: {
        id: gradeId,
        reqBody
      }
    }
  };