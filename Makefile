backend:
	docker build -t amo-backend amo-backend/
	docker run -p 8000:8000 amo-backend

frontend:
	docker build -t amo-frontend amo-frontend/
	docker run -p 3000:8000 amo-frontend