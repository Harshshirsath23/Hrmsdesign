import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { updateAdminEmployee } from '../../../store/slices/adminSlice';
import { fetchEmployeeData } from '../../../store/slices/employeeSlice';
import { logActivity, fetchActivities } from '../../../store/slices/activitySlice';
import { addNotification } from '../../../store/slices/notificationSlice';
import { Employee } from '../employees/mockData';
import { ensureProfile } from '../../modules/ess/storage';
import { mergeAdminEmployeeIntoEssProfile, writeEssProfileToStorage } from '../../modules/ess/adminEssSync';

function getDifferences(oldObj: any, newObj: any, prefix = ''): any[] {
  let diffs: any[] = [];
  if (!oldObj || !newObj) return diffs;
  for (let key in newObj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof newObj[key] === 'object' && newObj[key] !== null && !Array.isArray(newObj[key])) {
      diffs = diffs.concat(getDifferences(oldObj[key] || {}, newObj[key], fullKey));
    } else if (Array.isArray(newObj[key])) {
      if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
        diffs.push({ fieldName: fullKey, oldValue: 'List Changed', newValue: 'List Changed' });
      }
    } else {
      if (oldObj[key] !== newObj[key]) {
        diffs.push({ fieldName: fullKey, oldValue: oldObj[key], newValue: newObj[key] });
      }
    }
  }
  return diffs;
}

export function useAdminSync() {
  const dispatch = useDispatch<AppDispatch>();

  const handleAdminSave = async (
    sectionName: string,
    originalData: Employee,
    editedData: Employee,
    adminName: string = 'Superadmin'
  ) => {
    // 1. Calculate diffs
    const diffs = getDifferences(originalData, editedData);

    if (diffs.length === 0) {
      dispatch(addNotification({ type: 'warning', message: 'No changes detected.' }));
      return false;
    }

    // 2. Dispatch logActivity for each diff
    await Promise.all(
      diffs.map((diff) =>
        dispatch(
          logActivity({
            employeeId: editedData.id,
            adminName,
            editedSection: sectionName,
            changedField: diff.fieldName,
            oldValue: diff.oldValue,
            newValue: diff.newValue,
          })
        ).unwrap()
      )
    );

    await dispatch(fetchActivities(editedData.id)).unwrap();

    // 3. Update Admin Store
    dispatch(updateAdminEmployee(editedData));

    // 4. Sync ESS profile from admin (single merge — keeps documents, employment, etc.)
    const mergedEss = mergeAdminEmployeeIntoEssProfile(editedData, ensureProfile(editedData.id));
    writeEssProfileToStorage(editedData.id, mergedEss);
    dispatch(fetchEmployeeData(editedData.id));

    // 5. Toast success
    dispatch(addNotification({ type: 'success', message: 'Employee profile updated successfully.' }));
    return true;
  };

  return { handleAdminSave };
}
