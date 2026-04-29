FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend /app/backend

# Set environment
ENV PYTHONPATH=/app
ENV SCRAPER_URL=http://scraper:3000

# Expose FastAPI port
EXPOSE 5000

# Run FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "5000"]
