# SmartPrep — AI-Enabled Intelligent Learning System

An AI-powered study platform that generates notes, quizzes, flashcards, study schedules, and provides an AI tutor — all from your uploaded study materials.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  React Frontend │────▶│  Spring Boot     │────▶│  FastAPI AI      │
│  Port 3000      │     │  Port 8080       │     │  Port 8000       │
│  (UI Layer)     │     │  (API + Auth)    │     │  (AI Engine)     │
└─────────────────┘     └───────┬──────────┘     └──────────────────┘
                                │
                        ┌───────▼──────────┐
                        │  H2 In-Memory DB │
                        │  (Auto-created)  │
                        └──────────────────┘
```

| Service | Tech Stack | Port |
|---------|-----------|------|
| **ai-service** | Python 3.10+, FastAPI, NLP | `8000` |
| **backend** | Java 17, Spring Boot, JPA | `8080` |
| **frontend** | React 19, Axios, Recharts | `3000` |

## Features

- **Document Upload** — Extract text from PDF, DOCX, TXT files
- **AI Notes Generator** — Short, Detailed, and Revision notes
- **Quiz Generator** — MCQ quizzes with difficulty levels
- **Flashcard Generator** — Study flashcards from your material
- **AI Tutor** — Context-aware chat tutor (RAG-based)
- **Study Scheduler** — Personalized study plans with exam dates
- **PYQ Analyzer** — Past year question paper analysis
- **Analytics Dashboard** — Weakness detection, score prediction, exam strategies
- **Cognitive Load Monitor** — Fatigue detection and break recommendations

## Prerequisites

Install these before running the project:

| Tool | Version | Download |
|------|---------|----------|
| **Python** | 3.10 or higher | [python.org](https://www.python.org/downloads/) |
| **Java JDK** | 17 or higher | [adoptium.net](https://adoptium.net/temurin/releases/?version=17) |
| **Node.js** | 18 or higher (LTS recommended) | [nodejs.org](https://nodejs.org/) |

## Quick Start

Open **3 separate terminals** and run the following:

### Terminal 1 — AI Service (Port 8000)

```bash
cd ai-service
python -m venv venv

# Windows
.\venv\Scripts\pip.exe install -r requirements.txt
.\venv\Scripts\uvicorn.exe main:app --host 127.0.0.1 --port 8000 --reload

# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 2 — Backend (Port 8080)

```bash
cd backend

# Windows
.\mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

> First run downloads Maven dependencies automatically (~3-5 min).
> Uses H2 in-memory database — no MySQL setup needed.

### Terminal 3 — Frontend (Port 3000)

```bash
cd frontend
npm install
npm start
```

> First run downloads Node dependencies automatically (~2 min).

### Verify

| URL | Expected |
|-----|----------|
| http://127.0.0.1:8000 | `{"status": "healthy"}` |
| http://127.0.0.1:8000/docs | Swagger API docs |
| http://localhost:8080 | Spring Boot running |
| http://localhost:3000 | SmartPrep UI |

## Project Structure

```
SmartPrep/
├── ai-service/                 # Python FastAPI AI Engine
│   ├── main.py                 # API routes & app entry point
│   ├── config.py               # Environment configuration
│   ├── requirements.txt        # Python dependencies
│   ├── services/               # AI service modules
│   │   ├── doc_processor.py    # Document text extraction
│   │   ├── nlp_pipeline.py     # NLP topic extraction
│   │   ├── llm_service.py      # LLM integration layer
│   │   ├── notes_generator.py  # Study notes generation
│   │   ├── quiz_generator.py   # Quiz MCQ generation
│   │   ├── flashcard_generator.py
│   │   ├── ai_tutor.py         # RAG-based AI tutor
│   │   ├── scheduler.py        # Study plan generator
│   │   ├── pyq_analyzer.py     # Past paper analysis
│   │   ├── weakness_analyzer.py
│   │   ├── prediction_engine.py
│   │   ├── strategy_generator.py
│   │   ├── whatif_simulator.py
│   │   └── cognitive_load.py
│   └── tests/
│       └── test_ai_service.py
│
├── backend/                    # Java Spring Boot API
│   ├── pom.xml                 # Maven dependencies
│   ├── mvnw / mvnw.cmd         # Maven wrapper
│   └── src/main/java/com/smartprep/backend/
│       ├── BackendApplication.java
│       ├── config/             # Security & JWT filters
│       ├── controller/         # REST API controllers
│       ├── dto/                # Request/Response DTOs
│       ├── entity/             # JPA database entities
│       ├── repository/         # Spring Data repositories
│       └── service/            # Business logic services
│
├── frontend/                   # React UI
│   ├── package.json            # Node dependencies
│   ├── public/                 # Static assets
│   └── src/
│       ├── App.js              # Main app with routing
│       ├── api/                # Axios HTTP client
│       ├── components/         # Reusable UI components
│       ├── pages/              # Page components
│       ├── context/            # React contexts (Auth, Theme)
│       └── styles/             # CSS stylesheets
│
├── database/                   # SQL schema & seed data
│   ├── schema.sql
│   └── seed-data.sql
│
└── README.md
```

## API Endpoints (AI Service)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/extract-text` | Upload & extract document text |
| `POST` | `/extract-topics` | NLP topic extraction |
| `POST` | `/generate-notes` | Generate study notes |
| `POST` | `/generate-quiz` | Generate MCQ quiz |
| `POST` | `/generate-flashcards` | Generate flashcards |
| `POST` | `/tutor-chat` | AI tutor conversation |
| `POST` | `/generate-schedule` | Create study plan |
| `POST` | `/analyze-pyq` | Analyze past papers |
| `POST` | `/analyze-weakness` | Detect weak topics |
| `POST` | `/predict-readiness` | Predict exam score |
| `POST` | `/generate-strategy` | Exam attempt strategy |
| `POST` | `/simulate-whatif` | What-if score simulation |
| `POST` | `/analyze-cognitive-load` | Fatigue detection |

## Database

The project uses **H2 in-memory database** by default for easy local development. To switch to MySQL:

1. Install MySQL and create a database named `smartprep`
2. Run the SQL files in the `database/` folder
3. Edit `backend/src/main/resources/application.properties` — uncomment MySQL lines and comment H2 lines

## Tech Stack

- **Frontend:** React 19, React Router, Axios, Recharts, Lucide Icons
- **Backend:** Java 17, Spring Boot 3.5, Spring Security, JWT, JPA/Hibernate
- **AI Service:** Python, FastAPI, spaCy, PyMuPDF, Pydantic
- **Database:** H2 (default) / MySQL (production)

## License

This project is for educational purposes.