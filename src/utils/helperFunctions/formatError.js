export const formatError = (errorMessage) => 
    errorMessage[0].toUpperCase().concat(errorMessage.slice(1)).replace(/!/, "").concat(".")