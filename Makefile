appname = app

.PHONY: clean run

all: build run

run:
	docker run -it --rm --name $(appname) \
		-p 8080:8080 \
		$(appname)

build:
	docker build -t $(appname) .

clean:
	docker rmi $(appname)
