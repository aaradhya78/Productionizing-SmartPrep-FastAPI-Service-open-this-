import os
from dotenv import load_dotenv

load_dotenv()

# Server Settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# LLM Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", None)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", None)

# Ollama Settings
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# General Settings
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
SPACY_MODEL = os.getenv("SPACY_MODEL", "en_core_web_sm")
