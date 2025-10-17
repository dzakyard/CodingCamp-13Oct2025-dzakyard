function addTask(e) {
    e.preventDefault();

    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('new-task-date');
    const tbody = document.getElementById('task-table-body');

    const text = taskInput.value.trim();
    if (!text) {
        alert('You must write something!');
        taskInput.focus();
        return;
    }

    if (dateInput.value === '') {
        alert('Please select a due date!');

        if (selectedDate < today) {
            alert('The due date cannot be in the past!');
            dateInput.focus();
            return;
        }
    }

    // Remove "No Task Found" placeholder row if present
    const noTaskCell = document.getElementById('no-task');
    if (noTaskCell) {
        const placeholderRow = noTaskCell.closest('tr');
        if (placeholderRow) placeholderRow.remove();
    }

    // Build new row
    const tr = document.createElement('tr');

    const tdTask = document.createElement('td');
    tdTask.className = 'border border-slate-300 p-2';
    tdTask.textContent = text;

    const tdDate = document.createElement('td');
    tdDate.className = 'border border-slate-300 p-2';
    tdDate.textContent = dateInput.value || '-';

    const tdStatus = document.createElement('td');
    tdStatus.className = 'border border-slate-300 p-2';
    tdStatus.textContent = 'Pending';

    const tdActions = document.createElement('td');
    tdActions.className = 'border border-slate-300 p-2';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'bg-red-500 text-white px-2 py-1 rounded';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => tr.remove());

    tdActions.appendChild(deleteBtn);

    tr.appendChild(tdTask);
    tr.appendChild(tdDate);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);

    // Reset inputs
    taskInput.value = '';
    dateInput.value = '';
    taskInput.focus();
}

document.getElementById('add-task-form').addEventListener('submit', addTask);