# IMovies

A responsive movie ticket reservation application built from the supplied SkillWallet project brief. React handles browsing and seat selection; Express, MongoDB, and Mongoose handle accounts, showtimes, and bookings.

## Run on this laptop

Open PowerShell in `C:\MOVIES\IMovies` and run:

```powershell
.\Start-IMovies.ps1
```

Open **http://127.0.0.1:4100** once the server is ready. The launcher builds the frontend and starts Express. Node.js is available through the Codex bundled runtime on this laptop. On another computer, install Node.js 20.19+ (or 22.12+) and run `npm ci` first.

For development: `npm run dev` (frontend http://127.0.0.1:5174, API port 4100). Alternatively, run `.\Start-IMovies.ps1 -Development` using the bundled runtime.

## What works

- Six original fictional movie listings with locally rendered poster artwork.
- Search, genre and language filters, movie descriptions, seven days of showtimes across three demo cinemas in Mumbai.
- Registration, bcrypt password hashes, JWT authentication, rate limits, and user-specific booking history.
- An 80-seat map per show, up to eight seats per reservation, and availability refreshed every five seconds.
- Atomic MongoDB seat allocation: competing requests for the same seats cannot both succeed.
- Server-calculated ticket prices and an 8% booking fee; booking reference and confirmation ticket.
- Booking cancellation releases seats, with ownership checks and confirmation.
- Responsive layouts, labelled form controls, keyboard focus management, and reduced motion support.

## Data and demo mode

With no `MONGODB_URI`, the app starts a real temporary MongoDB process using `mongodb-memory-server`. It may download a MongoDB binary on first use. **Accounts, bookings, and availability reset when the server stops.** Register any demo account; no default password is provided. The JWT secret is generated per demo session.

For durable data, copy `.env.example` to `.env`, set `MONGODB_URI` to your MongoDB connection string and `JWT_SECRET` to a random value of at least 32 characters. Movie/show data seeds only when the movie collection is empty. Sample shows cover the seven days beginning with initial seeding; add future shows or refresh demo data for later use.

All movies, cinemas, ratings, artwork, and availability are illustrative. Reservations do not charge money, send email, or integrate with real cinemas. Google Fonts is optional; system fonts work offline. No payment gateway or administration UI is included.

## Verification

```powershell
npm test
npm run build
```

Tests use an isolated temporary MongoDB database and cover invalid registration, login, duplicate accounts, booking ownership, malformed seats, price tampering, simultaneous seat requests, cancellation, and rebooking.

## Architecture

- `src/`: React interface and responsive CSS.
- `server/models.js`: User, Movie, Show, and Booking models.
- `server/app.js`: REST API with validation and authentication.
- `server/seed.js`: fictional sample catalog and showtimes.
- `server/index.js`: database connection, seeding, and production serving.

The occupied-seat update is atomic within the Show document. A failed booking insert releases seats as compensation. For a production system spanning multiple server processes, use MongoDB transactions for booking creation/cancellation and seat changes, add expiring seat holds, payments, monitoring, stronger operational recovery, and production security configuration before accepting real reservations.

This project is saved locally and tracked in Git. No public deployment or GitHub repository has been created.
