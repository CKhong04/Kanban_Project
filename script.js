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
        span.innerHTML="\u00d7";
        li.appendChild(span);
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
showTask();

checkLogin();