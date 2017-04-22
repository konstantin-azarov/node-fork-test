#!/usr/bin/env python

import os
import subprocess

def create_fifo(fname):
    if os.path.exists(fname):
        os.unlink(fname)
    os.mkfifo(fname)

if __name__ == "__main__":
    stdin_fifo_name = "/tmp/fork-fifo-stdin"
    stdout_fifo_name = "/tmp/fork-fifo-stdout"

    create_fifo(stdin_fifo_name)
    create_fifo(stdout_fifo_name)

    p = subprocess.Popen(
            ["../node/node", "test.js"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE)
    
    assert p.stdout.readline().strip() == ("[PARENT] pid=%d" % p.pid)
    assert p.stdout.readline().startswith("[PARENT] Looked up: ")

    p.stdin.write("fork\n")
    p.stdin.flush()

    s = p.stdout.readline()
    assert s.startswith("[PARENT] forked pid=")

    child_stdin = open(stdin_fifo_name, "w")
    child_stdout = open(stdout_fifo_name, "r")

    assert child_stdout.readline().strip() == "[CHILD] here we are"

    child_stdin.write("cmd\n")
    child_stdin.flush()

    assert child_stdout.readline().strip() == "[CHILD] Command: cmd"
    assert child_stdout.readline().startswith("[CHILD] Looked up: ")

    child_stdin.close()

    assert child_stdout.read() == ""

    p.stdin.write("quit\n")
    p.wait()

    print "OK"

