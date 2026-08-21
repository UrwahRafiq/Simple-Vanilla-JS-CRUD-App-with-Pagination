let form = document.querySelector('.form');
let input = document.querySelector('#input');
let msg = document.querySelector('.form-message');
let posts = document.querySelector('#posts');

// querySelector # & . needed to select them but not needed for general html tags
// querySelectorAll returns a list which needs a loop to listen to events of all elements

form.addEventListener("submit", (e) => {
    e.preventDefault(); //prevents the page from reloading on submit
    console.log("clicked");
    formValidation();
});

let formValidation = () => {
    // trim: removes extra space at end or start, prevent empty posts
    if (input.value.trim() === "") {
        msg.classList.add("red");
        console.log("failure");
    }
    else {
        acceptData();
        msg.classList.add("green");
        input.value = "";
        console.log("success");
    }
};

// object to accept form input data
let data = {};

let acceptData = () => {
    // find text key in data obj/array & change its value
    data["text"] = input.value;
    createPosts();
    console.log(data);
};

// create posts
let createPosts = () => {
    // create post div
    let postDiv = document.createElement("div");
    let postText = document.createElement("p");
    let postSpan = document.createElement("span");
    let edit = document.createElement("i");
    let del = document.createElement("i");

    // assign classes to elements
    postSpan.className = "options";
    edit.className = "fa-regular fa-pen-to-square";
    del.className = "fa-solid fa-trash";

    // set text with data property, 
    postText.innerText = data.text;

    // delete post
    del.addEventListener("click", () => {
        postDiv.remove();

        let remainingPosts = posts.children.length;
        // 2 > 1 && 2 <= (2 - 1) * 2 -> 1 * 2 = 3 -->> 2 > 1 && 2 <= 3 (3 is boundary) --->>> T && T
        if(currentPage > 1 && remainingPosts <= (currentPage - 1) * 2) {
            currentPage--;
        }
        handlePagination();

        console.log("deleted");
    });

    // edit post
    edit.addEventListener("click", () => {
        // sends post text back to the textarea
        input.value = postText.innerText;
        postDiv.remove();

        let remainingPosts = posts.children.length;
        if(currentPage > 1 && remainingPosts <= (currentPage - 1) * 2) {
            currentPage--;
        }
        handlePagination();

        console.log("edited");
    });

    // set up elements hierarchy
    postSpan.append(edit, del);
    postDiv.append(postText, postSpan);

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