"use strict";

/* ----------------------------------
   1. DOM elements and configuration
---------------------------------- */

const elements = {
    form: document.querySelector("#task-form"),
    input: document.querySelector("#task-input"),
    taskList: document.querySelector("#task-list"),
    emptyState: document.querySelector("#empty-state"),
    emptyTitle: document.querySelector("#empty-title"),
    emptyMessage: document.querySelector("#empty-message"),
    remainingCount: document.querySelector("#remaining-count"),
    completedCount: document.querySelector("#completed-count"),
    totalBadge: document.querySelector("#total-badge"),
    clearCompletedButton: document.querySelector("#clear-completed"),
    filterButtons: document.querySelectorAll(".filter-button")
};

const STORAGE_KEY = "taskflow-tasks";

const FILTERS = {
    ALL: "all",
    ACTIVE: "active",
    COMPLETED: "completed"
};

const EMPTY_MESSAGES = {
    all: {
        title: "Nothing on your list yet",
        message: "Add your first task and start making progress."
    },
    active: {
        title: "You're all caught up",
        message: "There are no active tasks remaining."
    },
    completed: {
        title: "Nothing completed yet",
        message: "Finish a task and it will appear here."
    }
};


/* ----------------------------------
   2. Application state
---------------------------------- */

let tasks = loadTasks();
let currentFilter = FILTERS.ALL;


/* ----------------------------------
   3. Storage management
---------------------------------- */

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.filter(isValidTask);
    } catch (error) {
        console.error("Unable to load saved tasks:", error);
        return [];
    }
}


function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Unable to save tasks:", error);
        return false;
    }
}


function isValidTask(task) {
    return (
        task !== null &&
        typeof task === "object" &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        task.text.trim().length > 0 &&
        typeof task.completed === "boolean"
    );
}


/* ----------------------------------
   4. Task operations
---------------------------------- */

function createTask(text) {
    const taskText = text.trim();

    if (!taskText) {
        return;
    }

    const task = {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false
    };

    tasks.unshift(task);

    saveTasks();
    renderTasks();
}


function toggleTask(taskId) {
    tasks = tasks.map(task => {
        if (task.id !== taskId) {
            return task;
        }

        return {
            ...task,
            completed: !task.completed
        };
    });

    saveTasks();
    renderTasks();
}


function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);

    saveTasks();
    renderTasks();
}


function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
}


/* ----------------------------------
   5. Task filtering and statistics
---------------------------------- */

function getVisibleTasks() {
    switch (currentFilter) {
        case FILTERS.ACTIVE:
            return tasks.filter(task => !task.completed);

        case FILTERS.COMPLETED:
            return tasks.filter(task => task.completed);

        default:
            return tasks;
    }
}


function getTaskStatistics() {
    const completed = tasks.filter(task => task.completed).length;
    const remaining = tasks.length - completed;

    return {
        total: tasks.length,
        completed,
        remaining
    };
}


function updateStatistics() {
    const statistics = getTaskStatistics();

    elements.remainingCount.textContent =
        `${statistics.remaining} task${statistics.remaining === 1 ? "" : "s"} remaining`;

    elements.completedCount.textContent =
        `${statistics.completed} completed`;

    elements.totalBadge.textContent =
        `${statistics.total} task${statistics.total === 1 ? "" : "s"}`;

    elements.clearCompletedButton.disabled = statistics.completed === 0;
}


/* ----------------------------------
   6. Task rendering
---------------------------------- */

function createTaskElement(task) {
    const listItem = document.createElement("li");

    listItem.className = "task-item";

    if (task.completed) {
        listItem.classList.add("completed");
    }

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;

    checkbox.setAttribute(
        "aria-label",
        `${task.completed ? "Mark as active" : "Mark as completed"}: ${task.text}`
    );

    checkbox.addEventListener("change", () => {
        toggleTask(task.id);
    });

    const taskText = document.createElement("span");

    taskText.className = "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";

    deleteButton.setAttribute(
        "aria-label",
        `Delete task: ${task.text}`
    );

    deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
    });

    listItem.append(checkbox, taskText, deleteButton);

    return listItem;
}


function updateEmptyState(visibleTaskCount) {
    const isEmpty = visibleTaskCount === 0;

    elements.emptyState.hidden = !isEmpty;

    if (isEmpty) {
        const message = EMPTY_MESSAGES[currentFilter];

        elements.emptyTitle.textContent = message.title;
        elements.emptyMessage.textContent = message.message;
    }
}


function renderTasks() {
    const visibleTasks = getVisibleTasks();
    const fragment = document.createDocumentFragment();

    visibleTasks.forEach(task => {
        fragment.appendChild(createTaskElement(task));
    });

    elements.taskList.replaceChildren(fragment);

    updateStatistics();
    updateEmptyState(visibleTasks.length);
    updateFilterButtons();
}


/* ----------------------------------
   7. Filter controls
---------------------------------- */

function updateFilterButtons() {
    elements.filterButtons.forEach(button => {
        const isActive = button.dataset.filter === currentFilter;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}


function setFilter(filter) {
    if (!Object.values(FILTERS).includes(filter)) {
        return;
    }

    currentFilter = filter;
    renderTasks();
}


/* ----------------------------------
   8. Event handlers
---------------------------------- */

function handleFormSubmit(event) {
    event.preventDefault();

    const taskText = elements.input.value;

    if (!taskText.trim()) {
        elements.input.focus();
        return;
    }

    createTask(taskText);

    elements.form.reset();
    elements.input.focus();
}


function handleFilterClick(event) {
    const selectedFilter = event.currentTarget.dataset.filter;

    setFilter(selectedFilter);
}


function handleClearCompleted() {
    clearCompletedTasks();
}


/* ----------------------------------
   9. Event listener registration
---------------------------------- */

function initializeEventListeners() {
    elements.form.addEventListener("submit", handleFormSubmit);

    elements.filterButtons.forEach(button => {
        button.addEventListener("click", handleFilterClick);
    });

    elements.clearCompletedButton.addEventListener(
        "click",
        handleClearCompleted
    );
}


/* ----------------------------------
   10. Application initialization
---------------------------------- */

function initializeApp() {
    initializeEventListeners();
    renderTasks();
}

initializeApp();