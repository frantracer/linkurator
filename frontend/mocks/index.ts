if (typeof window === "undefined") {
  const { server } = require("./server");
  console.log("Running server");
  server.listen();
} else {
  const { worker } = require("./browser");
  console.log("Running browser");
  worker.start();
}

export {};
