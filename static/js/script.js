const inputBox= document.getElementById("input-box");
const listContainer= document.getElementById("list-container");

// adding a task
function addTask(){
if(inputBox.value===''){
alert("Box cannot be empty!")
}
else{
let li= document.createElement("li");
li.innerHTML=inputBox.value;

// adds to the list of tasks with option to 'span' / close
listContainer.appendChild(li)
let span= document.createElement("span");
let span2= document.createElement("span2");
let span3= document.createElement("span3");
span.innerHTML="\u00d7";
span2.innerHTML="\uD83E\uDC61"; //up arrow utf-16
span3.innerHTML="\uD83E\uDC63"; //down arrow utf-16
li.appendChild(span);
li.appendChild(span2);
li.appendChild(span3);

}
inputBox.value="";

saveData();
}

listContainer.addEventListener("click", function(e){
if(e.target.tagName==="LI"){

// toggle for checking and unchecking a box
e.target.classList.toggle("checked");
saveData();
}
// toggle for deleting a box
else if(e.target.tagName==="SPAN"){
e.target.parentElement.remove();
saveData();
} else if (e.target.tagName === "SPAN2") {
// Find the parent LI element
const li = e.target.parentElement;

// Check if it's not the first element
if (li.previousElementSibling) {
// Move the LI element up by inserting it before the previous sibling
li.parentElement.insertBefore(li, li.previousElementSibling);
saveData();
}
} else if (e.target.tagName === "SPAN3") {
// Find the parent LI element
const li = e.target.parentElement;

// Check if it's not the last element
if (li.nextElementSibling) {
// Move the LI element down by inserting it after the next sibling
li.parentElement.insertBefore(li.nextElementSibling, li);
saveData();
}
}
}, false);

// saving all the tasks onto local machine
function saveData(){
localStorage.setItem("data", listContainer.innerHTML);
}

// retrieving local stored data each time program is opened
function showTask(){
listContainer.innerHTML=localStorage.getItem("data")
}

// $(function() {
//     $("#todo, #doing, #done").sortable({
//         connectWith: "ul",
//         placeholder: "placeholder",
//         delay: 150
//     })
//     .disableSelection()
//     .dblclick( function(e) {
//         var item = e.target;
//         if (e.currentTarget.id === 'todo') {
//             $(item).fadeOut('fast', function() {
//     $(item).appendTo($('doing')).fadeIn('slow') || $(item).appendTo($('done')).fadeIn('slow') ;
//             })
//         } else if (e.currentTarget.id === 'doing') {
//             $(item).fadeOut('fast', function() {
//     $(item).appendTo($('todo')).fadeIn('slow') || $(item).appendTo($('done')).fadeIn('slow') 
//     ;
//             })
//         } else {
//     $(item).appendTo($('todo')).fadeIn('slow') || $(item).appendTo($('doing')).fadeIn('slow');
//         }
//     })
// })

//allowing the user to drag and drop different items
const sortableList = document.querySelector(".sortable-list");
const items = sortableList.querySelectorAll(".item");
items.forEach(item => {
item.addEventListener("dragstart", () => {
// Adding dragging class to item after a delay
    setTimeout(() => item.classList.add("dragging"), 0);
});
// Removing dragging class from item on dragend event
item.addEventListener("dragend", () => item.classList.remove("dragging"));
});
const initSortableList = (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector(".dragging");
    // Getting all items except currently dragging and making array of them
    let siblings = [...sortableList.querySelectorAll(".item:not(.dragging)")];
    // Finding the sibling after which the dragging item should be placed
    let nextSibling = siblings.find(sibling => {
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
    // Inserting the dragging item before the found sibling
    sortableList.insertBefore(draggingItem, nextSibling);
}
sortableList.addEventListener("dragover", initSortableList);
sortableList.addEventListener("dragenter", e => e.preventDefault());

showTask();

checkLogin();