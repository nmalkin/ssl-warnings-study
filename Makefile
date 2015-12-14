appname = warning_server

.PHONY: clean run

all: build run

build:
	docker build -t $(appname) .

clean:
	docker rmi $(appname)

stop:
	docker kill $(appname) && docker rm $(appname)

logs:
	docker logs -f $(appname)

run:
	docker run -d --name $(appname) \
		-p 80:80 \
		-p 443:443
		$(appname)
