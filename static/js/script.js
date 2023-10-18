window.addEventListener('load', () => {
	todos = JSON.parse(localStorage.getItem('todos')) || []; //Create local storage for all the tasks, allowing the page to be refreshed and for the content to stay in its spot on the page.
	const nameInput = document.querySelector('#name');
	const newTodoForm = document.querySelector('#new-todo-form');

	const username = localStorage.getItem('username') || '';

	nameInput.value = username;

	nameInput.addEventListener('change', (e) => { //When the name in the form is changed, the updated value will be stored in local storage.
		localStorage.setItem('username', e.target.value);
	})

	newTodoForm.addEventListener('submit', e => { //When the form is submitted, a task is added to the local storage (as a todo).
		e.preventDefault();

		const todo = {
			content: e.target.elements.content.value,
			category: e.target.elements.category.value,
			personcontent: e.target.elements.personcontent.value,
			done: false,
			createdAt: new Date().getTime(),
			status: 'backlog' //The status is set to 'backlog', important for allowing refreshing of the page
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
	const todoList = document.getElementById('todo-list'); //This is the product backlog section
	const todoLane = document.getElementById("todo-lane"); //This is the to-do lane in the sprint backlog
	const categories = new Set(['ui', 'ux', 'front-end', 'back-end', 'database', 'api', 'framework']) //Create a new set of seven of the eight tags available.
    
	todoList.innerHTML = "";
	[...todoLane.children].filter(e => e.tagName.toLowerCase() === 'div').forEach(e => e.remove()); //Check for any children in the todo lane that are part of another 'div' element. If these are present, remove them (this prevents double ups in the system.)

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

		//Create the various elements that are available within the tasks in the product backlog and sprint backlog.
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
		span.classList.add(categories.has(todo.category) ? todo.category : 'testing') //Sets the tag to testing if no tag is given when the task is added to the backlog.
		content.classList.add('todo-content');
		actions.classList.add('actions');
		deleteButton.classList.add('delete');
		addToSprintButton.classList.add('add');
		removeFromSprintButton.classList.add('removeSprint');

		//Add the text which appears in the buttons given below.
		content.innerHTML = `<input type="text" value="${todo.content}" readonly>`; //Set the content in the tasks to be read-only
		deleteButton.innerHTML = 'Delete';
		addToSprintButton.innerHTML = 'Add to Sprint';
		removeFromSprintButton.innerHTML = 'Remove from Sprint';

		//Add the various elements of a task into the todoItem, which represents the task.
		label.appendChild(input);
		label.appendChild(span);
		actions.appendChild(deleteButton);
		actions.appendChild(addToSprintButton);
		todoItem.appendChild(label);;
		todoItem.appendChild(content);
		todoItem.appendChild(actions);

		// Display 'who is doing this task' on the task tile
		const personContent = document.createElement('p');
		personContent.innerHTML =  `<input type="text" value="${todo.personcontent}" readonly>`; 
		todoItem.appendChild(personContent);

		//When a task has the status 'backlog', it is in the product backlog. This means it should be present in the product backlog list.
		if (todo.status === 'backlog') {
			todoList.appendChild(todoItem)
		//When a task has status 'todo', it has been added to the sprint backlog.
		} else if (todo.status === 'todo') {
			todoItem.style.width = "100%";
			todoItem.style.display = "flex";
			span.style.marginTop = "12px";
			todoItem.removeChild(actions); //The actions are not important in the sprint backlog, therefore they are removed.
			todoItem.appendChild(removeFromSprintButton); //Add the 'remove from sprint' button to the item.
			todoLane.appendChild(todoItem); //Add the item to the sprint backlog's todo lane.
		}

		if (todo.done) { //Runs when a task is marked off as 'done'.
			todoItem.classList.add('done'); //Add the status 'done' to the task, allowing it to take on special properties.
			let number = Math.random() * 3; //Generate a random number between 0 and 3.
			//Three possible alerts are created, which will be chosen at random to display to the user.
			if (number <= 1){
				alert("Well done on completing a task! You are awesome!");
			} else if (number <= 2){
				alert("You rock! Keep smashing these tasks out!");
			} else {
				alert("You're amazing! *happy dance*");
			}
		}
		
		//Switch the status of the task from 'done' and back, when the input to the task's bubble is changed.
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

		//When the content of the tasks is double clicked, allow it to be edited.
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

		//When the person's name is double clicked, allow it to be edited.
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

		//When the delete button is clicked, remove it from the list and accordingly adjust the locally stored tasks.
		deleteButton.addEventListener('click', (e) => {
			todos = todos.filter(t => t !== todo);
			localStorage.setItem('todos', JSON.stringify(todos));
			DisplayTodos()
		})

		//When the add to sprint button is clicked, change the status of the task to 'todo', then redisplay all the tasks.
		addToSprintButton.addEventListener('click', (e) => {
			todo.status = 'todo'
			localStorage.setItem('todos', JSON.stringify(todos));
			DisplayTodos()
		})

		//When the remove from sprint button is clicked, add the item back to the product backlog.
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

const draggables = document.querySelectorAll(".tasks"); //Set all tasks to be draggable
const droppables = document.querySelectorAll(".swim-lane"); //Set all swim lanes to be drop zones

//For each draggable object, add event listeners which check whether the object is being dragged or dropped.
draggables.forEach((tasks) => {
  tasks.setAttribute("draggable", "true")
  tasks.addEventListener("dragstart", () => {
    tasks.classList.add("is-dragging");
  });
  tasks.addEventListener("dragend", () => {
    tasks.classList.remove("is-dragging");
  });
});

//Allow all drop zones to be dragged over and have draggable objects appended.
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

  //When a draggable object enters the drop zone, stop the default code from occurring.
  zone.addEventListener("dragenter", e => e.preventDefault());
});

//Allow the task being dragged to find its closest task below so it can be dropped there.
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