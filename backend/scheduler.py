import schedule
import time
import subprocess
import logging
import os
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def run_scraper():
    """Run the Bayut web scraper"""
    try:
        logger.info(f"[{datetime.now()}] Starting scheduled scraper run...")
        
        # Get the absolute path to the scraper script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        scraper_path = os.path.join(current_dir, 'services', 'bayut_web_scraper.py')
        
        # Run the scraper script
        result = subprocess.run(['python', scraper_path], 
                              capture_output=True, 
                              text=True)
        
        # Log the output
        if result.stdout:
            logger.info(f"Scraper output:\n{result.stdout}")
        if result.stderr:
            logger.error(f"Scraper errors:\n{result.stderr}")
            
        if result.returncode == 0:
            logger.info("Scraper completed successfully")
        else:
            logger.error(f"Scraper failed with return code {result.returncode}")
            
    except Exception as e:
        logger.error(f"Error running scraper: {str(e)}")

def main():
    """Main function to set up and run the scheduler"""
    try:
        logger.info("Starting scheduler...")
        
        # Schedule the scraper to run every 4 hours
        schedule.every(4).hours.do(run_scraper)
        
        # Run immediately on startup
        run_scraper()
        
        # Keep the script running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
            
    except Exception as e:
        logger.error(f"Error in scheduler: {str(e)}")
        raise

if __name__ == "__main__":
    main() 