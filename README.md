Node.Js forking tests. To setup:

    mkdir node-forking
    cd node-forking

    git clone https://github.com/Asana/node
    git clone https://github.com/Asana/node-linux-fork.git
    git clone https://github.com/Asana/node-forking-test

    cd node
    git checkout v6.10.2-forking
    ./configure
    make -j4

    cd ../node-linux-fork
    git checkout v0.0.2

    cd ../node-forking-test
    npm install ../node-forking-test --nodedir=$PWD/../node

    ./test_driver.py


Note that forking doesn't work properly if the parent process detects a TTY (in
this case forked process will use the same TTY for input/output and not the
fifos).
