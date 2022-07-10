const socket = io();

const $messageForm =
  document.querySelector("#message-form");
const $messageFormInput =
  $messageForm.querySelector("input");
const $messageFormButton =
  $messageForm.querySelector("button");
const $locationButton = document.querySelector(
  "#send-location"
);
const messages = document.querySelector(".messages");
const sidebar = document.querySelector("#sidebar");

const messageTemplate = document.querySelector(
  "#message-template"
).innerHTML;
const messageLocationTemplate = document.querySelector(
  "#message-location-template"
).innerHTML;
const roomsDataTemplate = document.querySelector(
  "#rooms-data-template"
).innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const $newMessage = messages.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(
    newMessageStyles.marginBottom
  );
  const newMessageHeight =
    $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = messages.offsetHeight;

  const containerHeight = messages.scrollHeight;

  const scrollOffset = messages.scrollTop + visibleHeight;

  // console.log(containerHeight);

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on(
  "locationMessage",
  ({ username, url, createdAt }) => {
    console.log(location);
    const html = Mustache.render(messageLocationTemplate, {
      location: url,
      username,
      createdAt: moment(createdAt).format("h:mm a"),
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
  }
);

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(roomsDataTemplate, {
    room,
    users,
  });
  sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  socket.emit(
    "sendMessage",
    $messageFormInput.value,
    (error) => {
      $messageFormButton.removeAttribute("disabled");
      $messageFormInput.value = "";
      $messageFormInput.focus();

      if (error) {
        return console.log(error);
      }

      console.log("The message delivered successfully");
    }
  );
  $messageFormInput.value = "";
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("No Access");
  }
  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const data = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit("sendLocation", data, (acknowledge) => {
      $locationButton.removeAttribute("disabled");
      console.log(acknowledge);
    });
  });
});

socket.emit("join", { username, room }, (err) => {
  if (err) {
    alert(err);
    location.href = "/";
  }
});

// const getLatAndLong = async (lat, lng) => {
//   const weathetStack =
//     "http://api.weatherstack.com/current? access_key = 9f24b8a51295334407d06e9b58943394 & query = New York";
// }
