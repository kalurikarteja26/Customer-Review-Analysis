FROM python:3.10-slim

WORKDIR /app

# --- CRITICAL FIX: Install Node.js ---
RUN apt-get update && \
    apt-get install -y nodejs npm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend /app/backend

# Set environment variables
ENV PYTHONPATH=/app

# Expose port (Render overrides this with $PORT)
EXPOSE 5000

# Run FastAPI using Render's dynamic port
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-5000}"]
