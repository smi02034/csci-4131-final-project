const signin_button = document.getElementById("signin_button");
const username_field = document.getElementById("username");
const password_field = document.getElementById("password");
signin_button.addEventListener("click", async () => {
    let username = username_field.value;
    let password = password_field.value;
    let response = await fetch("/api/signin", 
        {method: "POST",
        headers: {'Content-Type': "application/json; charset=UTF-8"},
        body: `{"username": "${username}", "password": "${password}"}`});
    // Server will return 200 code if user signin successful
    if (response.ok) {
        window.location.href = "/";
    } else if (response.status = "401") {
        const error_message = document.getElementsByClassName("signin_error")[0];
        error_message.style.display = "block";
    } else {
        const error_message = document.getElementsByClassName("signin_error")[0];
        error_message.style.display = "block";
        error_message.innerText = "Error signing in."
    }
});