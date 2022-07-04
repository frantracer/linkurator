import {server} from "./server";
import {worker} from "./browser";

const ENABLE_MOCKS = false;

if (ENABLE_MOCKS) {
  if (typeof window === "undefined") {
    const {server} = require("./server");
    server.listen({onUnhandledRequest: "bypass"});
    console.log("Server started");
  } else {
    const {worker} = require("./browser");
    worker.start({onUnhandledRequest: "bypass"});
    console.log("Worker started");
  }
}

export {};
