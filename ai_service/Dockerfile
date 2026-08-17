FROM python:3.12-slim

# Install system dependencies needed for compiling python packages (like chromadb/hnswlib)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv globally
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh

WORKDIR /app

# Copy dependency files
COPY pyproject.toml .python-version ./

# Install dependencies using uv into the system python (since we are in a container)
RUN uv pip install --system -r pyproject.toml

# Copy application code
COPY ./src /app/src

# Expose FastAPI port
EXPOSE 8000

# Run the FastAPI server
CMD ["uvicorn", "ai_service.main:app", "--host", "0.0.0.0", "--port", "8000"]
