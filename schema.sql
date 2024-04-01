CREATE TABLE user (
    id INT NOT NULL auto_increment,
    username VARCHAR(24) NOT NULL,
    password TEXT NOT NULL,
    primary key(id)
);

CREATE TABLE post (
    id INT NOT NULL auto_increment,
    content VARCHAR(417) NOT NULL,
    poster_name VARCHAR(24) NOT NULL, 
    like_count INT NOT NULL DEFAULT 0,
    time_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    poster_id INT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (poster_id) REFERENCES user(id)
);

-- Apologies for not following convention and using "likes" instead of "like" here,
-- SQL wouldn't let me make a table with "like" as the name.
-- The primary key is the composite of post and user id because each user can only like a post once.
CREATE TABLE likes (
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT id PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES post(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);
