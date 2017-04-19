var fork = require("linux-forking");
var dns = require("dns");

process.stdin.resume();
process.stdin.setEncoding("utf8");

console.log("[PARENT] pid=" + process.pid);

function childStdinListener(chunk) {
  var cmd = chunk.toString().trim();
  process.stdout.write("[CHILD] Command: " + chunk + "\n");
  dns.lookup("www.google.com", function(err, address, family) {
    process.stdout.write("Looked up: " + address + "\n");
  });
}

function parentStdinListener(chunk) {
  if (chunk.toString().trim() == "fork") {
    console.log("[PARENT] FORKING");
    var childPid = fork.forkAndReopenStdio(
        "/tmp/child_stdin", "/tmp/child_stdout");

    if (childPid == 0) {
      process.stdin.on("data", childStdinListener);
      process.stdin.removeListener("data", parentStdinListener);
      process.stdout.write("[CHILD] here we are\n");
    } else {
      console.log("[PARENT] forked " + childPid);
    }
  }
}

process.stdin.on("data", parentStdinListener);

process.stdin.on("end", function(chunk) {
});
