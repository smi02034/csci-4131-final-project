const mysql = require(`mysql-await`); 

// Connection pool documentation: https://www.npmjs.com/package/mysql#pooling-connections
var connPool = mysql.createPool({
  connectionLimit: 5, 
  // Database details removed from git commit for security
  host: "",
  user: "",
  database: "",
  password: "", 
});

// When given content, the username of a poster, and the id of the poster, creates a new post in the database
// and returns an OkPacket.
async function new_post(content, poster_name, poster_id) {
    return connPool.awaitQuery("INSERT INTO post (content, poster_name, poster_id) VALUES (?, ?, ?);", [content, poster_name, poster_id]);
}

// Given a post id and new content, updates the post's content column to have the new content and returns
// an OkPacket.
async function update_post(post_id, new_content) {
    return connPool.awaitQuery("UPDATE post SET content = ? WHERE id = ?;", [new_content, post_id]);
}

// Given a post id, deletes the post from the post table and returns an OkPacket.
async function delete_post(post_id) {
    // Deleting the likes from likes table before deleting the post because of the 
    // foreign key constraints in the likes table.
    await connPool.awaitQuery("DELETE FROM likes WHERE post_id = ?;", [post_id]);
    return connPool.awaitQuery("DELETE FROM post WHERE id = ?;", [post_id]);
}

// Given an order to sort the posts by and a page number (which determines which chunk of 
// posts to return) returns an array of JS objects representing each post. 
async function get_posts(order, page_num) {
    let order_by = order == "top" ? "like_count" : "time_posted";
    let offset = parseInt((page_num - 1) * 10);

    // I was getting a weird bug with my sorting when I was trying to send the column
    // to order by using ? (I think it might be that the column name was being in quotations?)
    // so I did string concantanation for this one.
    let query = `SELECT * FROM post ORDER BY ${order_by} DESC LIMIT ${offset},10;`;
    let result = await connPool.awaitQuery(query);

    let posts = [];
    for (row of result) {
        posts.push({id: row.id, poster_name: row.poster_name, content: row.content, like_count: row.like_count, time_posted: row.time_posted});
    }
    return posts;
}

// When given a user id, returns the number of posts the user has made and the combined number of likes 
// they've received in a JS object.
async function get_user_post_data (user_id) {
    let result = await connPool.awaitQuery("SELECT like_count FROM post WHERE poster_id = ?", [user_id]);
    let post_count = 0;
    for(row in result) {
        post_count += 1;
    }
    return {"post_count": post_count};
}

// Gets the total number of pages of posts there are and returns it as an int. 
async function get_total_pages() {
    let result = await connPool.awaitQuery("SELECT COUNT(id) AS count FROM post;");
    // If there are zero posts in the database, still need one page
    num_of_posts = result[0].count != 0 ? result[0].count : 1;
    return num_of_posts % 10 == 0 ? num_of_posts / 10 : parseInt((num_of_posts / 10)) + 1;
}

// When given a post id and user id, adds a like to the like table and the post and returns an OkPacket.
async function add_like(post_id, user_id) {
    let result = await connPool.awaitQuery("INSERT INTO likes (post_id, user_id) VALUES (?, ?);", [post_id, user_id]);
    // If like was properly inserted into likes table, update post like count
    if (result.affectedRows == 1) {
        return connPool.awaitQuery("UPDATE post SET like_count = like_count + 1 WHERE id = ?", [post_id]);
    } else {
        return result;
    }
}

// When given a post id and a user id, removes a like from the like table and post and returns an OkPacket.
async function remove_like(post_id, user_id) {
    let result = await connPool.awaitQuery("DELETE FROM likes WHERE post_id = ? AND user_id = ?;", [post_id, user_id]);
    // If like was properly deleted from likes table, update post like count
    if (result.affectedRows == 1) {
        return connPool.awaitQuery("UPDATE post SET like_count = like_count - 1 WHERE id = ?", [post_id]);
    } else {
        return result;
    }
}

// Given a user id, returns all of the posts the user's liked as an array of JS objects that represent each post.
async function get_liked_posts(user_id) {
    let result = await connPool.awaitQuery("SELECT post_id FROM likes WHERE user_id = ?", [user_id]);
    let liked_posts = [];
    for (row of result) {
        liked_posts.push(row.post_id);
    }
    return liked_posts;
}

// Given a username and a hashed password, inserts user into the user table and returns their id. 
async function new_user(username, pw_hash) {
    let result = await connPool.awaitQuery("INSERT INTO user (username, password) VALUES (?, ?);", [username, pw_hash]);
    // Getting user id for session
    if(result.affectedRows == 1) {
        result = await connPool.awaitQuery("SELECT id FROM user WHERE username = ?", [username]);
        return result[0].id;
    }
}

// Given a username, gets all of the user's data and returns it as a JS object.
async function get_user_data(username) {
    let result = await connPool.awaitQuery("SELECT * FROM user WHERE username = ?", [username]);
    user_data = {}
    if (result.length > 0) {
        for(row of result) {
            user_data.id = row.id;
            user_data.username = row.username;
            user_data.password = row.password;
        }
    }
    return user_data;
}

module.exports = {get_posts, get_total_pages, new_post, add_like, remove_like, get_liked_posts, delete_post, update_post, new_user, get_user_data, get_user_post_data}