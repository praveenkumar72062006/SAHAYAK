# Configuration file for the application
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    """Application configuration"""
    DEBUG = True
    BASE_DIR = BASE_DIR
    JOBS_FILE = os.path.join(BASE_DIR, "data", "jobs.json")
    #MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2" #Multilingual model
    MODEL_NAME = "all-MiniLM-L6-v2" # English only model
    MAX_SEARCH_RESULTS = 10
