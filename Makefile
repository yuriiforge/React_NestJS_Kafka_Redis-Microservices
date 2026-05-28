dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

build:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

stop:
	docker-compose stop

down:
	docker-compose down

clean:
	docker-compose down -v
