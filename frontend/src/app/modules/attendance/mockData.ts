import { DailyAttendance, AttendanceException, AttendanceRequest, ShiftDefinition, RosterRecord, SwipeLog, DeviceHealth } from "./types";

const DEPARTMENTS = ["Engineering", "Product", "Design", "HR", "Marketing", "Sales"];
const DESIGNATIONS = ["Software Engineer", "Senior Engineer", "Product Manager", "UI Designer", "HR Manager", "Marketing Lead"];
const TEAMS = ["Core Platform", "Mobile App", "User Experience", "Talent Acquisition", "Brand Growth"];
const SHIFTS = ["General Shift (09:00 - 18:00)", "Morning Shift (06:00 - 15:00)", "Evening Shift (14:00 - 23:00)"];

const EMPLOYEES = [
  { id: "EMP001", name: "Amit Sharma", dept: "Engineering", desig: "Senior Engineer", team: "Core Platform", email: "amit.s@company.com", contact: "+91 98765 43210", manager: "Rajesh Kumar" },
  { id: "EMP002", name: "Priya Patel", dept: "Product", desig: "Product Manager", team: "Mobile App", email: "priya.p@company.com", contact: "+91 98765 43211", manager: "Rajesh Kumar" },
  { id: "EMP003", name: "Rahul Verma", dept: "Design", desig: "UI Designer", team: "User Experience", email: "rahul.v@company.com", contact: "+91 98765 43212", manager: "Sonia Mehra" },
  { id: "EMP004", name: "Ananya Iyer", dept: "Engineering", desig: "Software Engineer", team: "Core Platform", email: "ananya.i@company.com", contact: "+91 98765 43213", manager: "Amit Sharma" },
  { id: "EMP005", name: "Siddharth Malhotra", dept: "HR", desig: "HR Manager", team: "Talent Acquisition", email: "sid.m@company.com", contact: "+91 98765 43214", manager: "Sonia Mehra" },
  { id: "EMP006", name: "Sneha Reddy", dept: "Marketing", desig: "Marketing Lead", team: "Brand Growth", email: "sneha.r@company.com", contact: "+91 98765 43215", manager: "Vikram Singh" },
  { id: "EMP007", name: "Vikram Singh", dept: "Engineering", desig: "Software Engineer", team: "Mobile App", email: "vikram.s@company.com", contact: "+91 98765 43216", manager: "Amit Sharma" },
  { id: "EMP008", name: "Kavita Joshi", dept: "Sales", desig: "Sales Lead", team: "Brand Growth", email: "kavita.j@company.com", contact: "+91 98765 43217", manager: "Vikram Singh" },
  { id: "EMP009", name: "Rohan Gupta", dept: "Engineering", desig: "Senior Engineer", team: "Core Platform", email: "rohan.g@company.com", contact: "+91 98765 43218", manager: "Amit Sharma" },
  { id: "EMP010", name: "Megha Rao", dept: "Product", desig: "Product Analyst", team: "Mobile App", email: "megha.r@company.com", contact: "+91 98765 43219", manager: "Priya Patel" },
];

export const SHIFT_DEFINITIONS: ShiftDefinition[] = [
  { id: "S1", code: "GEN", name: "General Shift", startTime: "09:00", endTime: "18:00", color: "bg-blue-500", type: "General" },
  { id: "S2", code: "NS", name: "Night Shift", startTime: "22:00", endTime: "07:00", color: "bg-indigo-600", type: "Night" },
  { id: "S3", code: "FS", name: "First Shift", startTime: "06:00", endTime: "15:00", color: "bg-emerald-500", type: "Rotational" },
  { id: "S4", code: "SS", name: "Second Shift", startTime: "14:00", endTime: "23:00", color: "bg-amber-500", type: "Rotational" },
  { id: "S5", code: "OFF", name: "Week Off", startTime: "00:00", endTime: "00:00", color: "bg-slate-200", type: "General" },
  { id: "S6", code: "WFH", name: "Work From Home", startTime: "09:00", endTime: "18:00", color: "bg-purple-500", type: "Flexible" },
  { id: "S7", code: "OD", name: "On Duty", startTime: "09:00", endTime: "18:00", color: "bg-cyan-500", type: "Flexible" },
  { id: "S8", code: "HL", name: "Holiday", startTime: "00:00", endTime: "00:00", color: "bg-red-200", type: "General" },
];

const generateAttendance = (month: number, year: number): DailyAttendance[] => {
  const data: DailyAttendance[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  EMPLOYEES.forEach(emp => {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(date).getDay();

      const baseRecord: Partial<DailyAttendance> = {
        id: `ATT-${emp.id}-${date}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.dept,
        designation: emp.desig,
        team: emp.team,
        email: emp.email,
        contactNo: emp.contact,
        manager: emp.manager,
        date,
        shiftName: SHIFTS[0],
        expectedInTime: "09:00 AM",
        avgLoginTime: "09:05 AM",
        leaveBalance: 15,
        location: "Mumbai HQ",
        deviceSource: "Web Portal",
        lastAttendanceDate: `${year}-${String(month).padStart(2, '0')}-${String(day - 1).padStart(2, '0')}`,
      };

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        data.push({
          ...(baseRecord as DailyAttendance),
          status: "Week Off",
          workMode: "WFO",
          workHours: 0,
          lateMins: 0,
          earlyExitMins: 0,
          lop: 0,
          otMins: 0,
          exception: false,
          approvalPending: false,
          geoViolation: false,
          locked: true,
          isLate: false,
          isAbsent: false,
          isHalfDay: false
        });
        continue;
      }

      const rand = Math.random();
      let status: any = "Present";
      let isAbsent = false;
      let isHalfDay = false;
      let isLate = Math.random() > 0.8;
      let workHours = 8 + (Math.random() * 2 - 1);
      let workMode: any = Math.random() > 0.8 ? "WFH" : "WFO";

      if (rand > 0.95) {
        status = "Absent";
        isAbsent = true;
        workHours = 0;
        isLate = false;
      } else if (rand > 0.9) {
        status = "Half Day";
        isHalfDay = true;
        workHours = 4;
      } else if (rand > 0.85) {
        status = "Leave";
        isAbsent = true;
        workHours = 0;
        isLate = false;
        baseRecord.leaveType = "Privilege Leave";
        baseRecord.leaveDuration = "1 Day";
        baseRecord.returnDate = `${year}-${String(month).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
      }

      data.push({
        ...(baseRecord as DailyAttendance),
        status,
        workMode,
        firstIn: status === "Present" ? (isLate ? "09:45 AM" : "09:05 AM") : "",
        lastOut: status === "Present" ? "06:15 PM" : "",
        workHours: status === "Present" ? workHours : (status === "Half Day" ? 4 : 0),
        lateMins: isLate ? 45 : 0,
        delayMins: isLate ? 45 : 0,
        earlyExitMins: 0,
        lop: isAbsent ? 1 : (isHalfDay ? 0.5 : 0),
        otMins: workHours > 8.5 ? (workHours - 8.5) * 60 : 0,
        exception: isLate || isAbsent,
        approvalPending: false,
        geoViolation: false,
        locked: false,
        isLate,
        isAbsent,
        isHalfDay,
        graceUsed: isLate && Math.random() > 0.5,
        lateLoginCycle: "Cycle 1 (1-15 May)",
      });
    }
  });

  return data;
};

const generateRoster = (month: number, year: number): RosterRecord[] => {
  const data: RosterRecord[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  EMPLOYEES.forEach(emp => {
    const shifts: { [date: string]: string } = {};
    let workingDays = 0;
    let weekOffs = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(date).getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        shifts[date] = "OFF";
        weekOffs++;
      } else {
        const rand = Math.random();
        if (rand > 0.95) shifts[date] = "HL";
        else if (rand > 0.9) shifts[date] = "NS";
        else if (rand > 0.85) shifts[date] = "WFH";
        else {
          shifts[date] = "GEN";
          workingDays++;
        }
      }
    }

    data.push({
      id: `ROSTER-${emp.id}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeCode: emp.id,
      department: emp.dept,
      designation: emp.desig,
      team: emp.team,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.id}`,
      workingDays,
      weekOffs,
      shifts,
    });
  });

  return data;
};

const generateSwipeLogs = (count: number): SwipeLog[] => {
  const data: SwipeLog[] = [];
  const deviceTypes: any[] = ["Biometric Device", "Mobile App", "Web Login", "QR Attendance", "RFID Card"];
  const verificationMethods: any[] = ["Face", "Fingerprint", "Mobile GPS", "QR Scan", "Card Tap"];
  const statuses: any[] = ["Approved", "Pending", "Rejected", "Missing Punch", "Duplicate Swipe", "Late Entry", "Early Exit"];
  const branches = ["Mumbai HQ", "Pune Office", "Bangalore Tech Park", "Delhi Regional"];
  const doors = ["Main Entrance", "Server Room", "Cafeteria", "South Wing Exit"];

  for (let i = 0; i < count; i++) {
    const emp = EMPLOYEES[Math.floor(Math.random() * EMPLOYEES.length)];
    const isToday = Math.random() > 0.3;
    const date = isToday ? "2026-05-11" : `2026-05-${String(Math.floor(Math.random() * 10) + 1).padStart(2, '0')}`;
    const hour = Math.floor(Math.random() * 14) + 6; // 6 AM to 8 PM
    const min = Math.floor(Math.random() * 60);
    const sec = Math.floor(Math.random() * 60);
    const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    const type = Math.random() > 0.5 ? "IN" : "OUT";

    data.push({
      id: `SWIPE-${i}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeCode: emp.id,
      department: emp.dept,
      designation: emp.desig,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.id}`,
      swipeDate: date,
      swipeTime: time,
      type: type as "IN" | "OUT",
      shiftName: "General Shift",
      shiftTiming: "09:00 - 18:00",
      deviceName: "BioMax-X990",
      deviceId: `DEV-${Math.floor(Math.random() * 1000)}`,
      deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
      accessCardId: `CRD-${Math.floor(Math.random() * 10000)}`,
      branch: branches[Math.floor(Math.random() * branches.length)],
      doorName: doors[Math.floor(Math.random() * doors.length)],
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      gpsCoordinates: "19.0760° N, 72.8777° E",
      receivedOn: `${date} ${time}`,
      syncTime: `${date} ${time}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      verificationMethod: verificationMethods[Math.floor(Math.random() * verificationMethods.length)],
      spoofDetection: Math.random() > 0.9 ? "Suspicious" : "Safe",
      faceMatchScore: Math.random() > 0.8 ? 98.5 : undefined,
    });
  }

  return data.sort((a, b) => b.swipeTime.localeCompare(a.swipeTime));
};

export const MOCK_DEVICES: DeviceHealth[] = [
  { id: "D1", name: "BioMax Main Entry", status: "Online", lastSyncTime: "2026-05-11 10:15 AM", batteryStatus: 85, location: "Main Gate" },
  { id: "D2", name: "BioMax Cafeteria", status: "Online", lastSyncTime: "2026-05-11 10:10 AM", batteryStatus: 92, location: "Cafeteria" },
  { id: "D3", name: "QR Scanner North", status: "Offline", lastSyncTime: "2026-05-10 06:00 PM", batteryStatus: 0, location: "North Wing" },
  { id: "D4", name: "Mobile App Hub", status: "Online", lastSyncTime: "2026-05-11 10:18 AM", batteryStatus: 100, location: "Cloud" },
];

export const MOCK_ATTENDANCE: DailyAttendance[] = generateAttendance(5, 2026);
export const MOCK_ROSTER: RosterRecord[] = generateRoster(5, 2026);
export const MOCK_SWIPE_LOGS: SwipeLog[] = generateSwipeLogs(200);

export const MOCK_EXCEPTIONS: AttendanceException[] = [
  { id: "EXC1", employeeId: "EMP001", date: "2026-05-10", type: "Late Cycle Trigger", status: "Pending", severity: "Warning" },
  { id: "EXC2", employeeId: "EMP004", date: "2026-05-09", type: "Missing Punch", status: "Pending", severity: "Critical" },
];

export const MOCK_REQUESTS: AttendanceRequest[] = [
  { id: "REQ1", employeeId: "EMP002", type: "Regularization", date: "2026-05-07", reason: "Forgot to punch out", status: "Pending" },
];

export const MOCK_ATTENDANCE_DATA: DailyAttendance[] = generateAttendance(5, 2026);

const generateMatrixData = (month: number, year: number): any[] => {
  const data: any[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  EMPLOYEES.forEach(emp => {
    const record: any = {
      id: emp.id,
      name: emp.name,
      department: emp.dept,
      designation: emp.desig,
      attendance: {}
    };

    let pCount = 0, aCount = 0, lCount = 0, hCount = 0, woCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(dateKey).getDay();
      
      let status = "P";
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = "WO";
        woCount++;
      } else {
        const rand = Math.random();
        if (rand > 0.95) { status = "A"; aCount++; }
        else if (rand > 0.9) { status = "L"; lCount++; }
        else if (rand > 0.85) { status = "WFH"; pCount++; }
        else { status = "P"; pCount++; }
      }
      
      record.attendance[dateKey] = {
        status,
        swipeIn: status === "P" || status === "WFH" ? "09:05 AM" : null,
        swipeOut: status === "P" || status === "WFH" ? "06:15 PM" : null,
        totalHours: status === "P" || status === "WFH" ? 9.1 : (status === "HD" ? 4.5 : 0),
        shift: "General Shift",
        remarks: status === "L" ? "Sick Leave Applied" : (status === "A" ? "No Information" : ""),
        history: [
          { time: "2026-05-11 10:00 AM", user: "System", action: "Status Generated", from: "-", to: status }
        ]
      };
    }

    record.summary = { P: pCount, A: aCount, L: lCount, H: hCount, WO: woCount, OT: 2, totalWorking: pCount + aCount };
    data.push(record);
  });
  return data;
};

export const MOCK_MATRIX_DATA = generateMatrixData(5, 2026);

export const MOCK_DEPARTMENTS = DEPARTMENTS;
export const MOCK_DESIGNATIONS = DESIGNATIONS;
export const MOCK_TEAMS = TEAMS;
export const MOCK_EMPLOYEES = EMPLOYEES;
export const MOCK_SHIFTS = SHIFTS;

// Aliases for backward compatibility
export const attendanceEmployees = MOCK_EMPLOYEES;
export const attendanceExceptions = MOCK_EXCEPTIONS;
export const attendanceRequests = MOCK_REQUESTS;
export const dailyAttendance = MOCK_ATTENDANCE;
