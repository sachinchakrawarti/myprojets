"""
Configuration settings for Naukri automation
"""
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

class Config:
    """Configuration class"""
    
    # Naukri credentials
    NAUKRI_EMAIL = os.getenv("NAUKRI_EMAIL", "")
    NAUKRI_PASSWORD = os.getenv("NAUKRI_PASSWORD", "")
    
    # Job preferences
    JOB_KEYWORDS = os.getenv("JOB_KEYWORDS", "Python Developer").split(",")
    JOB_KEYWORDS = [kw.strip() for kw in JOB_KEYWORDS]
    
    JOB_LOCATION = os.getenv("JOB_LOCATION", "India").split(",")
    JOB_LOCATION = [loc.strip() for loc in JOB_LOCATION]
    
    EXCLUDE_KEYWORDS = os.getenv("EXCLUDE_KEYWORDS", "senior,lead,manager").split(",")
    EXCLUDE_KEYWORDS = [kw.strip().lower() for kw in EXCLUDE_KEYWORDS]
    
    MAX_APPLICATIONS = int(os.getenv("MAX_APPLICATIONS", 20))
    
    # Browser settings
    HEADLESS = os.getenv("HEADLESS", "false").lower() == "true"
    USER_DATA_DIR = os.getenv("USER_DATA_DIR", "./browser_data")
    
    # Report settings
    REPORT_DIR = os.getenv("REPORT_DIR", "./reports")
    
    # Paths
    BASE_DIR = Path(__file__).parent.parent.parent
    LOG_DIR = BASE_DIR / "logs"
    PROFILE_DIR = BASE_DIR / "profiles"