self.addEventListener("push", e => {
    const data = e.data.json()

    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "https://d2cy1obokpvee9.cloudfront.net/manifest/favicon-196x196.png"
    });
});