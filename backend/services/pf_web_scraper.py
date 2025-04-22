import pandas as pd
import time
import re
from datetime import datetime
import random
import os
import platform
import sys

# First, check if we can use Selenium
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
    selenium_available = True
except ImportError:
    selenium_available = False
    print("Selenium is not installed. Will fall back to requests and BeautifulSoup.")

# Check for BeautifulSoup as a fallback
try:
    import requests
    from bs4 import BeautifulSoup
    bs4_available = True
except ImportError:
    bs4_available = False
    print("BeautifulSoup is not installed.")

def setup_driver():
    """Set up the Selenium WebDriver using Chrome"""
    if not selenium_available:
        print("Selenium is not available. Cannot set up WebDriver.")
        return None

    try:
        from selenium.webdriver.chrome.service import Service as ChromeService
        from selenium.webdriver.chrome.options import Options as ChromeOptions

        try:
            from webdriver_manager.chrome import ChromeDriverManager
            chrome_service = ChromeService(ChromeDriverManager().install())
        except Exception:
            chrome_service = ChromeService("chromedriver")

        chrome_options = ChromeOptions()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--width=1920")
        chrome_options.add_argument("--height=1080")

        driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
        return driver

    except WebDriverException as e:
        print(f"Failed to initialize Chrome WebDriver: {e}")
        return None

def extract_number(text):
    """Extract numeric value from string"""
    if not text:
        return 0
    
    # Extract digits and decimals
    numbers = re.findall(r'[\d,]+\.?\d*', text)
    if numbers:
        # Take the first match and remove commas
        return float(numbers[0].replace(',', ''))
    return 0

def extract_neighborhood(location):
    """Extract neighborhood/community from location string"""
    if not location:
        return "N/A"
    
    # Split location by commas and take the second part if available
    parts = location.split(',')
    if len(parts) >= 2:
        return parts[1].strip()
    return parts[0].strip()

def extract_building_name(title, location):
    """Extract building name from title or location"""
    building = "N/A"
    
    # Try to find "in [Building Name]" pattern in title
    in_match = re.search(r'in\s+([^\d,]+)', title)
    if in_match:
        building = in_match.group(1).strip()
    elif location:
        # Take the first part of location as building name
        building = location.split(',')[0].strip()
    
    return building

def extract_from_card_text(card_text):
    """
    Extract property data from card text using improved regex patterns
    that match the actual format of PropertyFinder listings.
    """
    # Debug the full text
    print("PROCESSING TEXT:")
    print(card_text[:200] + "..." if len(card_text) > 200 else card_text)
    
    # Title extraction
    title_match = re.search(r"^(.*?)(?:AED|Rent|Sale)", card_text.strip())
    title = title_match.group(1).strip() if title_match else "N/A"
    
    # Price extraction
    price_match = re.search(r"AED\s*([\d,]+)", card_text)
    current_rent = extract_number(price_match.group(1)) if price_match else 0
    
    # Location extraction
    location_match = re.search(r"Location:\s*(.*?)\n", card_text)
    location = location_match.group(1).strip() if location_match else "N/A"
    
    # Bedrooms & Bathrooms
    bed_bath_match = re.search(r"(\d+)\s*BR.*?(\d+)\s*Bath", card_text)
    bedrooms = int(bed_bath_match.group(1)) if bed_bath_match else 0
    bathrooms = int(bed_bath_match.group(2)) if bed_bath_match else 0
    
    # Area
    area_match = re.search(r"Area:\s*([\d,]+)\s*sqft", card_text)
    area = extract_number(area_match.group(1)) if area_match else 0
    
    # Property type
    property_type = "apartment"
    for t in ['apartment', 'villa', 'house', 'studio', 'penthouse', 'townhouse']:
        if t.lower() in card_text.lower():
            property_type = t
            break
    
    # Debug what we extracted
    print(f"Extracted: Title={title[:30]}..., Location={location[:30]}..., Beds={bedrooms}, Baths={bathrooms}")
    
    return {
        "title": title.strip(),
        "property_type": property_type,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "area_sqft": area,
        "location": location.strip(),
        "current_rent": current_rent
    }

def fetch_with_selenium(max_pages=3):
    """
    Scrape property listings from PropertyFinder using Selenium.
    
    Args:
        max_pages: Maximum number of pages to scrape
    
    Returns:
        List of property data dictionaries
    """
    driver = setup_driver()
    if not driver:
        print("Could not initialize WebDriver. Selenium scraping is not available.")
        return []
        
    listings = []
    base_url = "https://www.propertyfinder.ae/en/buy"  # Change this to the correct PropertyFinder URL
    
    print(f"[{datetime.now()}] Starting to scrape PropertyFinder with Selenium...")
    
    try:
        for page in range(1, max_pages + 1):
            # Format URL correctly
            url = base_url if page == 1 else f"{base_url}?page={page}"
            print(f"[{datetime.now()}] Scraping page {page}: {url}")
            
            # Load the page
            driver.get(url)
            
            # Wait for the page to load (wait for property cards to appear)
            try:
                WebDriverWait(driver, 20).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "article, div.property-card"))
                )
                print(f"Page {page} loaded successfully.")
            except TimeoutException:
                print(f"Timeout waiting for page {page} to load. Moving to next page.")
                continue
            
            # Give additional time for all elements to fully render
            time.sleep(3)
            
            # Find all property cards (try multiple selectors)
            property_cards = driver.find_elements(By.CSS_SELECTOR, "div.property-card")
            
            if not property_cards:
                print("Could not find property cards. Taking screenshot for debugging...")
                try:
                    driver.save_screenshot(f"page_{page}_debug.png")
                    print(f"Screenshot saved as page_{page}_debug.png")
                    # Print page source for debugging
                    with open(f"page_{page}_source.html", "w", encoding="utf-8") as f:
                        f.write(driver.page_source)
                    print(f"Page source saved as page_{page}_source.html")
                except Exception as e:
                    print(f"Could not save debug info: {e}")
                continue
            
            # Process each property card
            for card in property_cards:
                try:
                    details_text = card.text  # Or use innerText for more reliable text extraction
                    
                    # Use the new extraction function
                    extracted_data = extract_from_card_text(details_text)
                    
                    # URL extraction
                    try:
                        property_url = card.find_element(By.TAG_NAME, "a").get_attribute("href")
                    except NoSuchElementException:
                        property_url = "N/A"
                    
                    # Calculate derived fields
                    current_rent = extracted_data["current_rent"]
                    location = extracted_data["location"]
                    
                    previous_rent = current_rent * 0.95 if current_rent else None
                    annual_rent = current_rent * 12 if current_rent else None
                    neighborhood = extract_neighborhood(location)
                    building = extract_building_name(extracted_data["title"], location)
                    
                    # Create the listing dictionary with all extracted data
                    listing = {
                        "title": extracted_data["title"],
                        "property_type": extracted_data["property_type"],
                        "bedrooms": extracted_data["bedrooms"],
                        "bathrooms": extracted_data["bathrooms"],
                        "area_sqft": extracted_data["area_sqft"],
                        "location": location,
                        "neighborhood": neighborhood,
                        "building": building,
                        "current_rent": current_rent,
                        "previous_rent": previous_rent,
                        "annual_rent": annual_rent,
                        "url": property_url,
                        "scraped_date": datetime.now().strftime("%Y-%m-%d")
                    }
                    
                    listings.append(listing)
                    print(f"Scraped: {extracted_data['title'][:40]}... - {current_rent} AED - {location[:30]}...")
                    
                except Exception as e:
                    print(f"Error extracting data from a property card: {e}")
                    continue
            
            # Add a small delay between pages
            time.sleep(random.uniform(2, 4))
    
    except Exception as e:
        print(f"Error during Selenium scraping: {e}")
    
    finally:
        # Close the browser
        driver.quit()
    
    return listings

def fetch_with_requests(max_pages=3):
    """
    Scrape property listings from PropertyFinder using requests and BeautifulSoup.
    
    Args:
        max_pages: Maximum number of pages to scrape
    
    Returns:
        List of property data dictionaries
    """
    if not bs4_available:
        print("BeautifulSoup is not available. Cannot use requests-based scraping.")
        return []
        
    listings = []
    base_url = "https://www.propertyfinder.ae/en/buy"  # Change this to the correct PropertyFinder URL
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    print(f"[{datetime.now()}] Starting to scrape PropertyFinder with requests/BeautifulSoup...")
    
    for page in range(1, max_pages + 1):
        try:
            # Format URL correctly
            url = base_url if page == 1 else f"{base_url}?page={page}"
            print(f"[{datetime.now()}] Scraping page {page}: {url}")
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Try different selectors to find property cards
            property_cards = soup.select("div.property-card")
            
            if not property_cards:
                print("Could not find property cards using BeautifulSoup.")
                continue
                
            # Process each property card
            for card in property_cards:
                try:
                    card_text = card.text
                    
                    # Use the new extraction function
                    extracted_data = extract_from_card_text(card_text)
                    
                    # URL extraction
                    url_elem = card.select_one("a")
                    property_url = "https://www.propertyfinder.ae" + url_elem['href'] if url_elem and 'href' in url_elem.attrs else "N/A"
                    
                    # Calculate derived fields
                    current_rent = extracted_data["current_rent"]
                    location = extracted_data["location"]
                    
                    previous_rent = current_rent * 0.95 if current_rent else None
                    annual_rent = current_rent * 12 if current_rent else None
                    neighborhood = extract_neighborhood(location)
                    building = extract_building_name(extracted_data["title"], location)
                    
                    # Create the listing dictionary with all extracted data
                    listing = {
                        "title": extracted_data["title"],
                        "property_type": extracted_data["property_type"],
                        "bedrooms": extracted_data["bedrooms"],
                        "bathrooms": extracted_data["bathrooms"],
                        "area_sqft": extracted_data["area_sqft"],
                        "location": location,
                        "neighborhood": neighborhood,
                        "building": building,
                        "current_rent": current_rent,
                        "previous_rent": previous_rent,
                        "annual_rent": annual_rent,
                        "url": property_url,
                        "scraped_date": datetime.now().strftime("%Y-%m-%d")
                    }
                    
                    listings.append(listing)
                    print(f"Scraped: {extracted_data['title'][:40]}... - {current_rent} AED - {location[:30]}...")
                    
                except Exception as e:
                    print(f"Error extracting data from a property card: {e}")
                    continue
            
            # Add a small delay between pages
            time.sleep(random.uniform(2, 4))
            
        except Exception as e:
            print(f"Error scraping page {page} with BeautifulSoup: {e}")
            continue
    
    return listings

def fetch_from_propertyfinder(max_pages=3):
    """
    Main function to scrape PropertyFinder property listings.
    Tries Selenium first, falls back to requests/BeautifulSoup if needed.
    
    Args:
        max_pages: Maximum number of pages to scrape
    
    Returns:
        DataFrame containing property data
    """
    listings = []
    
    # Try with Selenium first
    if selenium_available:
        listings = fetch_with_selenium(max_pages)
    
    # If Selenium failed or is not available, try with requests/BeautifulSoup
    if not listings and bs4_available:
        listings = fetch_with_requests(max_pages)
    
    if not listings:
        print("Could not scrape any listings. Both Selenium and BeautifulSoup methods failed.")
        return pd.DataFrame()
    
    # Create DataFrame from listings
    df = pd.DataFrame(listings)
    
    # Save to CSV
    df.to_csv("propertyfinder_listings.csv", index=False)
    print(f"[{datetime.now()}] Scraped {len(listings)} properties from PropertyFinder and saved to CSV.")
    
    return df

# Run the scraper
if __name__ == "__main__":
    df = fetch_from_propertyfinder(max_pages=2)
    # Display full DataFrame
    if not df.empty:
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', 1000)
        print("\nFull DataFrame:")
        print(df)
    else:
        print("No data was collected.")
