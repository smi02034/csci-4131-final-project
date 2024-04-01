const signup_button = document.getElementById("signup_button");
const username_field = document.getElementById("username");
const password_field = document.getElementById("password");
signup_button.addEventListener("click", async () => {
    let username = username_field.value;
    let password = password_field.value;
    let response = await fetch("/api/signup", 
        {method: "POST",
        headers: {'Content-Type': "application/json; charset=UTF-8"},
        body: `{"username": "${username}", "password": "${password}"}`});
    // Server will return 200 code if user sign up successful
    if (response.ok) {
        window.location.href = "/";
    } else {
        const error_message = document.getElementsByClassName("signin_error")[0];
        error_message.style.display = "block";
    }
});