(function () {
  function send(event) {
    fetch("http://localhost:4000/log-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  }

  //   // Track page views
  //   send({ type: "page-view", url: window.location.href });

  // Track button clicks
  document.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      send({ type: "click", text: e.target.innerText });
    }
  });
})();
