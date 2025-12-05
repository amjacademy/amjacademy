# TODO: Ensure Unique IDs in User Enrollment

## Task Overview
Modify the ID generation logic in `src/components/Admin/User_enrollment.jsx` to ensure IDs are unique forever. IDs should increment from the highest existing number without reusing deleted IDs.

## Steps
- [x] Modify the `genId` function in `IdTools` component to find the maximum existing ID number and increment from there instead of finding the next missing number.
- [ ] Test the ID generation to ensure it works correctly for both students (AMJS) and teachers (AMJT).
- [ ] Verify that deleted IDs are not reused.

## Files to Edit
- `src/components/Admin/User_enrollment.jsx`

## Followup Steps
- [ ] Test the enrollment process to ensure new IDs are generated correctly.
- [ ] Check that existing enrollments are not affected.
