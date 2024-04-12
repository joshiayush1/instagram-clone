let ipt = document.querySelector("#ipt");
let clutter = "";
ipt.addEventListener("input", function () {
  axios
    .get(`/searchuser/${ipt.value}`)
    .then(function (response) {
      clutter = "";
      response.data.forEach(function (user) {
        clutter += `
        <a href="/profile/${user._id}">
          <div class="options">
            <div class="imageUser">
              <img src="/images/uploads/${user.profilePicture}" alt="">
            </div>
            <div class="details">
              <div class="usernameUser">${user.username}</div>
              <div class="nameUser">${user.fullname}</div>
            </div>
          </div>
          </a>`;
      });
      document.querySelector(".outerOptions").innerHTML = clutter;
    })
    .catch(function (error) {
      console.error("Error:", error);
    });
});
