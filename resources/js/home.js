// If the user info panel is there, then the user is logged in and the user-ony
// functionality should be loaded.
if (document.getElementById("user_info")) {
    user_info_functionality();
    like_functionality();
    delete_functionality();
    edit_functionality();
}

// Function for adding post creation functionality to the user information 
// panel on the left.
function user_info_functionality () {
    const user_info = document.getElementById("user_info");
    const new_post = document.getElementById("new_post");
    const post_edit = document.getElementById("post_edit");
    const create_post = document.getElementById("create_post");
    const error_message = post_edit.children[1];

    new_post.addEventListener("click", () => {
        post_edit.style.display = "flex";
        user_info.style.display = "none";
    })

    create_post.addEventListener("click", async () => {
        let content = post_edit.children[2].children[0].value;
        if (content.length <= 417) {
            let response = await fetch("/api/post", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: `{"content": "${content}"}`
            });
            if(response.ok) {
                // Reload page
                window.location.href = "/"
            } else {
                error_message.innerText = "Error with post creation."
                error_message.style.display = "flex";
                error_message.style.margin = "0px";
                error_message.style.width = "90%";
            }
        } else {
            error_message.style.display = "flex";
            error_message.style.margin = "10px";
            error_message.style.width = "90%";
        }
    });
}

// Helper function for post_functionality(). Takes either 1 (add like) or 
// -1 (remove like) and updates the like button styling and like counter accordingly.
function update_like_counter(like_button, like_count, val) {
    // Getting DOM elements for the post's like count indicator for manipulation
    const like_count_num = like_count.children[0];
    const like_count_str = like_count.children[1];
    if (val == 1) {
       like_button.classList.add("liked");
       like_button.classList.remove("material-symbols-outlined");
       like_button.classList.add("material-icons");
    } else {
       like_button.classList.remove("liked");
       like_button.classList.remove("material-icons");
       like_button.classList.add("material-symbols-outlined");
    }
    like_count_num.innerText = parseInt(like_count_num.innerText) + val;
    // Determining whether to use the plural form
    like_count_str.innerText = parseInt(like_count_num.innerText) == 1 ? " like" : " likes"
}

function like_functionality () {
    const like_buttons = document.getElementsByClassName("like_button");
    const like_counts = document.getElementsByClassName("like_count");
    if(like_buttons) {
        for (let i = 0; i < like_buttons.length; i++) {
            const like_button = like_buttons[i];
            like_button.addEventListener("click", () => {
                // If post wasn't already liked by the user, add a like and fill in the heart
                // else, remove the like and make the heart empty again
                if (!like_button.classList.contains("liked")) {
                    // Immediately updating the like counter so user doesn't have
                    // to wait for the response from the database. If the like can't 
                    // be added, it will be removed later.
                    update_like_counter(like_button, like_counts[i], 1);

                    let parent_post = like_button.parentElement.parentElement.parentElement;
                    fetch("/api/like",
                        {method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: `{"post_id": ${parent_post.id}}`}
                    ).then((response) => {
                        // If the like couldn't be added to the database, undo the change on the front end
                        if (!response.ok) {
                            update_like_counter(like_button, like_counts[i], -1);
                        }
                    });
                } else {
                    // Immediately updating the like counter so user doesn't have
                    // to wait for the response from the database. If the like can't 
                    // be added, it will be removed later.
                    update_like_counter(like_button, like_counts[i], -1);

                    let parent_post = like_button.parentElement.parentElement.parentElement;
                    fetch("/api/like",
                        {method: "DELETE",
                        headers: {"Content-Type": "application/json"},
                        body: `{"post_id": ${parent_post.id}}`}
                    ).then((response) => {
                        // If the like couldn't be removed from the database, undo the change on the front end
                        if (!response.ok) {
                            update_like_counter(like_button, like_counts[i], 1);
                        }
                    });
                }
            });
        }
    } 
}

function delete_functionality() {
    const post_actions = document.getElementsByClassName("post_actions");
    for (post_action of post_actions) {
        const delete_button = post_action.children[1];
        delete_button.addEventListener("click", () => {
            let parent_post = delete_button.parentElement.parentElement.parentElement.parentElement;
            fetch("/api/post",
                {method: "DELETE",
                headers: {"Content-Type": "application/json"},
                body: `{"post_id": ${parent_post.id}}`}
            ).then((response) => {
                // Wait until the post has been deleted from the database to delete it from the front end
                if (response.ok) {
                    parent_post.remove();
                    const post_count = document.getElementById("user_info").children[1].children[0];
                    post_count.innerText = parseInt(post_count.innerText) - 1;
                }
            });
        });
    }
}

function edit_functionality() {
    const post_actions = document.getElementsByClassName("post_actions");
    for (post_action of post_actions) {
        const edit_button = post_action.children[0];
        edit_button.addEventListener("click", () => {
            const parent_post = edit_button.parentElement.parentElement.parentElement.parentElement
            const post_content = parent_post.children[0];
            const post_text = post_content.children[1];
            const post_footer = post_content.children[2];

            // Hiding the current text and like button and displaying the edit box
            post_text.style.display = "none";
            post_footer.style.display = "none";

            const edit_box = post_content.children[3];
            edit_box.style.display = "flex";

            const save_button = edit_box.children[2];
            // Since I'm using the put method, I'm doing the submission through JS instead of HTML forms.
            save_button.addEventListener("click", async () => {
                let post_id = save_button.parentElement.parentElement.parentElement.id;
                let new_content = save_button.previousElementSibling.value;
                if (new_content.length <= 417) {
                    let response = await fetch("/api/post", {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: `{"post_id": ${post_id}, "new_content": "${new_content}"}`
                    });
                    if(response.ok) {
                        // Reload page
                        window.location.href = "/"
                    } else {
                        const error_message = edit_box.children[0];
                        error_message.style.display = "flex";
                        error_message.style.width = "95%";
                        error_message.innerText = "Error saving changes."
                    }
                } else {
                    const error_message = edit_box.children[0];
                    error_message.innerText = "Error saving changes."
                    error_message.style.display = "flex";
                    error_message.style.width = "95%";
                }
            });
        })
    }
}