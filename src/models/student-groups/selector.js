export const studentGroupsSelector = (state) => state.models.studentGroups;
export const addStudentGroupsSelector = (state) => state.models.studentGroups.addStudentGroup;
export const editStudentGroupsSelector = (state) => state.models.studentGroups.editStudentGroup;
export const loadStudentGroupsSelector = (state) => state.models.studentGroups.loadStudentGroups;
export const loadStudentGroupsByIdSelector = (state) => (
  state.models.studentGroups.loadStudentGroupById
);
