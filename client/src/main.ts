import './app.css'
import App from './App.svelte'
import {serviceWorkerUrl} from "./lib/serviceWorkerUrl.js";

// register service worker at app startup
try {
  navigator.serviceWorker?.addEventListener('message', m => console.log('Message from SW:', m.data))
  navigator.serviceWorker?.getRegistration(serviceWorkerUrl).then(registration => {
    console.log("Service worker:", registration ? 'registered' : 'not yet registered')
    if (registration === undefined) // register if it hasn't already been registered
      navigator.serviceWorker.register(serviceWorkerUrl).then(r => {
        console.log("Service worker registered", r.scope, r.active?.scriptURL, r.active?.state, r.installing?.state, r.waiting?.state)
      })
    else return registration.update()
  })
}catch (e) {
  // prevent a failure with the service worker from crashing the whole site
  console.log(e, 'Failed to setup service worker')
}

const app = new App({
  target: document.getElementById('app')
})

export default app
