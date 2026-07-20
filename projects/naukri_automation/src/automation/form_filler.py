"""
Form filling for Naukri.com applications
"""
from src.browser.browser_manager import BrowserManager
import logging
import time

logger = logging.getLogger(__name__)

class FormFiller:
    """Handles form filling for Naukri job applications"""
    
    def __init__(self, browser: BrowserManager):
        self.browser = browser
        self.page = browser.page
    
    def fill_and_submit(self) -> bool:
        """Fill the application form and submit"""
        try:
            logger.info("📝 Filling application form...")
            self.browser.human_delay(2, 3)
            
            # Handle popup questions
            self._handle_popup_questions()
            
            # Fill text inputs
            self._fill_text_inputs()
            
            # Fill dropdowns
            self._fill_dropdowns()
            
            # Fill radio buttons
            self._fill_radios()
            
            # Upload resume if needed
            self._upload_resume()
            
            # Submit application
            self._submit_application()
            
            return True
            
        except Exception as e:
            logger.error(f"Form filling failed: {str(e)}")
            return False
    
    def _handle_popup_questions(self):
        """Handle popup questions in application form"""
        try:
            # Look for common popup questions
            popups = self.page.locator(".popup, .modal, .dialog").all()
            
            for popup in popups:
                if popup.is_visible():
                    # Handle salary expectations
                    salary_input = popup.locator("input[placeholder*='salary'], input[placeholder*='expectation']").first
                    if salary_input.count():
                        salary_input.fill("10-15 LPA")
                        self.browser.human_delay(0.5, 1)
                    
                    # Handle notice period
                    notice_input = popup.locator("input[placeholder*='notice']").first
                    if notice_input.count():
                        notice_input.fill("30 days")
                        self.browser.human_delay(0.5, 1)
                    
                    # Click next/continue
                    next_btn = popup.locator("button:has-text('Next'), button:has-text('Continue'), button:has-text('Save')").first
                    if next_btn.count():
                        next_btn.click()
                        self.browser.human_delay(1, 2)
                        
        except Exception as e:
            logger.warning(f"Popup handling warning: {str(e)}")
    
    def _fill_text_inputs(self):
        """Fill text input fields"""
        try:
            # Find all visible text inputs
            inputs = self.page.locator("input[type='text'], input:not([type])").all()
            
            for inp in inputs:
                if inp.is_visible() and not inp.is_disabled():
                    placeholder = inp.get_attribute("placeholder") or ""
                    name = inp.get_attribute("name") or ""
                    value = inp.get_attribute("value") or ""
                    
                    if not value:  # Only fill if empty
                        if "experience" in placeholder.lower() or "exp" in name.lower():
                            inp.fill("3-5 years")
                        elif "salary" in placeholder.lower():
                            inp.fill("10-15 LPA")
                        elif "notice" in placeholder.lower():
                            inp.fill("30 days")
                        elif "location" in placeholder.lower():
                            inp.fill("Bangalore")
                    
                    self.browser.human_delay(0.3, 0.8)
                    
        except Exception as e:
            logger.warning(f"Text input fill warning: {str(e)}")
    
    def _fill_dropdowns(self):
        """Fill dropdown/select fields"""
        try:
            selects = self.page.locator("select").all()
            
            for select in selects:
                if select.is_visible():
                    options = select.locator("option").all()
                    for opt in options:
                        text = opt.text_content().lower() if opt.count() else ""
                        if "experienced" in text or "3-5" in text or "yes" in text:
                            opt.click()
                            break
                        elif text and "select" not in text:
                            opt.click()
                            break
                    self.browser.human_delay(0.5, 1)
                    
        except Exception as e:
            logger.warning(f"Dropdown fill warning: {str(e)}")
    
    def _fill_radios(self):
        """Fill radio button fields"""
        try:
            radios = self.page.locator("input[type='radio']").all()
            
            for radio in radios:
                if radio.is_visible() and not radio.is_checked():
                    value = radio.get_attribute("value") or ""
                    if "yes" in value.lower() or "available" in value.lower():
                        radio.click()
                    elif "experienced" in value.lower():
                        radio.click()
                    self.browser.human_delay(0.3, 0.8)
                    
        except Exception as e:
            logger.warning(f"Radio fill warning: {str(e)}")
    
    def _upload_resume(self):
        """Upload resume file"""
        try:
            file_input = self.page.locator("input[type='file']").first
            if file_input.count():
                # Use resume from profile
                resume_path = "./resume.pdf"
                file_input.set_input_files(resume_path)
                logger.info("📄 Resume uploaded")
                self.browser.human_delay(2, 3)
        except Exception as e:
            logger.warning(f"Resume upload warning: {str(e)}")
    
    def _submit_application(self):
        """Submit the application"""
        try:
            submit_selectors = [
                "button:has-text('Submit')",
                "button:has-text('Apply')",
                "button:has-text('Finish')",
                "button:has-text('Submit Application')",
                "input[value='Submit']",
                ".submit-btn"
            ]
            
            for selector in submit_selectors:
                submit_btn = self.page.locator(selector).first
                if submit_btn.count() and submit_btn.is_visible():
                    submit_btn.click()
                    self.browser.human_delay(3, 5)
                    logger.info("✅ Application submitted")
                    return
            
            logger.warning("Submit button not found")
            
        except Exception as e:
            logger.error(f"Submit failed: {str(e)}")