var fork = require("linux-forking");
var dns = require("dns");

process.stdin.resume();
process.stdin.setEncoding("utf8");

console.log("[PARENT] pid=" + process.pid);
dns.lookup("www.google.com", function(err, address, family) {
  process.stdout.write("[PARENT] Looked up: " + address + "\n");
  process.stdin.on("data", parentStdinListener);
});

process.stdin.on("end", function(chunk) {
});

function childStdinListener(chunk) {
  var cmd = chunk.toString().trim();
  process.stdout.write("[CHILD] Command: " + cmd + "\n");
  dns.lookup("www.google.com", function(err, address, family) {
    process.stdout.write("[CHILD] Looked up: " + address + "\n");
  });
}

function parentStdinListener(chunk) {
  var cmd = chunk.toString().trim();
  if (cmd == "fork") {
    var childPid = fork.forkAndReopenStdio(
        "/tmp/fork-fifo-stdin", "/tmp/fork-fifo-stdout");

    if (childPid == 0) {
      process.stdin.on("data", childStdinListener);
      process.stdin.removeListener("data", parentStdinListener);
      process.stdin.on("end", function() {
        process.exit(0);
      });
      process.stdout.write("[CHILD] here we are\n");
    } else {
      console.log("[PARENT] forked pid=" + childPid);
    }
  } else if (cmd == "quit") {
    process.exit(0);
  }
}


