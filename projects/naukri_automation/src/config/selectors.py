"""
Naukri.com selectors for different elements
"""
class Selectors:
    """Naukri.com selectors"""
    
    # Login
    LOGIN_BTN = "a:has-text('Login')"
    USERNAME = "input#usernameField, input[name='username']"
    PASSWORD = "input#passwordField, input[name='password']"
    SUBMIT_BTN = "button[type='submit']"
    
    # Search
    SEARCH_INPUT = "input[title='Search'], input.search-job, input[placeholder*='Search']"
    LOCATION_INPUT = "input[title='Location'], input.location, input[placeholder*='Location']"
    SEARCH_BTN = "button[type='submit']"
    
    # Job listings
    JOB_CARD = "article.jobTuple, .jobCard, .job-list-card, .job-result-card"
    JOB_TITLE = ".title a, .job-title, h2 a"
    COMPANY_NAME = ".subTitle, .company, .job-company"
    JOB_LOCATION = ".loc, .location, .job-location"
    JOB_LINK = "a"
    
    # Application
    APPLY_BTN = "button:has-text('Apply')"
    VIEW_APPLY_BTN = "button:has-text('View & Apply')"
    QUICK_APPLY = ".quickApplyBtn"
    
    # Form
    TEXT_INPUT = "input[type='text'], input:not([type])"
    FILE_INPUT = "input[type='file']"
    SUBMIT_APPLY = "button:has-text('Submit'), button:has-text('Submit Application'), button:has-text('Finish')"
    
    # Popups
    POPUP = ".popup, .modal, .dialog"
    CLOSE_POPUP = ".crossIcon, .close, .modal-close"