## Tea Hall
### Introduction
Tea Hall is a microblogging website where residents of on-campus residence halls at the University of Minnesota can post about happenings around their hall in 417 characters or less. The site intends to foster a welcoming and non-judgemental community among hall residents.

### Running the Site
To run this website on your computer, you must have Node.js and npm (Node Package Manager) installed on it. You can how to install Node.js [here](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs). If the method you use doesn't also install npm, make sure to do that too. Once you've installed nodejs, you should unzip the source folder for the site and open it in a new terminal window.

Once you've opened the site's source folder in the terminal, you need to install all of the project's dependencies that are listed in the project's package-lock folder. To do this, run the following command:
```
npm install
```

Now your environment should be set up to run the site. To run T-Hall Tea's server, you should download the source code and navigate to the root folder of the project. Then, run the command below:
```
node server.js
```

### Additional Notes
In order to create, like, edit, and delete posts, you must be signed in. You can create an account by clicking on "Sign In" at the top of the home page and then the "Sign Up" link under the sign in button. Once you have made an account, you can like every post, but you can only edit and delete your own posts. The site will group the posts into pages of ten which you can navigate through using the arrow(s) at the bottom of the feed.