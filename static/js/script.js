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
			personcontent: e.target.elements.personcontent.value,
			done: false,
			createdAt: new Date().getTime(),
			status: 'backlog'
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
	const todoList = document.getElementById('todo-list');
	const todoLane = document.getElementById("todo-lane");
	const doingLane = document.getElementById("doing-lance");
	const doneLane = document.getElementById("done-lane");
	const categories = new Set(['ui', 'ux', 'front-end', 'back-end', 'database', 'api', 'framework'])
    
	todoList.innerHTML = "";
	[...todoLane.children].filter(e => e.tagName.toLowerCase() === 'div').forEach(e => e.remove());
	[...todoLane.children].filter(e => e.tagName.toLowerCase() === 'div').forEach(e => e.remove());
    

	todos.forEach(todo => {
		const todoItem = document.createElement('div');
		todoItem.classList.add('todo-item');
		todoItem.classList.add("tasks"); //Add this to the tasks class, enabling drag and drop below.
		todoItem.setAttribute("draggable", "true"); //Make the item able to be draggable.
		
		todoItem.addEventListener("dragstart", () => { //Allow the item to know when it is being dragged
			todoItem.classList.add("is-dragging");
		});

		todoItem.addEventListener("dragend", () => { //Allow the item to know when it has stopped being dragged
			todoItem.classList.remove("is-dragging");
		});


		const label = document.createElement('label');
		const input = document.createElement('input');
		const span = document.createElement('span');
		const content = document.createElement('p');
		const actions = document.createElement('div');
		const deleteButton = document.createElement('button');
		const addToSprintButton = document.createElement('button');
		const removeFromSprintButton = document.createElement('button');
		const todoLane = document.getElementById("todo-lane");

		input.type = 'checkbox';
		input.checked = todo.done;
		span.classList.add('bubble');
		span.classList.add(categories.has(todo.category) ? todo.category : 'testing')
		content.classList.add('todo-content');
		actions.classList.add('actions');
		deleteButton.classList.add('delete');
		addToSprintButton.classList.add('add');
		removeFromSprintButton.classList.add('removeSprint');

		content.innerHTML = `<input type="text" value="${todo.content}" readonly>`;
		deleteButton.innerHTML = 'Delete';
		addToSprintButton.innerHTML = 'Add to Sprint';
		removeFromSprintButton.innerHTML = 'Remove from Sprint';


		label.appendChild(input);
		label.appendChild(span);
		actions.appendChild(deleteButton);
		actions.appendChild(addToSprintButton);
		todoItem.appendChild(label);;
		todoItem.appendChild(content);

		// Display 'who is doing this task' on the task tile
		const personContent = document.createElement('p');
		personContent.innerHTML =  `<input type="text" value="${todo.personcontent}" readonly>`; 
		todoItem.appendChild(personContent);
		
		todoItem.appendChild(actions);

		if (todo.status === 'backlog') {
			todoList.appendChild(todoItem)
		} else if (todo.status === 'todo') {
			todoItem.style.width = "100%";
			todoItem.style.display = "flex";
			span.style.marginTop = "12px";
			todoItem.removeChild(actions);
			todoItem.appendChild(removeFromSprintButton);
			todoLane.appendChild(todoItem);
		}

		if (todo.done) {
			todoItem.classList.add('done');
			let number = Math.random() * 3;
			if (number <= 1){
				alert("Well done on completing a task! You are awesome!");
			} else if (number <= 2){
				alert("You rock! Keep smashing these tasks out!");
			} else {
				alert("You're amazing! *happy dance*");
			}
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

		content.addEventListener('dblclick', (e) => {
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

		personContent.addEventListener('dblclick', (e) => {
			const input = personContent.querySelector('input');
			input.removeAttribute('readonly');
			input.focus();
			input.addEventListener('blur', (e) => {
				input.setAttribute('readonly', true);
				todo.personcontent = e.target.value; // Corrected property name
				localStorage.setItem('todos', JSON.stringify(todos));
				DisplayTodos()
			});
		});

		deleteButton.addEventListener('click', (e) => {
			todos = todos.filter(t => t !== todo);
			localStorage.setItem('todos', JSON.stringify(todos));
			DisplayTodos()
		})

		addToSprintButton.addEventListener('click', (e) => {
			todoItem.style.width = "100%";
			todoItem.style.display = "flex";
			span.style.marginTop = "12px";
			todoItem.removeChild(actions);
			todoItem.appendChild(removeFromSprintButton);
			todoLane.appendChild(todoItem);
			todo.status = 'todo'
			localStorage.setItem('todos', JSON.stringify(todos));
			DisplayTodos()
		})

		removeFromSprintButton.addEventListener('click', (e) => {
			todoItem.appendChild(actions);
			todoItem.removeChild(removeFromSprintButton);
			todoList.appendChild(todoItem);
			todo.status = 'backlog'
			localStorage.setItem('todos', JSON.stringify(todos));
			DisplayTodos()
		})

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