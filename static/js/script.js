window.addEventListener('load', () => {
	todos = JSON.parse(localStorage.getItem('todos')) || [];
	const nameInput = document.querySelector('#name');
	const newTodoForm = document.querySelector('#new-todo-form');

	const username = localStorage.getItem('username') || '';

	nameInput.value = username;

	nameInput.addEventListener('change', (e) => {
		localStorage.setItem('username', e.target.value);
	})

	newTodoForm.addEventListener('submit', e => {
		e.preventDefault();

		const todo = {
			content: e.target.elements.content.value,
			category: e.target.elements.category.value,
			done: false,
			createdAt: new Date().getTime()
		}

		todos.push(todo);

		localStorage.setItem('todos', JSON.stringify(todos));

		// Reset the form
		e.target.reset();

		DisplayTodos()
	})

	DisplayTodos()
})

function DisplayTodos () {
	const todoList = document.querySelector('#todo-list');
    
	todoList.innerHTML = "";
    

	todos.forEach(todo => {
		const todoItem = document.createElement('div');
		todoItem.classList.add('todo-item');

		const label = document.createElement('label');
		const input = document.createElement('input');
		const span = document.createElement('span');
		const content = document.createElement('div');
		const actions = document.createElement('div');
		const edit = document.createElement('button');
		const deleteButton = document.createElement('button');
		const addToSprintButton = document.createElement('button');
		const todoLane = document.getElementById("todo-lane");

		input.type = 'checkbox';
		input.checked = todo.done;
		span.classList.add('bubble');
		if (todo.category == 'ui') {
			span.classList.add('ui');
        }else if( todo.category=='ux') {
            span.classList.add('ux');
        }else if( todo.category=='front-end') {
            span.classList.add('front-end');
        }else if( todo.category=='back-end') {
            span.classList.add('back-end');
        }else if( todo.category=='database') {
            span.classList.add('database');
        }else if( todo.category=='api') {
            span.classList.add('api');
        }else if( todo.category=='framework') {
            span.classList.add('framework');
		} else {
			span.classList.add('testing');
		}
		content.classList.add('todo-content');
		actions.classList.add('actions');
		edit.classList.add('edit');
		deleteButton.classList.add('delete');
		addToSprintButton.classList.add('add');

		content.innerHTML = `<input type="text" value="${todo.content}" readonly>`;
		edit.innerHTML = 'Edit';
		deleteButton.innerHTML = 'Delete';
		addToSprintButton.innerHTML = 'Add to Sprint';

		label.appendChild(input);
		label.appendChild(span);
		actions.appendChild(edit);
		actions.appendChild(deleteButton);
		actions.appendChild(addToSprintButton);
		todoItem.appendChild(label);
		todoItem.appendChild(content);
		todoItem.appendChild(actions);

		todoList.appendChild(todoItem);

		if (todo.done) {
			todoItem.classList.add('done');
		}
		
		input.addEventListener('change', (e) => {
			todo.done = e.target.checked;
			localStorage.setItem('todos', JSON.stringify(todos));

			if (todo.done) {
				todoItem.classList.add('done');
			} else {
				todoItem.classList.remove('done');
			}

			DisplayTodos()

		})

		edit.addEventListener('click', (e) => {
			const input = content.querySelector('input');
			input.removeAttribute('readonly');
			input.focus();
			input.addEventListener('blur', (e) => {
				input.setAttribute('readonly', true);
				todo.content = e.target.value;
				localStorage.setItem('todos', JSON.stringify(todos));
				DisplayTodos()

			})
		})

		deleteButton.addEventListener('click', (e) => {
			todos = todos.filter(t => t != todo);
			localStorage.setItem('todos', JSON.stringify(todos));
			DisplayTodos()
		})

		addToSprintButton.addEventListener('click', (e) => {
			const input = content.querySelector('input');
			todoLane.appendChild(todoItem)
			todos = todos.filter(t => t != todo);
			localStorage.setItem('todos', JSON.stringify(todos));
			DisplayTodos()
		})

		todoItem.classList.add("tasks");
		todoItem.setAttribute("draggable", "true");
		
		todoItem.addEventListener("dragstart", () => {
			todoItem.classList.add("is-dragging");
		});

		todoItem.addEventListener("dragend", () => {
			todoItem.classList.remove("is-dragging");
		});

	})
}

const draggables = document.querySelectorAll(".tasks");
const droppables = document.querySelectorAll(".swim-lane");

draggables.forEach((tasks) => {
  tasks.setAttribute("draggable", "true")
  tasks.addEventListener("dragstart", () => {
    tasks.classList.add("is-dragging");
  });
  tasks.addEventListener("dragend", () => {
    tasks.classList.remove("is-dragging");
  });
});

droppables.forEach((zone) => {
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();

    const bottomTask = insertAboveTask(zone, e.clientY);
    const curTask = document.querySelector(".is-dragging");

    if (!bottomTask) {
      zone.appendChild(curTask);
    } else {
      zone.insertBefore(curTask, bottomTask);
    }
  });

  zone.addEventListener("dragenter", e => e.preventDefault());
});

const insertAboveTask = (zone, mouseY) => {
  const els = zone.querySelectorAll(".tasks:not(.is-dragging)");

  let closestTask = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  els.forEach((tasks) => {
    const { top } = tasks.getBoundingClientRect();

    const offset = mouseY - top;

    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestTask = tasks;
    }
  });

  return closestTask;
};