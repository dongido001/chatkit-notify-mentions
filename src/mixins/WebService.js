export default {
    methods: {
        urlBase64ToUint8Array(base64String) {
            const padding = "=".repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
              .replace(/-/g, "+")
              .replace(/_/g, "/");
          
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
          
            for (let i = 0; i < rawData.length; ++i) {
              outputArray[i] = rawData.charCodeAt(i);
            }

            return outputArray;
        },
        async registerWebPushService() {
            const publicVapidKey = process.env.VUE_APP_publicVapidKey;
    
            // Register Service Worker
            const register = await navigator.serviceWorker.register("/worker.js", {
                scope: "/"
            });
            var serviceWorker;
            if (register.installing) {
                serviceWorker = register.installing;
            } else if (register.waiting) {
                serviceWorker = register.waiting;
            } else if (register.active) {
                serviceWorker = register.active;
            }
    
            if (serviceWorker) {
                serviceWorker.addEventListener("statechange", async (e) => {
                    if (e.target.state == "activated") {
                        // use pushManger for subscribing here.
                        register.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
                        })
                        .then(r => console.log(r))
                        .catch(e => console.log(e.message))
        
                        const subscription = await register.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
                        });
                    
                        // Send Push Notification
                        await fetch(`${process.env.VUE_APP_SERVER}/subscribe`, {
                            method: "POST",
                            body: JSON.stringify({subscription:subscription, userId: this.currentUser.id}),
                            headers: {
                                "content-type": "application/json"
                            }
                        });
                    }
                });
            }
        
        }
    },
}