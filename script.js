// Global Data Arrays and Calendar State
let topics = [];
let calendarEvents = [];
let dayGoals = [];
let currentYear, currentMonth;

// On page load: initialize data, UI, and event listeners.
document.addEventListener("DOMContentLoaded", function() {
  // Load from localStorage (or start empty)
  topics = loadData("topics") || [];
  calendarEvents = loadData("calendarEvents") || [];
  dayGoals = loadData("dayGoals") || [];

  // Set current calendar month/year based on today.
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();

  // Populate topic dropdowns (for Hybrid, Organizer, and Day View)
  populateTopicDropdown("topicSelect");
  populateTopicDropdown("topicSelectOrg");
  populateTopicDropdown("dayGoalTopic");

  // Render initial calendars
  renderHybridCalendar();
  renderFullCalendar();
  updateCurrentMonthLabel();

  // Navigation Bar event listeners
  document.getElementById("hybridBtn").addEventListener("click", function() {
    switchScreen("hybridScreen");
  });
  document.getElementById("calendarBtn").addEventListener("click", function() {
    switchScreen("calendarScreen");
    updateCurrentMonthLabel();
    renderFullCalendar();
  });
  document.getElementById("organizerBtn").addEventListener("click", function() {
    switchScreen("organizerScreen");
  });

  // Month navigation (Calendar Screen)
  document.getElementById("prevMonthBtn").addEventListener("click", prevMonth);
  document.getElementById("nextMonthBtn").addEventListener("click", nextMonth);

  // Day View Modal close
  document.getElementById("dayViewClose").addEventListener("click", closeDayView);

  // --- Organizer / Hybrid Screen Event Listeners ---

  // Add Topic (Hybrid)
  document.getElementById("addTopicBtn").addEventListener("click", function() {
    const name = document.getElementById("newTopic").value.trim();
    if (!name) {
      alert("Please enter a valid topic name.");
      return;
    }
    topics.push({ name: name, focused: "", casual: "" });
    saveData("topics", topics);
    populateTopicDropdown("topicSelect");
    populateTopicDropdown("topicSelectOrg");
    populateTopicDropdown("dayGoalTopic");
    document.getElementById("newTopic").value = "";
  });

  // Add Topic (Organizer)
  document.getElementById("addTopicBtnOrg").addEventListener("click", function() {
    const name = document.getElementById("newTopicOrg").value.trim();
    if (!name) {
      alert("Please enter a valid topic name.");
      return;
    }
    topics.push({ name: name, focused: "", casual: "" });
    saveData("topics", topics);
    populateTopicDropdown("topicSelect");
    populateTopicDropdown("topicSelectOrg");
    populateTopicDropdown("dayGoalTopic");
    document.getElementById("newTopicOrg").value = "";
  });

  // Save Topic (Hybrid)
  document.getElementById("saveTopicBtn").addEventListener("click", function() {
    const index = document.getElementById("topicSelect").value;
    if (index === "" || !topics[index]) {
      alert("Please select a topic.");
      return;
    }
    topics[index].focused = document.getElementById("focusedText").value;
    topics[index].casual = document.getElementById("casualText").value;
    saveData("topics", topics);
    alert("Topic saved.");
  });

  // Save Topic (Organizer)
  document.getElementById("saveTopicBtnOrg").addEventListener("click", function() {
    const index = document.getElementById("topicSelectOrg").value;
    if (index === "" || !topics[index]) {
      alert("Please select a topic.");
      return;
    }
    topics[index].focused = document.getElementById("focusedTextOrg").value;
    topics[index].casual = document.getElementById("casualTextOrg").value;
    saveData("topics", topics);
    alert("Topic saved.");
  });

  // Remove Topic (Hybrid)
  document.getElementById("removeTopicBtn").addEventListener("click", function() {
    const index = document.getElementById("topicSelect").value;
    if (index === "" || !topics[index]) {
      alert("Please select a topic.");
      return;
    }
    if (confirm("Are you sure you want to remove this topic?")) {
      const topicName = topics[index].name;
      topics.splice(index, 1);
      // Also remove related calendar events and day goals
      calendarEvents = calendarEvents.filter(ev => ev.topicName !== topicName);
      dayGoals = dayGoals.filter(dg => dg.topicName !== topicName);
      saveData("topics", topics);
      saveData("calendarEvents", calendarEvents);
      saveData("dayGoals", dayGoals);
      populateTopicDropdown("topicSelect");
      populateTopicDropdown("topicSelectOrg");
      populateTopicDropdown("dayGoalTopic");
      document.getElementById("focusedText").value = "";
      document.getElementById("casualText").value = "";
      renderHybridCalendar();
      renderFullCalendar();
    }
  });

  // Remove Topic (Organizer)
  document.getElementById("removeTopicBtnOrg").addEventListener("click", function() {
    const index = document.getElementById("topicSelectOrg").value;
    if (index === "" || !topics[index]) {
      alert("Please select a topic.");
      return;
    }
    if (confirm("Are you sure you want to remove this topic?")) {
      const topicName = topics[index].name;
      topics.splice(index, 1);
      calendarEvents = calendarEvents.filter(ev => ev.topicName !== topicName);
      dayGoals = dayGoals.filter(dg => dg.topicName !== topicName);
      saveData("topics", topics);
      saveData("calendarEvents", calendarEvents);
      saveData("dayGoals", dayGoals);
      populateTopicDropdown("topicSelect");
      populateTopicDropdown("topicSelectOrg");
      populateTopicDropdown("dayGoalTopic");
      document.getElementById("focusedTextOrg").value = "";
      document.getElementById("casualTextOrg").value = "";
      renderHybridCalendar();
      renderFullCalendar();
    }
  });

  // When a topic is selected in Hybrid, update details and event list.
  document.getElementById("topicSelect").addEventListener("change", function() {
    const index = this.value;
    if (topics[index]) {
      document.getElementById("focusedText").value = topics[index].focused;
      document.getElementById("casualText").value = topics[index].casual;
      populateEventList("eventList", "topicSelect");
    }
  });

  // When a topic is selected in Organizer, update details and event list.
  document.getElementById("topicSelectOrg").addEventListener("change", function() {
    const index = this.value;
    if (topics[index]) {
      document.getElementById("focusedTextOrg").value = topics[index].focused;
      document.getElementById("casualTextOrg").value = topics[index].casual;
      populateEventList("eventListOrg", "topicSelectOrg");
    }
  });

  // Add Calendar Event (Hybrid)
  document.getElementById("addCalendarBtn").addEventListener("click", function() {
    addCalendarEvent("startDate", "endDate", "eventColor", function() {
      renderHybridCalendar();
      renderFullCalendar();
      populateEventList("eventList", "topicSelect");
    });
  });

  // Add Calendar Event (Organizer)
  document.getElementById("addCalendarBtnOrg").addEventListener("click", function() {
    addCalendarEvent("startDateOrg", "endDateOrg", "eventColorOrg", function() {
      renderHybridCalendar();
      renderFullCalendar();
      populateEventList("eventListOrg", "topicSelectOrg");
    });
  });

  // --- Day View Modal for Day-Specific Goals ---
  // Add Day Goal from Modal
  document.getElementById("addDayGoalBtn").addEventListener("click", function() {
    const goalText = document.getElementById("dayGoalText").value.trim();
    const topicIndex = document.getElementById("dayGoalTopic").value;
    const date = document.getElementById("dayViewDate").textContent;
    if (!goalText || topicIndex === "") {
      alert("Please enter goal text and select a topic.");
      return;
    }
    const topic = topics[topicIndex];
    const newGoal = {
      id: Date.now(),
      date: date,
      topicName: topic.name,
      text: goalText,
      color: topic.color || "#000" // Use topic’s color if available; otherwise default
    };
    dayGoals.push(newGoal);
    saveData("dayGoals", dayGoals);
    document.getElementById("dayGoalText").value = "";
    renderDayGoalsForModal(date);
    renderFullCalendar();
    renderHybridCalendar();
  });
});

// ----- Helper Functions -----

// Load and save from localStorage
function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Populate a <select> element with topics.
// elementId: id of the select element.
function populateTopicDropdown(elementId) {
  const select = document.getElementById(elementId);
  select.innerHTML = '<option value="" disabled selected>Select a topic</option>';
  topics.forEach((topic, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = topic.name;
    select.appendChild(option);
  });
}

// Populate event list (calendar events) for the selected topic.
function populateEventList(listId, selectId) {
  const eventListDiv = document.getElementById(listId);
  eventListDiv.innerHTML = "";
  const select = document.getElementById(selectId);
  const index = select.value;
  if (index === "" || !topics[index]) {
    eventListDiv.textContent = "No topic selected.";
    return;
  }
  const selectedTopic = topics[index].name;
  const events = calendarEvents.filter(ev => ev.topicName === selectedTopic);
  if (events.length === 0) {
    eventListDiv.textContent = "No calendar events for this topic.";
    return;
  }
  events.forEach(ev => {
    const div = document.createElement("div");
    div.className = "event-item";
    const colorBlock = document.createElement("span");
    colorBlock.style.backgroundColor = ev.color;
    div.appendChild(colorBlock);
    const text = document.createTextNode(` ${ev.startDate} to ${ev.endDate} `);
    div.appendChild(text);
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function() {
      calendarEvents = calendarEvents.filter(e => e.id !== ev.id);
      saveData("calendarEvents", calendarEvents);
      populateEventList(listId, selectId);
      renderHybridCalendar();
      renderFullCalendar();
    });
    div.appendChild(removeBtn);
    eventListDiv.appendChild(div);
  });
}

// Add a new calendar event.
// startId, endId, colorId: IDs of input fields.
// callback: function to call after adding.
function addCalendarEvent(startId, endId, colorId, callback) {
  const startDate = document.getElementById(startId).value;
  const endDate = document.getElementById(endId).value;
  const color = document.getElementById(colorId).value;
  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }
  if (startDate > endDate) {
    alert("Start date cannot be after end date.");
    return;
  }
  const topicSelect = startId.includes("Org") ? document.getElementById("topicSelectOrg") : document.getElementById("topicSelect");
  const index = topicSelect.value;
  if (index === "" || !topics[index]) {
    alert("Please select a topic.");
    return;
  }
  const topicName = topics[index].name;
  const newEvent = {
    id: Date.now(),
    topicName: topicName,
    color: color,
    startDate: startDate,
    endDate: endDate
  };
  calendarEvents.push(newEvent);
  saveData("calendarEvents", calendarEvents);
  document.getElementById(startId).value = "";
  document.getElementById(endId).value = "";
  if (callback) callback();
}

// Screen switching: show only the selected screen.
// Updated to use "flex" for the hybrid screen.
function switchScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = "none";
  });
  if (screenId === "hybridScreen") {
    document.getElementById(screenId).style.display = "flex";
  } else {
    document.getElementById(screenId).style.display = "block";
  }
}

// ----- Calendar Rendering Functions -----

// Render calendar in the Hybrid screen (using today's month).
function renderHybridCalendar() {
  const today = new Date();
  const container = document.getElementById("hybridCalendarContainer");
  renderMonthCalendar(today.getFullYear(), today.getMonth(), container, false);
}

// Render full calendar in the Calendar screen using currentYear/currentMonth.
function renderFullCalendar() {
  const container = document.getElementById("fullCalendar");
  renderMonthCalendar(currentYear, currentMonth, container, true);
}

// Build a month calendar.
// If showDayClick is true, attach a click handler to each day cell to open the Day View modal.
function renderMonthCalendar(year, month, container, showDayClick) {
  container.innerHTML = "";
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const table = document.createElement("table");
  table.className = "calendar-table";

  // Title row (month and year)
  const titleRow = document.createElement("tr");
  const titleCell = document.createElement("th");
  titleCell.colSpan = 7;
  titleCell.textContent = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });
  titleRow.appendChild(titleCell);
  table.appendChild(titleRow);

  // Header row for day names
  const headerRow = document.createElement("tr");
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  let row = document.createElement("tr");
  // Empty cells before the first day
  for (let i = 0; i < firstDay.getDay(); i++) {
    row.appendChild(document.createElement("td"));
  }
  // Fill in each day
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    const td = createCalendarCell(currentDate, showDayClick);
    row.appendChild(td);
    if (currentDate.getDay() === 6) {
      table.appendChild(row);
      row = document.createElement("tr");
    }
  }
  // Fill remaining cells in the last row
  while (row.children.length < 7) {
    row.appendChild(document.createElement("td"));
  }
  table.appendChild(row);
  container.appendChild(table);
}

// Create an individual day cell.
// Adds colored blocks for calendar events and day goals.
// If showDayClick is true, clicking the cell opens the Day View modal.
function createCalendarCell(date, showDayClick) {
  const td = document.createElement("td");
  const dateDiv = document.createElement("div");
  dateDiv.className = "date-number";
  dateDiv.textContent = date.getDate();
  td.appendChild(dateDiv);

  const dateStr = date.toISOString().slice(0, 10);
  // Add calendar events active on this date.
  const events = calendarEvents.filter(ev => ev.startDate <= dateStr && ev.endDate >= dateStr);
  events.forEach(ev => {
    const block = document.createElement("div");
    block.className = "color-block";
    block.style.backgroundColor = ev.color;
    block.title = ev.topicName;
    td.appendChild(block);
  });

  // Add day goals for this date.
  const goals = dayGoals.filter(dg => dg.date === dateStr);
  goals.forEach(dg => {
    const block = document.createElement("div");
    block.className = "color-block";
    block.style.backgroundColor = dg.color;
    block.title = dg.text;
    td.appendChild(block);
  });

  // If in full calendar view, attach a click handler to open the Day View modal.
  if (showDayClick) {
    td.style.cursor = "pointer";
    td.addEventListener("click", function() {
      openDayView(dateStr);
    });
  }
  return td;
}

// Month navigation functions for Calendar Screen.
function prevMonth() {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }
  updateCurrentMonthLabel();
  renderFullCalendar();
}
function nextMonth() {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }
  updateCurrentMonthLabel();
  renderFullCalendar();
}
function updateCurrentMonthLabel() {
  const label = document.getElementById("currentMonthLabel");
  const date = new Date(currentYear, currentMonth);
  label.textContent = date.toLocaleString("default", { month: "long", year: "numeric" });
}

// ----- Day View Modal Functions -----

// Open the Day View modal for the specified date.
function openDayView(dateStr) {
  document.getElementById("dayViewDate").textContent = dateStr;
  renderDayGoalsForModal(dateStr);
  document.getElementById("dayViewModal").style.display = "flex";
}
// Close the Day View modal.
function closeDayView() {
  document.getElementById("dayViewModal").style.display = "none";
}

// Render the list of day goals for the given date inside the modal.
function renderDayGoalsForModal(dateStr) {
  const container = document.getElementById("existingDayGoals");
  container.innerHTML = "";
  const goals = dayGoals.filter(dg => dg.date === dateStr);
  if (goals.length === 0) {
    container.textContent = "No goals for this day.";
    return;
  }
  goals.forEach(dg => {
    const div = document.createElement("div");
    div.className = "event-item";
    const colorSpan = document.createElement("span");
    colorSpan.style.backgroundColor = dg.color;
    div.appendChild(colorSpan);
    const text = document.createTextNode(` ${dg.text} (${dg.topicName}) `);
    div.appendChild(text);
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function() {
      dayGoals = dayGoals.filter(goal => goal.id !== dg.id);
      saveData("dayGoals", dayGoals);
      renderDayGoalsForModal(dateStr);
      renderFullCalendar();
      renderHybridCalendar();
    });
    div.appendChild(removeBtn);
    container.appendChild(div);
  });
}

