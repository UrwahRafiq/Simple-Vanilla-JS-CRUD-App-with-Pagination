let form = document.querySelector('.form');
let input = document.querySelector('#input');
let msg = document.querySelector('.form-message');
let posts = document.querySelector('#posts');
let title = document.querySelector('#title');
// display post on click
let postDisplay = document.querySelector('.post-display');
let editor = document.querySelector('.social-media-app');
let closeBtn = document.querySelector('#close');

// querySelector # & . needed to select them but not needed for general html tags
// querySelectorAll returns a list which needs a loop to listen to events of all elements

// array to hold all posts
let allPosts = [];

// keep track of edits
let editedPost = null;

// track element being edited, null if creating a new one
let selectedTitle = null;
let selectedPost = null;

form.addEventListener("submit", (e) => {
    e.preventDefault(); //prevents the page from reloading on submit
    console.log("clicked");
    formValidation(e);
});

let formValidation = (e) => {
    // trim: removes extra space at end or start, prevent empty posts
    if (title.value.trim() === "") {
        msg.classList.remove("red", "green");
        msg.classList.add("red");
        console.log("failure");
    }
    else {
        msg.classList.remove("red", "green");
        acceptData(e);
        msg.classList.add("green");
        title.value = "";
        input.value = "";
        console.log("success");
    }
};

// object to accept form input data
let data = {};

let acceptData = (e) => {
    // find text key in data obj/array & change its value
    // data["text"] = input.value;
    data = Object.fromEntries(new FormData(e.target));

    if (selectedPost || selectedTitle) {
        updatePosts();
    }
    else {
        createPosts();
        allPosts.push(data);
        // convert obj/array into a json string
        localStorage.setItem("allPosts", JSON.stringify(allPosts));
    }
    console.log(data);
};

// load posts
let loadPosts = () => {
    // convert raw string to a js data type
    allPosts = JSON.parse(localStorage.getItem("allPosts")) || [];

    // render the posts
    allPosts.forEach((savedPost, index) => {
        data = savedPost;
        createPosts(savedPost, index);
    });
}

// update posts
let updatePosts = () => {
    selectedTitle.innerText = data.title;
    selectedPost.innerText = data.text;
    // update the array item at the index
    if (editedPost !== null) {
        // overwrite old data with new data
        allPosts[editedPost] = data;
        localStorage.setItem("allPosts", JSON.stringify(allPosts));
        editedPost = null;
    }

    // reset
    selectedTitle = null;
    selectedPost = null;
    // rest button
    form.querySelector("#post-btn").textContent = "Post";
    console.log("Post Updated");
}

// create posts
let createPosts = (savedPost, index) => {
    // create post div
    let postDiv = document.createElement("div");
    let postTitle = document.createElement("p");
    let postText = document.createElement("p");
    let postSpan = document.createElement("span");
    let edit = document.createElement("i");
    let del = document.createElement("i");

    // assign classes to elements
    postSpan.className = "options";
    edit.className = "fa-regular fa-pen-to-square";
    del.className = "fa-solid fa-trash";
    postTitle.className = "line-clamp-title";

    postTitle.style.cursor = "pointer";

    // set text with data property, 
    postTitle.innerText = data.title;
    postText.innerText = data.text;
    postText.style.display = "none";

    // display post on title click
    postTitle.addEventListener("click", () => {
        postDisplay.querySelector('h2').innerText = postTitle.innerText;
        postDisplay.querySelector('p').innerText = postText.innerText;

        editor.classList.add('hide');
        postDisplay.classList.add('show');
    });

    closeBtn.addEventListener("click", () => {
        editor.classList.remove('hide');
        postDisplay.classList.remove('show');
    });

    // delete post
    del.addEventListener("click", () => {
        // array method
        // (position of current element, amount to modify/delete)
        allPosts.splice(index, 1);
        localStorage.setItem("allPosts", JSON.stringify(allPosts));
        let remainingPosts = posts.children.length;
        // 2 > 1 && 2 <= (2 - 1) * 2 -> 1 * 2 = 3 -->> 2 > 1 && 2 <= 3 (3 is boundary) --->>> T && T
        if(currentPage > 1 && remainingPosts <= (currentPage - 1) * 2) {
            currentPage--;
        }
        handlePagination();

        posts.replaceChildren();
        loadPosts();

        console.log("deleted");
    });

    // edit post
    edit.addEventListener("click", () => {
        // sends post text back to the textarea
        title.value = postTitle.innerText;
        input.value = postText.innerText;
        
        selectedTitle = postTitle;
        selectedPost = postText;

        form.querySelector("#post-btn").textContent = "Update";

        // store position of post in array
        editedPost = index;

        let remainingPosts = posts.children.length;
        if(currentPage > 1 && remainingPosts <= (currentPage - 1) * 2) {
            currentPage--;
        }
        handlePagination();

        console.log("editing");
    });

    // set up elements hierarchy
    postSpan.append(edit, del);
    postDiv.append(postTitle, postText, postSpan);

    // push post to main container
    posts.append(postDiv);
    console.log("post added");

    // go to page where new post is created
    let totalPosts = posts.children.length;
    let postsPerPage = 2;

    // around up 3 / 2 = 1.5 -> 2 go to page 2
    currentPage = Math.ceil(totalPosts / postsPerPage);

    handlePagination();
};

input.addEventListener("click", () => {
    msg.classList.remove("red");
    msg.classList.remove("green");
});

window.addEventListener("click", () => {
    msg.classList.remove("red");
    msg.classList.remove("green");
});

// posts pagination
let currentPage = 1;

let handlePagination = () => {
    let postElements = Array.from(posts.children);
    let totalPosts = postElements.length;
    let container = document.querySelector(".pagination");

    // in case .pagination is not in HTML to prevent fatal error from replaceChildren function
    if(!container) return;

    // clear previous buttons
    container.replaceChildren();

    // check if pagination is needed
    if (totalPosts <= 2) {
        // clean up if only 2 posts
        // go through each post and display it again
        postElements.forEach(post => post.style.display = "block");
        container.replaceChildren();
        return;
    }

    // calculate which posts to show
    // how many posts to skip for the current page
    // array index starts at 0 eg:- 1 - 1 = 0 (no posts to skip) * 2 we want to show 2 posts
    // eg:- posts = [ 0, 1, 2, 3], page 2: (2 - 1) * 2 = 1 * 2 = 2 (start from post 2 while skipping post 0 & 1)
    let startIndex = (currentPage - 1) * 2;
    // eg:- 2 + 2 = 4, 4 acts as a boundary to stop at
    let endIndex = startIndex + 2;

    // function to display/hide posts
    // behind the scene: since i starts at 0 no need to use i <=
    // for(let i = 0; i < postElements.length; i++) {
    //     post = postElements[i];
    //     index = i;
    // }
    postElements.forEach((post, index) => {
        //e.g :- posts = [ 0, 1, 2, 3], page 1: start =  (1 - 1) * 2 = 0, end = 0 + 2 = 2
        // 0 >= 0 && 0 < 2 -> true -> display post 1
        // 1 >= 0 && 1 < 2 -> display post 2
        // 2 >= 0 && 2 < 2 -> false display none to post 3
        post.style.display = (index >= startIndex && index < endIndex) ? "block" : "none";
    });

    // render arrows
    // eg:- 1 > 1 F, 2 > 1 T
    let hasPrevPage = currentPage > 1;
    // eg:- page 1: 2 < 4 T, 4 < 4 F;
    let hasNextPage = endIndex < totalPosts;

    if (hasPrevPage) {
        let prevBtn = document.createElement("i");
        prevBtn.className = "fa-solid fa-chevron-left";
        prevBtn.onclick = () => {
            currentPage--;
            handlePagination();
        }
        container.append(prevBtn);
    }

    // render numbers
    let postsAllowed = 2;
    let totalPages = Math.ceil(totalPosts / postsAllowed);
    let numsDiv = document.createElement("div");
    numsDiv.classList.add("nums");
    container.append(numsDiv);

    for (let i = 1; i <= totalPages; i++) {
    let pageBtn = document.createElement("span");
    pageBtn.innerText = i; // Sets button text to 1 2 3

    pageBtn.onclick = () => {
        currentPage = i; // Update the current active page
        handlePagination();
    };

    numsDiv.append(pageBtn);

    }

    if (hasNextPage) {
        let nextBtn = document.createElement("i");
        nextBtn.className = "fa-solid fa-chevron-right";
        // alt syntax for event listener -> inline event property
        nextBtn.onclick = () => {
            currentPage++;
            // recursive function
            handlePagination();
        };
        // memory is already alocated to this object, common practice to place at end after writing its specifications
        container.append(nextBtn);
    }
};

// load when window loads
handlePagination();

loadPosts();