let employees = JSON.parse(localStorage.getItem('employees')) || [];
let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || {};

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  if (id === 'dashboard') updateDashboard();
}

document.getElementById('addEmployeeForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const newEmp = {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    doj: document.getElementById('doj').value,
    designation: document.getElementById('designation').value.trim()
  };
  employees.push(newEmp);
  localStorage.setItem('employees', JSON.stringify(employees));
  alert('Employee added!');
  this.reset();
});

function loadAttendanceTable() {
  const selectedMonth = document.getElementById('attendanceMonth').value;
  if (!selectedMonth) {
    alert('Please select a month first.');
    return;
  }

  const container = document.getElementById('attendanceTableContainer');
  container.innerHTML = '';

  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const table = document.createElement('table');
  table.classList.add('attendance-table');

  // Table header
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = `<th>Name</th><th>Phone</th><th>Designation</th>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    headRow.innerHTML += `<th class="${date.getDay() === 0 ? 'sunday' : ''}">${dayName}<br>${d}</th>`;
  }

  headRow.innerHTML += `<th>Present</th><th>Absent</th><th>Leave</th><th>Actions</th>`;
  thead.appendChild(headRow);
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement('tbody');
  employees.forEach((emp, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${emp.name}</td><td>${emp.phone}</td><td>${emp.designation}</td>`;

    const monthKey = `${emp.name}_${selectedMonth}`;
    const record = attendanceRecords[monthKey] || {};
    let presentCount = 0, absentCount = 0, leaveCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const val = record[dateKey] || '';
      const date = new Date(year, month - 1, d);
      const isSunday = date.getDay() === 0;

      if (val === 'P') presentCount++;
      else if (val === 'A') absentCount++;
      else if (val === 'L') leaveCount++;

      row.innerHTML += `
        <td class="${isSunday ? 'sunday' : ''}">
          <select data-emp="${emp.name}" data-date="${dateKey}" ${isSunday ? 'disabled' : ''}>
            <option value="">--</option>
            <option value="P" ${val === 'P' ? 'selected' : ''}>P</option>
            <option value="A" ${val === 'A' ? 'selected' : ''}>A</option>
            <option value="L" ${val === 'L' ? 'selected' : ''}>L</option>
          </select>
        </td>`;
    }

    row.innerHTML += `<td>${presentCount}</td><td>${absentCount}</td><td>${leaveCount}</td>`;
    row.innerHTML += `<td>
      <button onclick="editEmployee(${index})">Edit</button>
      <button onclick="deleteEmployee(${index})">Delete</button>
    </td>`;

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

function saveAttendance() {
  const selects = document.querySelectorAll('#attendanceTableContainer select');
  selects.forEach(sel => {
    const emp = sel.dataset.emp;
    const date = sel.dataset.date;
    const value = sel.value;
    if (!emp || !date) return;
    const month = date.slice(0, 7);
    const key = `${emp}_${month}`;
    if (!attendanceRecords[key]) attendanceRecords[key] = {};
    attendanceRecords[key][date] = value;
  });

  localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  alert('Attendance Saved!');
  loadAttendanceTable();
  updateDashboard();
}

function updateDashboard() {
    let present = 0, absent = 0, leave = 0;
  
    for (const key in attendanceRecords) {
      const empData = attendanceRecords[key];
      for (const date in empData) {
        if (empData[date] === 'P') present++;
        else if (empData[date] === 'A') absent++;
        else if (empData[date] === 'L') leave++;
      }
    }
  
    document.getElementById('totalEmployees').textContent = employees.length;
    document.getElementById('totalPresent').textContent = present;
    document.getElementById('totalAbsent').textContent = absent;
    document.getElementById('totalLeave').textContent = leave;
  
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    if (window.attendanceChart && typeof window.attendanceChart.destroy === 'function') {
      window.attendanceChart.destroy();
    }
    
    window.attendanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Present', 'Absent', 'Leave'],
        datasets: [{
          label: 'Attendance Count',
          data: [present, absent, leave],
          backgroundColor: ['#4CAF50', '#F44336', '#FF9800'],
          borderColor: ['#388E3C', '#D32F2F', '#F57C00'],
        //   borderWidth: 1,
        //   borderRadius: 5,
        //   maxBarThickness: 60,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: '#ddd' }
          },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.7)',
            titleFont: { size: 14 },
            bodyFont: { size: 12 }
          }
        },
        animation: {
          duration: 700,
          easing: 'easeOutQuart'
        }
      }
    });
  }
  

function editEmployee(index) {
  const emp = employees[index];
  const newName = prompt("Edit Name", emp.name);
  const newPhone = prompt("Edit Phone", emp.phone);
  const newDoj = prompt("Edit Date of Joining (YYYY-MM-DD)", emp.doj);
  const newDesignation = prompt("Edit Designation", emp.designation);

  if (newName && newPhone && newDoj && newDesignation) {
    employees[index] = {
      name: newName,
      phone: newPhone,
      doj: newDoj,
      designation: newDesignation
    };
    localStorage.setItem('employees', JSON.stringify(employees));
    alert('Employee details updated!');
    loadAttendanceTable();
    updateDashboard();
  }
}

function deleteEmployee(index) {
  if (confirm('Are you sure you want to delete this employee?')) {
    const emp = employees[index];
    for (const key in attendanceRecords) {
      if (key.startsWith(emp.name + '_')) {
        delete attendanceRecords[key];
      }
    }
    employees.splice(index, 1);
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    alert('Employee deleted!');
    loadAttendanceTable();
    updateDashboard();
  }
}

window.onload = function () {
  showSection('dashboard');
};
