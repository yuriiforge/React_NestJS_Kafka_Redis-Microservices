dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

build:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

infra:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d zookeeper kafka kafka-init kafka-ui postgres redis elasticsearch

stop:
	docker-compose stop

down:
	docker-compose down

clean:
	docker-compose down -v

logs:
	docker-compose logs -f $(s)

restart:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build $(s)
