import React, { createContext, useContext } from 'react';

interface EmployeeFormContextType {
  finalSubmitted: boolean;
}

const EmployeeFormContext = createContext<EmployeeFormContextType | null>(null);

export const EmployeeFormProvider = ({ children, value }: { children: React.ReactNode; value: EmployeeFormContextType }) => {
  return <EmployeeFormContext.Provider value={value}>{children}</EmployeeFormContext.Provider>;
};

export const useEmployeeFormContext = () => {
  return useContext(EmployeeFormContext);
};

export default EmployeeFormContext;
