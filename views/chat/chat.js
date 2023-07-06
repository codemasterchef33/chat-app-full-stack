//get all key-values from localstorage!
const token = localStorage.getItem("userToken");
const User = localStorage.getItem("name");
const groupId = localStorage.getItem("groupId");
const groupName = localStorage.getItem("groupName");
const admin = JSON.parse(localStorage.getItem('isAdmin'));
const form1= document.getElementById("groupform");

const chatList = document.getElementById("chat");
const fileList = document.getElementById("filemsg");
const form = document.getElementById("chat-form");
const groupDiv = document.getElementById("group");
const groupDiv1 = document.getElementById("othergroup");

// const socket = io();

//fxn running when a user sends a chat!
form.addEventListener("submit", chatFxn);

async function chatFxn(e) {
  e.preventDefault();

  const message = {
    message: e.target.message.value,
  };
 
  try {
    const response = await axios.post(
      `http://localhost:3000/message/postmessage/${groupId}`,
      message,
      {
        headers: {
          "Authorization": token,
        },
      }
    );
    
  
  
 
    e.target.message.value = "";
    saveToLocal(response.data.arr);
    // socket.emit("chatMessage", response.data.arr);
    
    
      
   
  } catch (error) {
    console.log(error);
  };
};
let lastMsgId;
let chatArr = [];



window.addEventListener("DOMContentLoaded", async (e) => {

  screenLoader(e);
  screenLoader1(e);
});





async function screenLoader1(e) {
  e.preventDefault();

  
  try {
    let response = await axios.get("http://localhost:3000/group/getgroups", {
      headers: { "Authorization": token }
    });
    console.log(response)
    showOnScreen(response.data.data);
   
  } catch (error) {
    console.log(error);
  };
};

form1.addEventListener('submit', async (e) => {
  e.preventDefault()
  const group = {
    group: e.target.group.value
  };

  try {
    const response = await axios.post('http://localhost:3000/group/create-group', group, { headers: { 'Authorization': token } });
    console.log(response);
    e.target.group.value = '';
    screenLoader1();

  } catch (err) {
    console.log(err);
  };
});


function showOnScreen(data) {
  groupDiv1.innerHTML = '';
  if (data.length !== 0) {
    groupDiv1.style.display = 'block';
  };

  data.forEach(element => {
    const child = `<di style="cursor:pointer;" class="group-name" id="group-name-btn" onClick="openGroup('${element.id}','${element.name}')">${element.name}</div><hr>`

    groupDiv1.innerHTML += child
  });
  
};


//default fxn!
async function screenLoader(e) {
  e.preventDefault();
  document.getElementById("groupname").innerHTML = groupName;
  document.getElementById("username").innerHTML = `<small class="grp-user">Hey! </small> ${User}`;
  isAdmin(groupId);
  getMessage(groupId);
  getFiles(groupId);
  getUsers(groupId);
  if (admin) {
    document.getElementById('add-user').classList.add('admin');
  };
};


//checker fxn for admin rights!
async function isAdmin(groupId) {
  try {
    let response = await axios.get(`http://localhost:3000/group/isAdmin/${groupId}`, { headers: { "Authorization": token } });
    localStorage.setItem('isAdmin', response.data);
    if (JSON.parse(localStorage.getItem('isAdmin'))) {
      document.getElementById('add-user').classList.add('admin');
    }
  } catch (error) {
    console.log(error);
  };
};

async function getFiles(groupId) {
  console.log(groupId)
  const files = JSON.parse(localStorage.getItem(`file${groupId}`));
  let response = await axios.get(`http://localhost:3000/message/getfile?groupId=${groupId}`, { headers: { "Authorization": token } });
  let data = response.data.urls;
  console.log(data)
  setTimeout(() => {
    showFileOnScreen(data)

  }, 500);
};


//get and save msgs from local storage!
async function getMessage(groupId) {
  const messages = JSON.parse(localStorage.getItem(`msg${groupId}`));
  if (messages == undefined || messages.length == 0) {
    lastMsgId = 0;
  } else {
    lastMsgId = messages[messages.length - 1].id;
  };

  try {
    const response = await axios.get(
      `http://localhost:3000/message/getmessage/${groupId}?lastmsgid=${lastMsgId}`,
      {
        headers: {
          "Authorization": token,
        },
      }
    );
    var newArray = response.data.arr;
    saveToLocal(newArray);
  } catch (error) {
    console.log("Unable to retrieve messages!", error);
  };
};

// retrieve users in group on side bar! 
async function getUsers(groupId) {
  try {
    let response = await axios.get(
      `http://localhost:3000/group/fetch-users/${groupId}`,
      { headers: { "Authorization": token } }
    );
    let admin = JSON.parse(localStorage.getItem('isAdmin'));
    if (admin) {
      response.data.forEach((data) => displayGroupAdminUser(data));
    } else {
      response.data.forEach(data => displayNormalUsers(data));
    };
  } catch (error) {
    console.log(error);
  }
}

// display admin user!
function displayGroupAdminUser(data) {
  let child = `<div  class="group-style" id=${data.id}>
  <div class="user-btn">${data.name}</div>
  <div class="admin-buttons">
  <a href="http://127.0.0.1:5500/views/chat/chat.html" class="add-user mx-2 btn btn-sm btn-secondary rounded-5" onclick="makeAdmin('${data.id}'); window.location.reload(true); return false;" data-toggle="tooltip" title="Add Admin">&#9889</a>
  <a class="remove-admin btn btn-sm btn-secondary rounded-5 mx-2" onclick="removeAdmin('${data.id}')" data-toggle="tooltip" title="Remove Admin">&#9940</a>
  <a class="remove-user btn btn-sm btn-secondary rounded-5 mx-2" onclick="removeUser('${data.id}')" data-toggle="tooltip" title="Remove User">&#128683</a>
  </div> 
</div>
<hr/>`;

  groupDiv.innerHTML += child;
}

//display normal users!
function displayNormalUsers(data) {
  let child = `<div style="width:100%;color:white" class="group-style" id=${data.id}>
  <button class="user-btn">${data.name}</button>
  <div class="admin-buttons">
  <a class="remove-user btn btn-sm btn-secondary rounded-5" onclick="removeUser('${data.id}')" data-toggle="tooltip" title="Remove User">&#128683</a>
  </div>
</div>
<br/>
<hr style="color:white;"/>`

  groupDiv.innerHTML += child;
}

//remove user from db!
async function removeUser(userId) {
  const details = {
    userId,
    groupId
  };
  try {
    let response = await axios.post('http://localhost:3000/group/remove-user', details, { headers: { "Authorization": token } });
    alert('User removed Successfully!');
    removeUserFromScreen(response.data.user);
  } catch (error) {
    if (error.response.status == 402) {
      alert('Only Admin has delete rights!');
    } else if (error.response.status == 404) {
      alert('no group or user found!');
    } else {
      alert('unknown error occured! Cannot change admin rights.');
    };
  };
};

//remove user from front end side bar!
function removeUserFromScreen(user) {
  const child = document.getElementById(`${user.id}`);
  groupDiv.removeChild(child);
}

//make and remove admin rights
async function makeAdmin(userId) {
  const details = {
    userId,
    groupId
  };
  console.log(details)
  try {
    let response = await axios.post(`http://localhost:3000/group/makeAdmin`, details, { headers: { "Authorization": token } });
    alert('User is Admin now!');
  } catch (error) {
    console.log(error, { message: 'unknown error occurred! Cannot change admin rights.' });
  }
}

async function removeAdmin(userId) {
  const details = {
    userId,
    groupId
  };
  try {
    let response = await axios.post('http://localhost:3000/group/removeAdmin', details, { headers: { "Authorization": token } });
    alert('Removed Admin rights from User!');
  } catch (error) {
    console.log(error, { message: 'Cannot make admin! Error occurred' });
  }
}
// -==================================================================================================================================-

//function for user search box on side bar!
document.getElementById('form-group').onsubmit = async function (e) {
  e.preventDefault();
  const details = {
    email: e.target.email.value,
    groupId: groupId
  };

  try {
    let response = await axios.post('http://localhost:3000/group/addUser', details, { headers: { "Authorization": token } });
    displayGroupAdminUser(response.data.user);
    alert('User added to group successfully!');
    document.querySelector('.groupName').value = '';
  } catch (error) {
    if (error.response.status == 401) {
      alert("User already in group!");
    } else if (error.response.status == 400) {
      alert("Enter Mail!");
    } else if (error.response.status == 404) {
      alert("User not found!")
    } else {
      alert('Unknown error occurred!');
    };
  };
};

//save messages in an array on local storage!
function saveToLocal(arr) {
  let oldMessages = JSON.parse(localStorage.getItem(`msg${groupId}`));
  if (oldMessages == undefined || oldMessages.length == 0) {
    chatArr = chatArr.concat(arr);
  } else {
    chatArr = [];
    chatArr = chatArr.concat(oldMessages, arr);
  }
  localStorage.setItem(`msg${groupId}`, JSON.stringify(chatArr));
  showChatOnScreen();
}

//function to display chat on screen!
function showChatOnScreen() {
  chatList.innerHTML = "";
  chatArr.forEach((chat) => {
    if (User == chat.name) {
      let child = `<li class="me" id=${chat.id}>
      <div class="entete">
        <h3>${new Date(Date.parse(chat.createdAt)).toLocaleString([], {
        timezone: "IST",
        hour12: true,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
      </h3>
        <h2>${chat.name}</h2>
        <span class="status blue"></span>
      </div>
      <div class="triangle"></div>
      <div class="message">
        ${chat.message}
      </div>
    </li>`;

      chatList.innerHTML += child;
    } else {
      let child = `<li class="you" id=${chat.id}>
      <div class="entete">
        <h3>${new Date(Date.parse(chat.createdAt)).toLocaleString([], {
        timezone: "IST",
        hour12: true,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
      </h3>
        <h2>${chat.name}</h2>
        <span class="status blue"></span>
      </div>
      <div class="triangle"></div>
      <div class="message">
        ${chat.message}
      </div>
    </li>`;

      chatList.innerHTML += child;
    }
  });
  document.getElementById(`${lastMsgId}`).scrollIntoView();
}

// socket.on("chatMessage", (message) => {
//   saveToLocal(message);
//   showOnChatScreen(chatArr);
// });

// socket.on("connect", () => {
//   console.log("Connected to the server.");
// });

// socket.on("disconnect", () => {
//   console.log("Disconnected from the server.");
// });

// socket.on("newMessage", (message) => {
//   console.log("New message received:", message);
//   saveToLocal(message);
//   showOnChatScreen(chatArr);
// });


//Logout function!
document.getElementById("logout").onclick = function (e) {
  localStorage.removeItem("userToken");
  localStorage.removeItem("msg");
  localStorage.removeItem("name");
  window.location.href = "../login/login.html";
};

//sendfile function!
const fileform = document.getElementById('uploadForm')
fileform.addEventListener('submit', async function (e) {
  e.preventDefault();
  let formData = new FormData(fileform)
  let response = await axios.post(`http://localhost:3000/message/postfile/${groupId}`, formData, { headers: { "Authorization": token, "Content-Type": "multipart/form-data" } });
  let data = response.data
  console.log(data)
  let chatData = []
  chatData.push(data)
  showFileOnScreen(chatData);
  alert('File uploaded and sent successfully!')
})

async function showFileOnScreen(data) {
  localStorage.setItem(`file${groupId}`, JSON.stringify(data));
  data.forEach((data) => {
    let names = data.fileName
    let createdAt = (((names.split("/")[1]).split('.')[0]).split(' ').slice(1, 5)).join(' ')
    if (User == data.name) {
      let child = `<li class="me" id=${data.userId}>
      <div class="entete">
      <h2>You</h2>
        <h5>${new Date(Date.parse(createdAt)).toLocaleString([], {
        timezone: "IST",
        hour12: true,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
      </h5>
      </div>
      <div class="triangle"></div>
      <div class="message">
      <a href="${data.fileUrl || data.message}">Link!</a>
      </div>
    </li>
    <hr>`;

      fileList.innerHTML += child;
      chatList.innerHTML += child;
    } else {
      let child = `<li class="you" id=${data.userId}>
      <div class="entete">
      <h2 class="text-primary">${data.name}</h2>

      </div>
      <div class="triangle"></div>
      <div class="message">
      <a href="${data.fileUrl || data.message}">Link!</a>
      </div>
    </li>
    <hr>`;

      fileList.innerHTML += child;
      chatList.innerHTML += child;
      console.log(fileList)
    }
  });
};

const modal = document.getElementById("modal");
const openModalButton = document.getElementById("open-modal-button");
const closeModalButton = document.getElementById("close-modal-button");

// add a click event listener to the open modal button
openModalButton.addEventListener("click", function () {
  // add the "show" class to the modal to display it
  modal.classList.add("show");
});

// add a click event listener to the close modal button
closeModalButton.addEventListener("click", function () {
  // remove the "show" class from the modal to hide it
  modal.classList.remove("show");
});

function openGroup(groupId, groupname) {
  localStorage.setItem('groupId', groupId)
  localStorage.setItem('groupName', groupname)
  window.location.href = './chat.html'
}
