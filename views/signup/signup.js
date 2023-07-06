const form = document.getElementById("signup-form");

form.addEventListener("submit", signup);

async function signup(e) {
  e.preventDefault();

  const userDetails = {
    name: e.target.name.value,
    email: e.target.email.value,
    phone: e.target.phone.value,
    password: e.target.password.value,
  };

  try {
    const response = await axios.post(
      "http://localhost:3000/user/signup",
      userDetails
    );
    if (response.status == 201) {
      alert("Successfully signed up!");
      window.location.href = "../login/login.html";
    } else {
      console.log("Check your credentials!");
    }
  } catch (error) {
    if (error.response.status == 409) {
      alert("Existing user!");
    }
    console.log(error);
  }
}

