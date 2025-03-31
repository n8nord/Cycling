// LocalStorage keys
const topicsKey = 'topics';
const calendarKey = 'calendarEvents';
let topics = [];
let calendarEvents = [];

// Load/Save functions
function loadTopics() {
  const stored = localStorage.getItem(topicsKey);
  topics = stored ? JSON.parse(stored) : [];
}

function saveTopics() {
  localStorage.setItem(topicsKey, JSON.stringify(topics));
}

function loadCalendarEvents() {
  const stored = localStorage.getItem(calendarKey);
  calendarEvents = stored ? JSON.parse(stored) : [];
}

function saveCalendarEvents() {
  localStorage.setItem(calendarKey, JSON.stringify(calendarEvents));
}

// Populate topics dropdown
function populateTopicDropdown() {
  const select = document.getElementById('topicSelect');
  select.innerHTML = '<option value="" disabled selected>Select a topic</option>';
  topics.forEach((topic, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = topic.name;
    select.appendChild(option);
  });
}

// Display topic details (focused/casual)
function displayTopic(index) {
  if (topics[index]) {
    document.getElementById('focusedText').value = topics[index].focused;
    document.getElementById('casualText').value = topics[index].casual;
  } else {
    document.getElementById('focusedText').value = '';
    document.getElementById('casualText').value = '';
  }
}

// Update list of calendar events for the selected topic
function updateEventList() {
  const eventListDiv = document.getElementById('eventList');
  eventListDiv.innerHTML = '';
  const topicSelect = document.getElementById('topicSelect');
  const index = topicSelect.value;
  if (index === '' || !topics[index]) return;
  const selectedTopic = topics[index].name;
  const events = calendarEvents.filter(ev => ev.topicName === selectedTopic);
  if (events.length === 0) {
    eventListDiv.textContent = 'No calendar events for this topic.';
    return;
  }
  events.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'event-item';
    div.textContent = `${ev.startDate} to ${ev.endDate} `;
    const colorSpan = document.createElement('span');
    colorSpan.style.backgroundColor = ev.color;
    div.prepend(colorSpan);
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      removeCalendarEvent(ev.id);
    });
    div.appendChild(removeBtn);
    eventListDiv.appendChild(div);
  });
}

function removeCalendarEvent(id) {
  calendarEvents = calendarEvents.filter(ev => ev.id !== id);
  saveCalendarEvents();
  updateEventList();
  renderCalendar();
}

// Calendar rendering functions
function renderCalendar() {
  const view = document.getElementById('calendarViewSelect').value;
  const calendarContainer = document.getElementById('calendar');
  calendarContainer.innerHTML = '';
  if (view === 'week') {
    renderWeekCalendar(calendarContainer);
  } else if (view === 'month') {
    renderMonthCalendar(new Date(), calendarContainer);
  } else if (view === '3-month') {
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      renderMonthCalendar(monthDate, calendarContainer);
    }
  }
}

function renderWeekCalendar(container) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const table = document.createElement('table');
  table.className = 'calendar-table';
  const headerRow = document.createElement('tr');
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(day => {
    const th = document.createElement('th');
    th.textContent = day;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);
  const row = document.createElement('tr');
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    const td = createCalendarCell(currentDate);
    row.appendChild(td);
  }
  table.appendChild(row);
  container.appendChild(table);
}

function renderMonthCalendar(date, container) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const table = document.createElement('table');
  table.className = 'calendar-table';
  // Title row
  const titleRow = document.createElement('tr');
  const titleCell = document.createElement('th');
  titleCell.colSpan = 7;
  titleCell.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
  titleRow.appendChild(titleCell);
  table.appendChild(titleRow);
  // Header row
  const headerRow = document.createElement('tr');
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(day => {
    const th = document.createElement('th');
    th.textContent = day;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);
  // Days grid
  let row = document.createElement('tr');
  for (let i = 0; i < firstDay.getDay(); i++) {
    row.appendChild(document.createElement('td'));
  }
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    const td = createCalendarCell(currentDate);
    row.appendChild(td);
    if (currentDate.getDay() === 6 && day !== lastDay.getDate()) {
      table.appendChild(row);
      row = document.createElement('tr');
    }
  }
  while (row.children.length < 7) {
    row.appendChild(document.createElement('td'));
  }
  table.appendChild(row);
  container.appendChild(table);
}

function createCalendarCell(date) {
  const td = document.createElement('td');
  const dateDiv = document.createElement('div');
  dateDiv.className = 'date-number';
  dateDiv.textContent = date.getDate();
  td.appendChild(dateDiv);
  const events = getEventsForDate(date);
  events.forEach(ev => {
    const block = document.createElement('div');
    block.className = 'color-block';
    block.style.backgroundColor = ev.color;
    block.title = ev.topicName;
    td.appendChild(block);
  });
  return td;
}

function getEventsForDate(date) {
  const dateStr = date.toISOString().slice(0,10);
  return calendarEvents.filter(ev => ev.startDate <= dateStr && ev.endDate >= dateStr);
}

// Event Listeners
document.getElementById('addTopicBtn').addEventListener('click', () => {
  const name = document.getElementById('newTopic').value.trim();
  if (!name) {
    alert("Please enter a valid topic name.");
    return;
  }
  topics.push({ name, focused: "", casual: "" });
  saveTopics();
  populateTopicDropdown();
  document.getElementById('newTopic').value = "";
});

document.getElementById('topicSelect').addEventListener('change', (e) => {
  displayTopic(e.target.value);
  updateEventList();
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const index = document.getElementById('topicSelect').value;
  if (index === "" || !topics[index]) {
    alert("Please select a topic to save.");
    return;
  }
  topics[index].focused = document.getElementById('focusedText').value;
  topics[index].casual = document.getElementById('casualText').value;
  saveTopics();
  alert("Topic updated.");
});

document.getElementById('removeTopicBtn').addEventListener('click', () => {
  const index = document.getElementById('topicSelect').value;
  if (index === "" || !topics[index]) {
    alert("Please select a topic to remove.");
    return;
  }
  if (confirm("Are you sure you want to remove this topic?")) {
    const topicName = topics[index].name;
    topics.splice(index, 1);
    calendarEvents = calendarEvents.filter(ev => ev.topicName !== topicName);
    saveTopics();
    saveCalendarEvents();
    populateTopicDropdown();
    document.getElementById('focusedText').value = "";
    document.getElementById('casualText').value = "";
    updateEventList();
    renderCalendar();
  }
});

document.getElementById('addCalendarBtn').addEventListener('click', () => {
  const topicSelect = document.getElementById('topicSelect');
  const index = topicSelect.value;
  if (index === "" || !topics[index]) {
    alert("Please select a topic first.");
    return;
  }
  const topicName = topics[index].name;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const color = document.getElementById('eventColor').value;
  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }
  if (startDate > endDate) {
    alert("Start date cannot be after end date.");
    return;
  }
  const id = Date.now(); // simple unique id
  const eventObj = { id, topicName, color, startDate, endDate };
  calendarEvents.push(eventObj);
  saveCalendarEvents();
  updateEventList();
  renderCalendar();
});

document.getElementById('calendarViewSelect').addEventListener('change', renderCalendar);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTopics();
  loadCalendarEvents();
  populateTopicDropdown();
  renderCalendar();
});

