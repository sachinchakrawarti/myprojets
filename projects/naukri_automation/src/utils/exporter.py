"""
Export data to various formats
"""
import json
import csv
from pathlib import Path
from typing import Dict, List, Any
import pandas as pd
import logging

logger = logging.getLogger(__name__)

class Exporter:
    """Export job data to various formats"""
    
    def __init__(self, export_dir="exports"):
        self.export_dir = Path(export_dir)
        self.export_dir.mkdir(exist_ok=True)
    
    def export_to_excel(self, data: List[Dict], filename: str = None) -> str:
        """Export to Excel"""
        try:
            if not filename:
                from datetime import datetime
                filename = f"jobs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            
            filepath = self.export_dir / filename
            df = pd.DataFrame(data)
            df.to_excel(filepath, index=False)
            logger.info(f"✅ Exported to Excel: {filepath}")
            return str(filepath)
        except Exception as e:
            logger.error(f"Excel export failed: {str(e)}")
            return ""
    
    def export_to_json(self, data: List[Dict], filename: str = None) -> str:
        """Export to JSON"""
        try:
            if not filename:
                from datetime import datetime
                filename = f"jobs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            filepath = self.export_dir / filename
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f"✅ Exported to JSON: {filepath}")
            return str(filepath)
        except Exception as e:
            logger.error(f"JSON export failed: {str(e)}")
            return ""