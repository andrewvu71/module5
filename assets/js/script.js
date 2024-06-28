// Initialize tasks and nextId from localStorage or set to defaults
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
    const taskId = nextId;
    nextId += 1;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return taskId;
}

// Function to create a task card
function createTaskCard(task) {
    const $taskCard = $(`
        <div class="task-card" id="task-${task.id}" data-id="${task.id}">
            <div class="task-header">
                <h3>${task.title}</h3>
                <button class="delete-task btn btn-danger">Delete</button>
            </div>
            <p>${task.description}</p>
            <small>Due: ${task.dueDate}</small>
        </div>
    `);

    // Making the task card draggable
    $taskCard.draggable({
        revert: "invalid",
        cursor: "move",
        zIndex: 100,
        start: function (event, ui) {
            $(this).css("opacity", 0.5);
        },
        stop: function (event, ui) {
            $(this).css("opacity", 1);
        }
    });

    // Adding event listener to the delete button
    $taskCard.find('.delete-task').on('click', handleDeleteTask);

    return $taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    $(".lane").each(function () {
        const laneId = $(this).attr('id');
        $(this).find('.card-body').empty(); // Clear existing tasks

        taskList.filter(task => task.status === laneId).forEach(task => {
            const $taskCard = createTaskCard(task);
            $(this).find('.card-body').append($taskCard);
        });
    });
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const title = $("#task-title").val();
    const description = $("#task-description").val();
    const dueDate = $("#task-due-date").val();
    const status = $("#task-status").val();

    if (title && dueDate) {
        const newTask = {
            id: generateTaskId(),
            title,
            description,
            dueDate,
            status
        };

        taskList.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(taskList));

        renderTaskList();
        $('#formModal').modal('hide');
        $('#task-form')[0].reset();
    } else {
        alert("Please fill out the required fields.");
    }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest('.task-card').data('id');
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.data('id');
    const newStatus = $(this).attr('id');

    taskList = taskList.map(task => {
        if (task.id === taskId) {
            task.status = newStatus;
        }
        return task;
    });

    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Initialize the page when it loads
$(document).ready(function () {
    renderTaskList();

    $("#task-form").on("submit", handleAddTask);

    $(".lane").droppable({
        accept: ".task-card",
        drop: handleDrop,
        hoverClass: "hovered"
    });

    $("#task-due-date").datepicker({
        dateFormat: "yy-mm-dd"
    });
});
