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

    // Validate date input and ensure it's not in the past
    if (dateInput.value === '') {
        alert('Please select a due date!');
        dateInput.focus();
        return;
    } else {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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
    tdTask.className = 'border border-slate-300 p-2 break-words whitespace-pre-wrap max-w-[200px]';
    tdTask.textContent = text;

    const tdDate = document.createElement('td');
    tdDate.className = 'border border-slate-300 p-2';
    tdDate.textContent = dateInput.value || '-';

    const tdStatus = document.createElement('td');
    tdStatus.className = 'border border-slate-300 p-2';

    // Create status select with default "Pending"
    const statusSelect = document.createElement('select');
    statusSelect.className = 'w-full p-1 rounded';

    const optionPending = new Option('Pending', 'Pending', true, true); // default selected
    const optionCompleted = new Option('Completed', 'Completed');

    statusSelect.appendChild(optionPending);
    statusSelect.appendChild(optionCompleted);

    // Actions (create now so styling function can toggle them)
    const tdActions = document.createElement('td');
    tdActions.className = 'border border-slate-300 p-2 mx-auto text-center';

    const deleteBtn = document.createElement('img');
    deleteBtn.className = 'w-6 mx-auto cursor-pointer opacity-70 hover:opacity-100';
    deleteBtn.src = '../assets/delete.png';
    deleteBtn.addEventListener('click', () => {
        tr.remove();
        
        // Check if there are any remaining tasks
        const tbody = document.getElementById('task-table-body');
        const remainingTasks = tbody.querySelectorAll('tr');
        
        if (remainingTasks.length === 0) {
            // Add "No Task Found" placeholder
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.id = 'no-task';
            td.colSpan = 4;
            td.className = 'border border-slate-300 p-2 text-center text-gray-500';
            td.textContent = 'No Task Found';
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
    });

    tdActions.appendChild(deleteBtn);

    // Apply initial styling based on status and toggle "disabled" state for the row
    const applyStatusStyles = (select) => {
        // Reset select color classes
        select.classList.remove('bg-green-500', 'text-white', 'bg-red-500');
        // Reset row & action styles
        tr.classList.remove('opacity-50');
        deleteBtn.disabled = false;
        deleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');

        if (select.value === 'Completed') {
            // Green background for select
            select.classList.add('bg-green-500', 'text-white');
            // Visually disable the row and disable actions except the select so user can toggle back
            statusSelect.disabled = true;
            statusSelect.classList.add('cursor-not-allowed');
            tdTask.classList.add('opacity-50');
            tdDate.classList.add('opacity-50');
            tdStatus.classList.add('opacity-50');
        } else {
            // Pending or other: show red for select and keep row interactive
            select.classList.add('bg-red-500', 'text-white');
        }
    };

    // initial apply
    applyStatusStyles(statusSelect);

    statusSelect.addEventListener('change', () => {
        applyStatusStyles(statusSelect);
    });

    tdStatus.appendChild(statusSelect);

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

function initialize() {
    document.getElementById('task-input').focus();
}

window.onload = initialize;

// remove dynamic menu usage and listen to the select in HTML
const statusFilterSelect = document.getElementById('status-filter-select');
if (statusFilterSelect) {
    statusFilterSelect.addEventListener('change', () => {
        const v = statusFilterSelect.value;
        if (v === 'sort-az') {
            performFilter(null, 'asc');
        } else if (v === 'sort-za') {
            performFilter(null, 'desc');
        } else if (v === '') {
            performFilter(null, null);
        } else {
            performFilter(v, null);
        }
    });
}

// remove the old click listener if present (safe no-op if element missing)
const statusFilterBtn = document.getElementById('status-filter');
if (statusFilterBtn) {
    statusFilterBtn.removeEventListener('click', filterTasks);
    // optional: hide/remove the old button in HTML if still present
}

// statusFilter: status can be 'Pending'|'Completed'|null (null = no filter)
// sortOrder: 'asc'|'desc'|null
function performFilter(statusFilter, sortOrder) {
    const tbody = document.getElementById('task-table-body');
    let placeholder = document.getElementById('no-task');

    // collect rows excluding placeholder
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => {
        return !(placeholder && r.contains(placeholder));
    });

    // determine which rows match the status filter
    const matches = rows.map(row => {
        const statusCell = row.children[2];
        const select = statusCell ? statusCell.querySelector('select') : null;
        const value = select ? select.value : (statusCell ? statusCell.textContent.trim() : '');
        const match = !statusFilter || value === statusFilter;
        return { row, match, key: (row.children[0].textContent || '').trim().toLowerCase() };
    });

    // hide or show rows based on match
    matches.forEach(m => {
        m.row.style.display = m.match ? '' : 'none';
    });

    // remove existing placeholder if any (we'll re-add only if no visible rows)
    if (placeholder) {
        placeholder.closest('tr')?.remove();
        placeholder = null;
    }

    // collect visible rows after filter
    let visible = matches.filter(m => m.match).map(m => m.row);

    // if sorting requested, sort the visible rows then re-append them in order
    if (sortOrder && visible.length > 0) {
        visible.sort((a, b) => {
            const aText = (a.children[0].textContent || '').trim().toLowerCase();
            const bText = (b.children[0].textContent || '').trim().toLowerCase();
            if (aText < bText) return sortOrder === 'asc' ? -1 : 1;
            if (aText > bText) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        // append sorted visible rows in order
        visible.forEach(r => tbody.appendChild(r));
    }

    // if no visible rows, show placeholder but keep other rows hidden in DOM
    if (visible.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.id = 'no-task';
        td.colSpan = 4;
        td.className = 'border border-slate-300 p-2 text-center text-gray-500';
        td.textContent = 'No Task Found';
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
}

function deleteAllTasks() {
    const tbody = document.getElementById('task-table-body');
    tbody.innerHTML = '';

    // Add "No Task Found" placeholder
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.id = 'no-task';
    td.colSpan = 4;
    td.className = 'border border-slate-300 p-2 text-center text-gray-500';
    td.textContent = 'No Task Found';
    tr.appendChild(td);
    tbody.appendChild(tr);
}

// Attach addTask to form submission

document.getElementById('add-task-form').addEventListener('submit', addTask);
document.getElementById('delete-all-btn').addEventListener('click', deleteAllTasks);