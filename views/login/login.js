const form = document.getElementById("signup-form");

form.addEventListener("submit", login);

async function login(e) {
  e.preventDefault();

  const loginDetails = {
    email: e.target.email.value,
    password: e.target.password.value,
  };

  console.log(loginDetails);

  try {
    const response = await axios.post(
      "http://localhost:3000/user/login",
      loginDetails
    );

    if (response.status === 200) {
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem('name', response.data.name)
      alert("Logged in successfully!");
      window.location.href = '../group/group.html'
    } else {
      e.target.password.value = "";
    }
  } catch (error) {
    if (error.response.status === 400) {
      alert("Enter all fields!");
    } else if (error.response.status === 404) {
      alert("User not found!");
    } else if (error.response.status === 401) {
      alert("User not authorized!");
    } else {
      console.log(error);
    }
  }
}
