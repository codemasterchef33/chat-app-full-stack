const groupDiv = document.getElementById("group");
const form = document.getElementById("groupform");
groupDiv.style.display = 'none';

let token = localStorage.getItem("userToken");
let username = localStorage.getItem("name");
let groupId = localStorage.getItem("groupId");

localStorage.removeItem(`msg${groupId}`);

window.addEventListener("DOMContentLoaded", screenLoader);

async function screenLoader(e) {
  e.preventDefault();

  document.getElementById("welcomename").innerHTML = `${username.split(" ")[0]}`;
  try {
    let response = await axios.get("http://localhost:3000/group/getgroups", {
      headers: { "Authorization": token }
    });
    showOnScreen(response.data.data);
   
  } catch (error) {
    console.log(error);
  };
};

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const group = {
    group: e.target.group.value
  };

  try {
    const response = await axios.post('http://localhost:3000/group/create-group', group, { headers: { 'Authorization': token } });
    console.log(response);
    e.target.group.value = '';
    screenLoader()

  } catch (err) {
    console.log(err);
  };
});

function showOnScreen(data) {
  groupDiv.innerHTML = '';
  if (data.length !== 0) {
    groupDiv.style.display = 'block';
  };

  data.forEach(element => {
    const child = `<di style="cursor:pointer;" class="group-name" id="group-name-btn" onClick="openGroup('${element.id}','${element.name}')">${element.name}</div><hr>`

    groupDiv.innerHTML += child
  });
  
};

function openGroup(groupId, groupname) {
  localStorage.setItem('groupId', groupId)
  localStorage.setItem('groupName', groupname)
  window.location.href = '../chat/chat.html'
}

document.getElementById("logout").onclick = function (e) {
  localStorage.removeItem("userToken");
  localStorage.removeItem("msg");
  localStorage.removeItem("name");
  window.location.href = "../login/login.html";
};
