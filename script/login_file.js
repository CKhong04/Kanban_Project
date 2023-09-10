//We need to create a HashMap to store the login details which are possible.
let  userToPassword = new Map([
    ["sample@gmail.com", "Password"],
    ["sample@hotmail.com", "1234"],
    ["random@outlook.com", "abcd1234"]
])

var attempt = 3; // Variable to count number of attempts.
// Below function Executes on click of login button.
function validate(){
var username = document.getElementById("username").value;
var password = document.getElementById("password").value;
if (userToPassword.has(username) && userToPassword.get(username) == password){
    alert ("Login successful");
    window.location = "index.html"; // Redirects to the home page.
    return false;
} 
else if (userToPassword.has(username)){
    attempt --;// Decrementing by one.
    alert("Incorrect password. You have "+attempt+" attempts left;");
}
else{
    attempt --;// Decrementing by one.
    alert("You have "+attempt+" attempts left;");
// Disabling fields after 3 attempts.
if( attempt == 0){
    document.getElementById("username").disabled = true;
    document.getElementById("password").disabled = true;
    document.getElementById("submit").disabled = true;
    return false;
}
}
}