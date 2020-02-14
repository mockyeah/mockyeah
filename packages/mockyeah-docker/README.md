# mockyeah-docker

A docker image for running the Mockyeah server.

To build the image locally:

```shell
docker build -t mockyeah-docker .
```

Then to run it, here's an example of mounting suites and fixtures directories, and binding to the port:

```shell
docker run --rm \
--mount type=bind,src="$(pwd)/../mockyeah/test/mockyeah",target=/app/mockyeah \
--mount type=bind,src="$(pwd)/../mockyeah/test/fixtures",target=/app/fixtures \
-p 127.0.0.1:4001:4001 \
mockyeah-docker
```

You could also expose the admin port with:

```shell
docker run --rm \
-p 127.0.0.1:4001:4001 \
-p 127.0.0.1:4777:4777 \
mockyeah-docker
```
