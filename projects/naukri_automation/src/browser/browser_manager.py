"""
Playwright Browser Manager for Naukri.com
"""
from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page
import logging
import random
import time
from typing import Optional

logger = logging.getLogger(__name__)

class BrowserManager:
    """Manages browser instance for Naukri automation"""
    
    def __init__(self, headless: bool = False, user_data_dir: str = "./browser_data"):
        self.headless = headless
        self.user_data_dir = user_data_dir
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        
    def start(self) -> bool:
        """Start browser with anti-detection"""
        try:
            logger.info("Starting browser...")
            self.playwright = sync_playwright().start()
            
            # Launch browser
            self.browser = self.playwright.chromium.launch(
                headless=self.headless,
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                ],
                user_data_dir=self.user_data_dir
            )
            
            # Create context
            self.context = self.browser.new_context(
                viewport={'width': 1366, 'height': 768},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                locale='en-US',
                timezone_id='Asia/Kolkata',
                extra_http_headers={
                    'Accept-Language': 'en-US,en;q=0.9',
                    'DNT': '1',
                    'Upgrade-Insecure-Requests': '1'
                }
            )
            
            # Create page
            self.page = self.context.new_page()
            
            # Anti-detection script
            self.page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
                Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            """)
            
            logger.info("Browser started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start browser: {str(e)}")
            return False
    
    def close(self):
        """Close browser"""
        try:
            if self.page:
                self.page.close()
            if self.context:
                self.context.close()
            if self.browser:
                self.browser.close()
            if self.playwright:
                self.playwright.stop()
            logger.info("Browser closed")
        except Exception as e:
            logger.error(f"Error closing browser: {str(e)}")
    
    def human_delay(self, min_sec: float = 0.5, max_sec: float = 2.0):
        """Human-like delay"""
        time.sleep(random.uniform(min_sec, max_sec))
    
    def wait_for_element(self, selector: str, timeout: int = 10000) -> bool:
        """Wait for element to appear"""
        try:
            self.page.wait_for_selector(selector, timeout=timeout)
            return True
        except:
            return False