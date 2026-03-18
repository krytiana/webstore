const userSection = document.getElementById("userSection");

function checkLogin(){
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if(user){
    userSection.innerHTML = `
      <a href="dashboard.html">Hi, ${user.name}</a>
    `;
  }else{
    userSection.innerHTML = `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }
}

window.logout = function(){
  localStorage.removeItem("currentUser");
  location.reload();
};

checkLogin();