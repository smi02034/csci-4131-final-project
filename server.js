const data = require("./data.js");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const app = express();
const port = 4131;
const secret = "jkdsajlkuewHFjkhMNfhuaspdoifdLJKsa";

app.set("views", "templates");
app.set("view engine", "pug");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("resources"));
app.use(express.json());

// Middleware for printing server activity to the console
app.use("/", (req, res, next) => {
    console.log(`- ${req.method} request made to ${req.originalUrl}`);
    next();
});

// Middleware for establishing session cookie
app.use(session({
    secret: secret,
    resave: false,
    saveUnitialized: false,
}));

// Get paths

app.get("/", (req, res) => {
    load_home_content(req, res);
});

// Helper function for generating home page to remove clutter and take advantage of
// using an async function.
async function load_home_content (req, res) {
    let order = req.query.order ? req.query.order : "recent"; 
    let page = req.query.page ? req.query.page : 1; 
    let posts = await data.get_posts(order, page);
    let page_data = {page: page, total_pages: await data.get_total_pages()};
    let user = {};

    // If user signed in, need to get the posts that they've liked
    if (req.session.user_id) {
        user.signedin = 1;
        user.username = req.session.username; 
        liked_posts = await data.get_liked_posts(req.session.user_id);
        user_post_data = await data.get_user_post_data(req.session.user_id);
        res.status(200).render("home.pug", {order, posts, page_data, user, liked_posts, user_post_data});
        console.log(`    Response sent with status code ${res.statusCode}.`);
    } else {
        user = {signedin: 0};
        res.status(200).render("home.pug", {order, posts, page_data, user});
        console.log(`    Response sent with status code ${res.statusCode}.`);
    }
}

app.get("/signin", (req, res) => {
    res.render("signin.pug");
    console.log(`    Response sent with status code ${res.statusCode}.`);
});

app.get("/signup", (req, res) => {
    res.render("signup.pug");
    console.log(`    Response sent with status code ${res.statusCode}.`);
});

app.get("/api/signout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// Post paths

// Template for establishing express session taken from express-session package documentation
// https://www.npmjs.com/package/express-session
app.post("/api/signin", (req, res) => {
    try {
        data.get_user_data(req.body.username).then((user_data) => {
            // Checking if the username given is in the user table
            if (user_data.id) {
                bcrypt.compare(req.body.password, user_data.password).then((valid) => {
                    if (valid) {
                        //Password was valid so establish session
                        req.session.regenerate(() => {
                            // Storing the username in the session
                            req.session.user_id = user_data.id;
                            req.session.username = req.body.username;
                            // Saving the session
                            req.session.save(() => {
                                res.status(200).send();
                                console.log(`    Response sent with status code ${res.statusCode}.`);
                            });
                        });
                    } else {
                        res.status(401).send();
                        console.log(`    Response sent with status code ${res.statusCode}.`);
                    }
                });
            } else {
                res.status(401).send();
                console.log(`    Response sent with status code ${res.statusCode}.`);
            }
        });
    } catch {
        res.status(400).send();
    }
});

app.post("/api/signup",  (req, res) => {
    // If username DNE in database, user_data.id will be undefined
    try {
        data.get_user_data(req.body.username).then((user_data) => { 
            if (!user_data.id) {
                bcrypt.hash(req.body.password, 10).then((pw_hash) => {
                    data.new_user(req.body.username, pw_hash).then((user_id) => {
                        req.session.regenerate(() => {
                        // Storing the username in the session
                            req.session.user_id = user_id;
                            req.session.username = req.body.username;
                            // Saving the session
                            req.session.save(() => {
                                res.status(200).send();
                                console.log(`    Response sent with status code ${res.statusCode}.`);
                            });
                        });
                    });
                });
            } else {
                res.status(400).send();
                console.log(`    Response sent with status code ${res.statusCode}.`);
            }
        });
    } catch {
        res.status(400).send();
        console.log(`    Response sent with status code ${res.statusCode}.`);
    }
});

app.post("/api/post", (req, res) => {
    try {
        data.new_post(req.body.content, req.session.username, req.session.user_id).then(() => {
            res.status(200).send();
            console.log(`    Response sent with status code ${res.statusCode}.`);
        });
    } catch {
        res.status(400).send();
        console.log(`    Response sent with status code ${res.statusCode}.`);
    }
});

app.post("/api/like", (req, res) => {
    try {
        data.add_like(req.body.post_id, req.session.user_id).then((result) => {
            result.affectedRows == 1 ? res.status(200).send() : res.status(400).send();
            console.log(`    Response sent with status code ${res.statusCode}.`);
        });
    } catch {
        res.status(400).send();
        console.log(`    Response sent with status code ${res.statusCode}.`);
    }
});

// Put paths

app.put("/api/post", (req, res) => {
    try {
        data.update_post(req.body.post_id, req.body.new_content).then((result) => {
            result.affectedRows == 1 ? res.status(200).send() : res.status(400).send();
            console.log(`    Response sent with status code ${res.statusCode}.`);
        });
    } catch {
        res.status(400).send();
        console.log(`    Response sent with status code ${res.statusCode}.`);    
    }
});

// Delete paths

app.delete("/api/post", (req, res) => {
    try {
        data.delete_post(req.body.post_id).then((result) => {
            result.affectedRows == 1 ? res.status(200).send() : res.status(400).send();
            console.log(`    Response sent with status code ${res.statusCode}.`);
        });
    } catch {
        res.status(400).send();
        console.log(`    Response sent with status code ${res.statusCode}.`);    
    }
});

app.delete("/api/like", (req, res) => {
    try {
        data.remove_like(req.body.post_id, req.session.user_id).then((result) => {
            result.affectedRows == 1 ? res.status(200).send() : res.status(400).send();
            console.log(`    Response sent with status code ${res.statusCode}.`);
        });
    } catch {
        res.status(400).send();
        console.log(`    Response sent with status code ${res.statusCode}.`);    
    } 
});

app.use((req, res, next) => {
    res.status(404).render("404.pug");
    console.log(`    Response sent with status code ${res.statusCode}.`);
});

app.listen(port, () => {
    console.log(`Site listening on port ${port}`);
});