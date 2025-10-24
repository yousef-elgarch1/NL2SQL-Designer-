# NL2SQL Generator - Setup Guide

## 🚀 Quick Start

### Prerequisites

Before starting, ensure you have:

- **Python 3.11+** installed
- **Node.js 18+** installed
- **Docker Desktop** installed (for Windows)
- **Git** installed
- **48GB+ RAM** (for Llama 3.1 70B) OR **16GB+ RAM** (for Llama 3.1 8B)

---

## Step 1: Install Ollama (REQUIRED)

Ollama is needed to run the LLM locally.

### Windows Installation:

1. Download Ollama from: https://ollama.com/download
2. Run the installer
3. Verify installation:
   ```bash
   ollama --version
   ```

### Pull the LLM Model:

**Option A: Llama 3.1 70B (Recommended, requires 48GB+ RAM)**
```bash
ollama pull llama3.1:70b
```

**Option B: Llama 3.1 8B (Faster, requires 16GB+ RAM)**
```bash
ollama pull llama3.1:8b
```

### Verify Ollama is Running:
```bash
ollama list
```

You should see your downloaded model listed.

---

## Step 2: Backend Setup

### Navigate to backend directory:
```bash
cd backend
```

### Create virtual environment:
```bash
python -m venv venv
```

### Activate virtual environment:
**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### Install dependencies:
```bash
pip install -r requirements.txt
```

### Create .env file:
```bash
copy .env.example .env
```

Edit `.env` and update:
- `OLLAMA_MODEL_PRIMARY` (set to `llama3.1:70b` or `llama3.1:8b`)
- Other settings as needed

### Test backend:
```bash
python main.py
```

Visit: http://localhost:8000
You should see: `{"status":"online","message":"NL2SQL Generator API is running"}`

---

## Step 3: Frontend Setup

### Open a NEW terminal and navigate to frontend:
```bash
cd frontend
```

### Install dependencies:
```bash
npm install
```

### Create .env file:
```bash
copy .env.example .env
```

### Run frontend:
```bash
npm run dev
```

Visit: http://localhost:3000

---

## Step 4: Docker Setup (Alternative)

If you prefer Docker:

### Create .env files first:
```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### Build and run:
```bash
docker-compose up --build
```

**Note:** You still need Ollama running on your host machine!

---

## Troubleshooting

### Ollama Connection Issues:

1. Check Ollama is running:
   ```bash
   ollama list
   ```

2. Test Ollama API:
   ```bash
   curl http://localhost:11434/api/generate -d "{\"model\":\"llama3.1:8b\",\"prompt\":\"Hello\"}"
   ```

### Backend Import Errors:

Make sure you're in the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### Frontend Connection Issues:

Check that `VITE_API_BASE_URL` in `frontend/.env` points to `http://localhost:8000/api/v1`

---

## What's Next?

Once setup is complete, you'll implement the project in phases:

- **Phase 1**: Prompt validation + Diagram generation + SQL generation
- **Phase 2**: Interactive editing
- **Phase 3**: Database execution
- **Phase 4**: Export features

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for details.
