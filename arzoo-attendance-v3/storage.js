// storage.js
function getEmployees() {
    return JSON.parse(localStorage.getItem("employees") || "[]");
  }
  
  function saveEmployees(data) {
    localStorage.setItem("employees", JSON.stringify(data));
  }
  
  function getAttendance(month) {
    return JSON.parse(localStorage.getItem("attendance_" + month) || "{}");
  }
  
  function saveAttendanceData(month, data) {
    localStorage.setItem("attendance_" + month, JSON.stringify(data));
  }
  