"""
Handler for recruiter questions during job application
"""
import logging
import time
from typing import Dict, Any

logger = logging.getLogger(__name__)

class QuestionHandler:
    """Handles recruiter questions during application"""
    
    def __init__(self, browser):
        self.browser = browser
        self.page = browser.page
        
        # Default answers for common questions
        self.default_answers = {
            'current_ctc': "8-10 LPA",
            'expected_ctc': "15-20 LPA",
            'notice_period': "30 days",
            'current_location': "Bangalore",
            'experience': "3-5 years",
            'reason_for_change': "Looking for better growth opportunities",
            'available_to_join': "Immediately",
            'work_authorization': "Indian Citizen",
            'highest_education': "M.Tech",
            'year_of_passing': "2026",
            'gender': "Male",
            'date_of_birth': "2001-03-20",
            'languages_known': "English, Hindi",
            'skills': "Python, Java, React, Spring Boot, MongoDB, PostgreSQL"
        }
    
    def handle_questions(self) -> bool:
        """Handle all recruiter questions on the page"""
        try:
            logger.info("📋 Checking for recruiter questions...")
            
            # Check if there are questions to answer
            if not self._has_questions():
                logger.info("ℹ️ No recruiter questions found")
                return True
            
            # Handle all questions
            questions_answered = 0
            
            # 1. Handle CTC questions
            if self._handle_ctc_questions():
                questions_answered += 1
            
            # 2. Handle text input questions
            if self._handle_text_questions():
                questions_answered += 1
            
            # 3. Handle dropdown questions
            if self._handle_dropdown_questions():
                questions_answered += 1
            
            # 4. Handle radio button questions
            if self._handle_radio_questions():
                questions_answered += 1
            
            # 5. Handle checkbox questions
            if self._handle_checkbox_questions():
                questions_answered += 1
            
            # 6. Handle any "Skip" or "I'll do it later" options
            self._handle_skip_options()
            
            logger.info(f"✅ Handled {questions_answered} question groups")
            return True
            
        except Exception as e:
            logger.error(f"Error handling questions: {str(e)}")
            return False
    
    def _has_questions(self) -> bool:
        """Check if there are questions to answer"""
        try:
            # Check for question indicators
            question_indicators = [
                "question",
                "please answer",
                "recruiter's question",
                "required field",
                "current ctc",
                "expected ctc",
                "notice period",
                "experience",
                "salary",
                "employment"
            ]
            
            page_text = self.page.content().lower()
            for indicator in question_indicators:
                if indicator in page_text:
                    logger.info(f"✅ Found question indicator: {indicator}")
                    return True
            
            # Check for input fields with labels
            inputs = self.page.locator("input, select, textarea").all()
            for inp in inputs[:5]:  # Check first 5 inputs
                if inp.is_visible():
                    label = self._get_input_label(inp)
                    if label and "question" in label.lower():
                        return True
            
            return False
            
        except Exception as e:
            logger.warning(f"Error checking questions: {str(e)}")
            return False
    
    def _get_input_label(self, element) -> str:
        """Get label for an input element"""
        try:
            # Check for label using for attribute
            input_id = element.get_attribute("id")
            if input_id:
                label = self.page.locator(f"label[for='{input_id}']").first
                if label.count():
                    return label.text_content() or ""
            
            # Check for placeholder
            placeholder = element.get_attribute("placeholder")
            if placeholder:
                return placeholder
            
            # Check for aria-label
            aria_label = element.get_attribute("aria-label")
            if aria_label:
                return aria_label
            
            # Check for preceding text
            parent = element.locator("..").first
            if parent.count():
                parent_text = parent.text_content() or ""
                return parent_text[:50]  # First 50 characters
            
        except Exception as e:
            logger.warning(f"Error getting label: {str(e)}")
        return ""
    
    def _handle_ctc_questions(self) -> bool:
        """Handle CTC/salary related questions"""
        try:
            handled = False
            
            # Look for CTC related inputs
            ctc_keywords = [
                "current ctc", "current salary", "present ctc", "present salary",
                "expected ctc", "expected salary", "salary expectation",
                "annual salary", "compensation", "package"
            ]
            
            # Find all inputs
            inputs = self.page.locator("input[type='text'], input:not([type])").all()
            
            for inp in inputs:
                if inp.is_visible() and not inp.is_disabled():
                    label = self._get_input_label(inp).lower()
                    
                    for keyword in ctc_keywords:
                        if keyword in label:
                            logger.info(f"📝 Found CTC question: {label[:50]}...")
                            
                            # Check if it's current or expected CTC
                            if "current" in label:
                                inp.fill(self.default_answers['current_ctc'])
                            elif "expected" in label:
                                inp.fill(self.default_answers['expected_ctc'])
                            else:
                                # Default to expected CTC
                                inp.fill(self.default_answers['expected_ctc'])
                            
                            self.browser.human_delay(0.5, 1)
                            handled = True
                            break
            
            # Also check for salary select/dropdown
            selects = self.page.locator("select").all()
            for select in selects:
                if select.is_visible():
                    label = self._get_input_label(select).lower()
                    for keyword in ctc_keywords:
                        if keyword in label:
                            logger.info(f"📝 Found CTC dropdown: {label[:50]}...")
                            options = select.locator("option").all()
                            for opt in options:
                                opt_text = opt.text_content() or ""
                                if "15" in opt_text or "20" in opt_text or "lpa" in opt_text.lower():
                                    opt.click()
                                    handled = True
                                    break
                            break
            
            return handled
            
        except Exception as e:
            logger.warning(f"CTC question handling warning: {str(e)}")
            return False
    
    def _handle_text_questions(self) -> bool:
        """Handle text input questions"""
        try:
            handled = False
            
            # Find all text inputs
            inputs = self.page.locator("input[type='text'], input:not([type])").all()
            
            for inp in inputs:
                if inp.is_visible() and not inp.is_disabled():
                    # Skip if already filled
                    if inp.get_attribute("value"):
                        continue
                    
                    label = self._get_input_label(inp).lower()
                    
                    # Map labels to answers
                    answer_mapping = {
                        'notice period': self.default_answers['notice_period'],
                        'experience': self.default_answers['experience'],
                        'location': self.default_answers['current_location'],
                        'reason': self.default_answers['reason_for_change'],
                        'available': self.default_answers['available_to_join'],
                        'education': self.default_answers['highest_education'],
                        'year': self.default_answers['year_of_passing'],
                        'gender': self.default_answers['gender'],
                        'dob': self.default_answers['date_of_birth'],
                        'languages': self.default_answers['languages_known'],
                        'skills': self.default_answers['skills']
                    }
                    
                    for key, value in answer_mapping.items():
                        if key in label:
                            inp.fill(value)
                            self.browser.human_delay(0.5, 1)
                            handled = True
                            logger.info(f"✅ Filled: {key} = {value}")
                            break
            
            return handled
            
        except Exception as e:
            logger.warning(f"Text question handling warning: {str(e)}")
            return False
    
    def _handle_dropdown_questions(self) -> bool:
        """Handle dropdown/select questions"""
        try:
            handled = False
            
            selects = self.page.locator("select").all()
            
            for select in selects:
                if select.is_visible():
                    # Skip if already has value
                    if select.get_attribute("value"):
                        continue
                    
                    label = self._get_input_label(select).lower()
                    
                    # Get all options
                    options = select.locator("option").all()
                    if not options:
                        continue
                    
                    # Try to select based on label
                    if "experience" in label:
                        for opt in options:
                            opt_text = opt.text_content() or ""
                            if "3" in opt_text or "4" in opt_text or "5" in opt_text:
                                opt.click()
                                handled = True
                                logger.info(f"✅ Selected experience option: {opt_text}")
                                break
                    
                    elif "notice" in label:
                        for opt in options:
                            opt_text = opt.text_content() or ""
                            if "30" in opt_text or "1 month" in opt_text.lower():
                                opt.click()
                                handled = True
                                logger.info(f"✅ Selected notice period: {opt_text}")
                                break
                    
                    elif "education" in label or "qualification" in label:
                        for opt in options:
                            opt_text = opt.text_content() or ""
                            if "m.tech" in opt_text.lower() or "masters" in opt_text.lower() or "b.tech" in opt_text.lower():
                                opt.click()
                                handled = True
                                logger.info(f"✅ Selected education: {opt_text}")
                                break
                    
                    elif "gender" in label:
                        for opt in options:
                            opt_text = opt.text_content() or ""
                            if "male" in opt_text.lower():
                                opt.click()
                                handled = True
                                logger.info(f"✅ Selected gender: {opt_text}")
                                break
                    
                    else:
                        # Default to first non-empty option
                        for opt in options[1:]:  # Skip first if it's "Select"
                            opt_text = opt.text_content() or ""
                            if opt_text.strip() and opt_text != "Select":
                                opt.click()
                                handled = True
                                logger.info(f"✅ Selected option: {opt_text}")
                                break
                    
                    self.browser.human_delay(0.5, 1)
            
            return handled
            
        except Exception as e:
            logger.warning(f"Dropdown question handling warning: {str(e)}")
            return False
    
    def _handle_radio_questions(self) -> bool:
        """Handle radio button questions"""
        try:
            handled = False
            
            radios = self.page.locator("input[type='radio']").all()
            
            # Group radios by name
            radio_groups = {}
            for radio in radios:
                if radio.is_visible() and not radio.is_checked():
                    name = radio.get_attribute("name") or ""
                    if name not in radio_groups:
                        radio_groups[name] = []
                    radio_groups[name].append(radio)
            
            for name, group in radio_groups.items():
                # Find label for this group
                label = self._get_input_label(group[0]).lower()
                
                for radio in group:
                    value = radio.get_attribute("value") or ""
                    
                    # Select based on label and value
                    if "experience" in label:
                        if "experienced" in value.lower() or "3" in value:
                            radio.click()
                            handled = True
                            logger.info(f"✅ Selected radio: {value}")
                            break
                    
                    elif "notice" in label:
                        if "30" in value or "1 month" in value.lower():
                            radio.click()
                            handled = True
                            logger.info(f"✅ Selected radio: {value}")
                            break
                    
                    elif "gender" in label:
                        if "male" in value.lower():
                            radio.click()
                            handled = True
                            logger.info(f"✅ Selected radio: {value}")
                            break
                    
                    elif "available" in label or "join" in label:
                        if "immediate" in value.lower() or "yes" in value.lower():
                            radio.click()
                            handled = True
                            logger.info(f"✅ Selected radio: {value}")
                            break
                    
                    elif "authorization" in label or "visa" in label:
                        if "citizen" in value.lower() or "authorized" in value.lower():
                            radio.click()
                            handled = True
                            logger.info(f"✅ Selected radio: {value}")
                            break
                
                self.browser.human_delay(0.5, 1)
            
            return handled
            
        except Exception as e:
            logger.warning(f"Radio question handling warning: {str(e)}")
            return False
    
    def _handle_checkbox_questions(self) -> bool:
        """Handle checkbox questions"""
        try:
            handled = False
            
            checkboxes = self.page.locator("input[type='checkbox']").all()
            
            for checkbox in checkboxes:
                if checkbox.is_visible() and not checkbox.is_checked():
                    label = self._get_input_label(checkbox).lower()
                    
                    # Check if it's something we should agree to
                    if "agree" in label or "terms" in label or "conditions" in label:
                        checkbox.click()
                        handled = True
                        logger.info("✅ Checked terms/conditions checkbox")
                        self.browser.human_delay(0.5, 1)
                    elif "experience" in label or "skill" in label:
                        checkbox.click()
                        handled = True
                        logger.info(f"✅ Checked skill/experience checkbox")
                        self.browser.human_delay(0.5, 1)
            
            return handled
            
        except Exception as e:
            logger.warning(f"Checkbox question handling warning: {str(e)}")
            return False
    
    def _handle_skip_options(self):
        """Handle skip options for questions"""
        try:
            skip_selectors = [
                "a:has-text('Skip this question')",
                "button:has-text('Skip this question')",
                "button:has-text('Skip')",
                "button:has-text('I'll do it later')",
                "a:has-text('Skip this question')",
                ".skip-question",
                ".skip-btn"
            ]
            
            for selector in skip_selectors:
                try:
                    skip_btn = self.page.locator(selector).first
                    if skip_btn.count() and skip_btn.is_visible():
                        skip_btn.click()
                        self.browser.human_delay(1, 2)
                        logger.info(f"✅ Skipped question using: {selector}")
                        return True
                except:
                    continue
            
            return False
            
        except Exception as e:
            logger.warning(f"Skip handling warning: {str(e)}")
            return False
    
    def handle_ctc_specific(self, current_ctc: str = "8-10 LPA", expected_ctc: str = "15-20 LPA") -> bool:
        """
        Specifically handle CTC questions with custom values
        
        Args:
            current_ctc: Current CTC in LPA
            expected_ctc: Expected CTC in LPA
        """
        self.default_answers['current_ctc'] = current_ctc
        self.default_answers['expected_ctc'] = expected_ctc
        return self._handle_ctc_questions()