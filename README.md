# Image Recognition Product System

A full-stack app for storing product images and recognizing products from camera scans using perceptual image hashing.

## Folder Structure

- `backend/` Flask + SQLite + image hashing API
- `frontend/` React + Tailwind + GSAP UI

## Backend Setup

1. Create virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run backend:
   ```bash
   python app.py
   ```

Backend runs on `http://localhost:5000`.

## Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Run app:
   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:5173`.

## API Endpoints

- `POST /add-product`
  - Form fields: `name`, `description`, `price`, optional `category`, `sku`, `metadata` (JSON string)
  - Multiple files: `images`
- `POST /scan-image`
  - File field: `image`
  - Returns best match if hash distance is within threshold.
- `GET /get-products`
  - Returns all products with associated image paths.

## Dependencies

### Backend
- Flask
- Flask-Cors
- SQLAlchemy
- Pillow
- ImageHash
- python-dotenv

### Frontend
- React
- React Router
- Axios
- Tailwind CSS
- GSAP
- Vite

## Notes

- Matching uses perceptual hash distance with configurable threshold in `backend/config.py` (`HASH_THRESHOLD`).
- Uploaded images are stored under `backend/uploads/`.
