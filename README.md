# soft-archi

## Project Commands

### Backend (Docker)

To restart the backend service (necessary after adding new modules/controllers):

```bash
docker-compose restart backend
```

If you need to rebuild the backend (e.g., after installing new packages):

```bash
docker-compose up -d --build backend
```

To view logs:

```bash
docker-compose logs -f backend
```

### Frontend

To start the frontend development server:

```bash
cd frontend
npm run dev
```

## Testing

### Backend

To run unit tests:

```bash
cd backend
npm test
```

To run E2E tests:

```bash
cd backend
npm run test:e2e
```
