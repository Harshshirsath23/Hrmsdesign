import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { employees as initialEmployees, Employee, normalizeLegacyEmployee } from '../../app/components/employees/mockData';

// Helper to sync with localStorage
const loadAdminEmployees = (): Employee[] => {
  const raw = localStorage.getItem('admin_employees_db');
  if (!raw) return initialEmployees;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return initialEmployees;
    return parsed.map((row) => normalizeLegacyEmployee(row as Record<string, unknown>));
  } catch {
    return initialEmployees;
  }
};

const saveAdminEmployees = (emps: Employee[]) => {
  localStorage.setItem('admin_employees_db', JSON.stringify(emps));
};

interface AdminState {
  employees: Employee[];
}

const initialState: AdminState = {
  employees: loadAdminEmployees(),
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    updateAdminEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(e => e.id === action.payload.id);
      if (index >= 0) {
        state.employees[index] = action.payload;
        saveAdminEmployees(state.employees);
      }
    },
  },
});

export const { updateAdminEmployee } = adminSlice.actions;
export default adminSlice.reducer;
