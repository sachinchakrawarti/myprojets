"""
Naukri.com Job Application Automation
"""
from playwright.sync_api import Page, expect
import logging
import time
import re
from datetime import datetime
from typing import List, Dict, Any

from src.browser.browser_manager import BrowserManager
from src.automation.form_filler import FormFiller
from src.config.settings import Config
from src.utils.file_handler import load_user_profile

logger = logging.getLogger(__name__)

class NaukriApplier:
    """Handles Naukri.com job search and application"""
    
    def __init__(self, browser: BrowserManager):
        self.browser = browser
        self.page = browser.page
        self.form_filler = FormFiller(browser)
        self.profile = load_user_profile()
        
        # Statistics
        self.applied_jobs = []
        self.skipped_jobs = []
        self.failed_jobs = []
        self.jobs_found = []
        self.total_applied = 0
        self.max_applications = Config.MAX_APPLICATIONS
        
        # Naukri selectors
        self.selectors = {
            'login_btn': "a:has-text('Login')",
            'username': "input#usernameField, input[name='username']",
            'password': "input#passwordField, input[name='password']",
            'submit_btn': "button[type='submit']",
            'search_input': "input[title='Search'], input.search-job",
            'location_input': "input[title='Location'], input.location",
            'search_btn': "button[type='submit']",
            'job_card': "article.jobTuple, .jobCard, .job-list-card",
            'job_title': ".title a, .job-title, h2 a",
            'company_name': ".subTitle, .company, .job-company",
            'job_location': ".loc, .location, .job-location",
            'apply_btn': "button:has-text('Apply')",
            'view_btn': "button:has-text('View & Apply')",
            'quick_apply': ".quickApplyBtn",
        }
    
    def login(self) -> bool:
        """Login to Naukri.com"""
        try:
            logger.info("🔐 Logging into Naukri.com...")
            
            # Navigate to Naukri
            self.page.goto("https://www.naukri.com/", wait_until="domcontentloaded")
            self.browser.human_delay(2, 3)
            
            # Click login button
            login_btn = self.page.locator(self.selectors['login_btn']).first
            if login_btn.count():
                login_btn.click()
                self.browser.human_delay(2, 3)
            
            # Enter username
            username_field = self.page.locator(self.selectors['username']).first
            if username_field.count():
                username_field.fill(Config.NAUKRI_EMAIL)
                self.browser.human_delay(1, 2)
            else:
                logger.error("Username field not found")
                return False
            
            # Enter password
            password_field = self.page.locator(self.selectors['password']).first
            if password_field.count():
                password_field.fill(Config.NAUKRI_PASSWORD)
                self.browser.human_delay(1, 2)
            else:
                logger.error("Password field not found")
                return False
            
            # Submit
            submit_btn = self.page.locator(self.selectors['submit_btn']).first
            if submit_btn.count():
                submit_btn.click()
                self.browser.human_delay(3, 5)
                logger.info("✅ Login successful")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            return False
    
    def search_jobs(self) -> List[Dict]:
        """Search for jobs on Naukri"""
        try:
            logger.info(f"🔍 Searching jobs: {Config.JOB_KEYWORDS} at {Config.JOB_LOCATION}")
            
            # Navigate to search page
            self.page.goto("https://www.naukri.com/", wait_until="domcontentloaded")
            self.browser.human_delay(2, 3)
            
            # Handle popup if appears
            try:
                popup_close = self.page.locator(".crossIcon, .close").first
                if popup_close.count():
                    popup_close.click()
                    self.browser.human_delay(1, 2)
            except:
                pass
            
            # Enter keywords
            search_input = self.page.locator(self.selectors['search_input']).first
            if search_input.count():
                keywords = ", ".join(Config.JOB_KEYWORDS)
                search_input.fill(keywords)
                self.browser.human_delay(1, 2)
            else:
                logger.warning("Search input not found")
            
            # Enter location
            location_input = self.page.locator(self.selectors['location_input']).first
            if location_input.count():
                location_input.fill(Config.JOB_LOCATION[0] if isinstance(Config.JOB_LOCATION, list) else Config.JOB_LOCATION)
                self.browser.human_delay(1, 2)
            else:
                logger.warning("Location input not found")
            
            # Click search
            search_btn = self.page.locator(self.selectors['search_btn']).first
            if search_btn.count():
                search_btn.click()
                self.browser.human_delay(3, 5)
            else:
                logger.warning("Search button not found")
            
            # Extract job listings
            jobs = self._extract_jobs()
            self.jobs_found = jobs
            logger.info(f"📊 Found {len(jobs)} jobs")
            return jobs
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return []
    
    def _extract_jobs(self) -> List[Dict]:
        """Extract job details from search results"""
        jobs = []
        try:
            # Wait for results
            self.page.wait_for_selector(self.selectors['job_card'], timeout=15000)
            
            # Get all job cards
            cards = self.page.locator(self.selectors['job_card']).all()
            logger.info(f"Found {len(cards)} job cards")
            
            for card in cards:
                try:
                    # Extract job details
                    title_elem = card.locator(self.selectors['job_title']).first
                    company_elem = card.locator(self.selectors['company_name']).first
                    location_elem = card.locator(self.selectors['job_location']).first
                    
                    title = title_elem.text_content().strip() if title_elem.count() else "Unknown"
                    company = company_elem.text_content().strip() if company_elem.count() else "Unknown"
                    location = location_elem.text_content().strip() if location_elem.count() else "Unknown"
                    
                    # Get apply link
                    link_elem = card.locator("a").first
                    link = link_elem.get_attribute("href") if link_elem.count() else ""
                    
                    # Check if job should be excluded
                    exclude = False
                    for keyword in Config.EXCLUDE_KEYWORDS:
                        if keyword.lower() in title.lower():
                            exclude = True
                            break
                    
                    if exclude:
                        continue
                    
                    job_data = {
                        'title': title,
                        'company': company,
                        'location': location,
                        'link': link,
                        'status': 'found'
                    }
                    jobs.append(job_data)
                    
                except Exception as e:
                    logger.warning(f"Could not parse job card: {str(e)}")
                    continue
            
        except Exception as e:
            logger.error(f"Job extraction failed: {str(e)}")
        
        return jobs
    
    def apply_to_job(self, job: Dict) -> bool:
        """Apply to a single job"""
        try:
            logger.info(f"📝 Applying: {job['title']} at {job['company']}")
            
            # Navigate to job
            if job.get('link'):
                self.page.goto(job['link'], wait_until="domcontentloaded")
                self.browser.human_delay(2, 4)
            
            # Check if already applied
            page_text = self.page.text_content().lower()
            if "already applied" in page_text or "application submitted" in page_text:
                logger.info(f"⏭️ Already applied to {job['title']}")
                job['status'] = 'already_applied'
                self.skipped_jobs.append(job)
                return False
            
            # Find apply button
            apply_btn = self.page.locator(self.selectors['apply_btn']).first
            if not apply_btn.count():
                apply_btn = self.page.locator(self.selectors['view_btn']).first
            
            if not apply_btn.count():
                logger.warning(f"No apply button found for {job['title']}")
                job['status'] = 'no_apply_button'
                self.skipped_jobs.append(job)
                return False
            
            # Check if external site
            btn_text = apply_btn.text_content().lower() if apply_btn.count() else ""
            if "company site" in btn_text or "external" in btn_text:
                logger.info(f"⏭️ External application: {job['title']}")
                job['status'] = 'external_site'
                self.skipped_jobs.append(job)
                return False
            
            # Click apply
            apply_btn.click()
            self.browser.human_delay(2, 4)
            
            # Fill and submit form
            if self.form_filler.fill_and_submit():
                job['status'] = 'applied'
                job['applied_at'] = datetime.now().isoformat()
                self.applied_jobs.append(job)
                self.total_applied += 1
                logger.info(f"✅ Applied: {job['title']}")
                return True
            else:
                job['status'] = 'form_failed'
                self.failed_jobs.append(job)
                return False
            
        except Exception as e:
            logger.error(f"Application failed: {str(e)}")
            job['status'] = 'error'
            job['error'] = str(e)
            self.failed_jobs.append(job)
            return False
    
    def run(self) -> Dict[str, Any]:
        """Run complete automation workflow"""
        logger.info("=" * 60)
        logger.info("🚀 Starting Naukri.com Job Automation")
        logger.info("=" * 60)
        
        # Login
        if not self.login():
            logger.error("❌ Login failed - stopping automation")
            return self.generate_report()
        
        # Search jobs
        jobs = self.search_jobs()
        
        if not jobs:
            logger.warning("No jobs found")
            return self.generate_report()
        
        # Apply to jobs
        applied_count = 0
        for job in jobs:
            if applied_count >= self.max_applications:
                logger.info(f"📊 Reached daily limit: {self.max_applications}")
                break
            
            self.apply_to_job(job)
            applied_count += 1
            self.browser.human_delay(3, 6)  # Delay between applications
        
        return self.generate_report()
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate automation report"""
        total_found = len(self.jobs_found)
        total_processed = len(self.applied_jobs) + len(self.skipped_jobs) + len(self.failed_jobs)
        
        report = {
            "platform": "Naukri.com",
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_found": total_found,
                "total_processed": total_processed,
                "applied": len(self.applied_jobs),
                "skipped": len(self.skipped_jobs),
                "failed": len(self.failed_jobs),
                "limit_reached": self.total_applied >= self.max_applications
            },
            "applied_jobs": self.applied_jobs,
            "skipped_jobs": self.skipped_jobs,
            "failed_jobs": self.failed_jobs
        }
        
        logger.info("=" * 60)
        logger.info("📊 Report Summary")
        logger.info(f"   Applied: {report['summary']['applied']}")
        logger.info(f"   Skipped: {report['summary']['skipped']}")
        logger.info(f"   Failed: {report['summary']['failed']}")
        logger.info("=" * 60)
        
        return report