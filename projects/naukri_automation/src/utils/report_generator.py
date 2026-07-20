"""
Report generation for automation results
"""
import json
import pandas as pd
from datetime import datetime
from pathlib import Path
import logging
from jinja2 import Template

logger = logging.getLogger(__name__)

class ReportGenerator:
    """Generate reports in multiple formats"""
    
    def __init__(self, report_dir: str = "reports"):
        self.report_dir = Path(report_dir)
        self.report_dir.mkdir(exist_ok=True)
        (self.report_dir / "daily").mkdir(exist_ok=True)
        (self.report_dir / "weekly").mkdir(exist_ok=True)
    
    def generate_csv(self, report: dict) -> str:
        """Generate CSV report"""
        try:
            # Combine all jobs
            all_jobs = []
            
            for job in report.get('applied_jobs', []):
                job_copy = job.copy()
                job_copy['status'] = 'applied'
                all_jobs.append(job_copy)
            
            for job in report.get('skipped_jobs', []):
                job_copy = job.copy()
                job_copy['status'] = 'skipped'
                all_jobs.append(job_copy)
            
            for job in report.get('failed_jobs', []):
                job_copy = job.copy()
                job_copy['status'] = 'failed'
                all_jobs.append(job_copy)
            
            if all_jobs:
                df = pd.DataFrame(all_jobs)
                filename = self.report_dir / "daily" / f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                df.to_csv(filename, index=False)
                logger.info(f"CSV report saved: {filename}")
                return str(filename)
            
        except Exception as e:
            logger.error(f"CSV generation failed: {str(e)}")
        return ""
    
    def generate_html(self, report: dict) -> str:
        """Generate HTML report"""
        try:
            template = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Naukri Job Application Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f7fa; }
                    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
                    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
                    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
                    .stat { padding: 20px; border-radius: 8px; color: white; text-align: center; }
                    .stat.applied { background: #28a745; }
                    .stat.skipped { background: #ffc107; }
                    .stat.failed { background: #dc3545; }
                    .stat.total { background: #3498db; }
                    .stat .number { font-size: 32px; font-weight: bold; }
                    .stat .label { font-size: 14px; opacity: 0.9; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
                    th { background: #f8f9fa; }
                    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                    .badge-applied { background: #d4edda; color: #155724; }
                    .badge-skipped { background: #fff3cd; color: #856404; }
                    .badge-failed { background: #f8d7da; color: #721c24; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🤖 Naukri Job Application Report</h1>
                    <p><strong>Date:</strong> {{ report.timestamp }}</p>
                    
                    <div class="stats">
                        <div class="stat total"><div class="number">{{ report.summary.total_found }}</div><div class="label">📊 Found</div></div>
                        <div class="stat applied"><div class="number">{{ report.summary.applied }}</div><div class="label">✅ Applied</div></div>
                        <div class="stat skipped"><div class="number">{{ report.summary.skipped }}</div><div class="label">⏭️ Skipped</div></div>
                        <div class="stat failed"><div class="number">{{ report.summary.failed }}</div><div class="label">❌ Failed</div></div>
                    </div>
                    
                    <h2>✅ Applied Jobs ({{ report.applied_jobs|length }})</h2>
                    <table>
                        <tr><th>#</th><th>Title</th><th>Company</th><th>Location</th><th>Applied At</th></tr>
                        {% for job in report.applied_jobs %}
                        <tr>
                            <td>{{ loop.index }}</td>
                            <td>{{ job.title }}</td>
                            <td>{{ job.company }}</td>
                            <td>{{ job.location }}</td>
                            <td>{{ job.applied_at }}</td>
                        </tr>
                        {% endfor %}
                    </table>
                </div>
            </body>
            </html>
            """
            
            template_obj = Template(template)
            html_content = template_obj.render(report=report)
            
            filename = self.report_dir / "daily" / f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            with open(filename, "w", encoding='utf-8') as f:
                f.write(html_content)
            
            logger.info(f"HTML report saved: {filename}")
            return str(filename)
            
        except Exception as e:
            logger.error(f"HTML generation failed: {str(e)}")
        return ""
    
    def save_json(self, report: dict) -> str:
        """Save report as JSON"""
        try:
            filename = self.report_dir / "daily" / f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, "w", encoding='utf-8') as f:
                json.dump(report, f, indent=2, default=str)
            logger.info(f"JSON report saved: {filename}")
            return str(filename)
        except Exception as e:
            logger.error(f"JSON save failed: {str(e)}")
        return ""
    
    def generate_all(self, report: dict) -> dict:
        """Generate all report formats"""
        return {
            "csv": self.generate_csv(report),
            "html": self.generate_html(report),
            "json": self.save_json(report)
        }