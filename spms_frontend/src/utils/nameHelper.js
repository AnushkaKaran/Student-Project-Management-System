export const getStudentDisplayName = (student) => {
    if (!student) return "Unknown Student";

    return (
        student.StudentName ||
        student.FullName ||
        student.Name ||
        [student.FirstName, student.LastName]
            .filter(Boolean)
            .join(" ") ||
        "Unknown Student"
    );
};
