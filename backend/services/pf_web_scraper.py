import time
import re
from datetime import datetime
import random
import os
import requests
from bs4 import BeautifulSoup
import pandas as pd
import logging
import json
from urllib.parse import urljoin
from fake_useragent import UserAgent
from requests.exceptions import RequestException, ConnectionError, Timeout
from typing import Dict, List, Optional, Union, Any

# Set up logging with more detailed format
logging.basicConfig(
    level=logging.INFO,  # Change to DEBUG level
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('propertyfinder_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def get_random_headers():
    """Generate realistic browser headers"""
    ua = UserAgent()
    user_agent = ua.random
    
    # Common headers
    headers = {
        'User-Agent': user_agent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.google.com/',
        'DNT': '1',  # Do Not Track
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site'
    }
    
    return headers

def analyze_html_structure(html_file):
    """
    Analyze the HTML structure of PropertyFinder to find the correct selectors
    """
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        print("\n" + "="*80)
        print("ANALYZING HTML STRUCTURE")
        print("="*80)
        
        # Find all property cards
        property_cards = soup.select("[data-testid*='property-card']")
        print(f"Found {len(property_cards)} property cards with [data-testid*='property-card']")
        
        if property_cards:
            # Analyze the first card
            first_card = property_cards[0]
            print("\nFirst property card structure:")
            
            # Print all data-testid attributes in this card
            data_testids = first_card.select('[data-testid]')
            print("\nAll data-testid attributes:")
            for elem in data_testids:
                print(f"- {elem.get('data-testid')}: {elem.name}")
            
            # Look for links
            links = first_card.select('a')
            print("\nLinks in card:")
            for link in links:
                href = link.get('href', '')
                text = link.get_text(strip=True)
                print(f"- Link: {href[:50]}... | Text: {text[:30]}...")
            
            # Look for all text elements
            text_elements = [elem for elem in first_card.select('*') if elem.get_text(strip=True)]
            print("\nText elements in card:")
            for i, elem in enumerate(text_elements[:10]):  # Show first 10
                if i < 10:  # Limit to first 10
                    print(f"- {elem.name}: {elem.get_text(strip=True)[:50]}...")
            
            # Extract attributes that might contain useful info
            print("\nUseful attributes in first card:")
            for attr in ['class', 'id', 'data-testid', 'data-value', 'title']:
                elements = first_card.select(f'[{attr}]')
                if elements:
                    print(f"\nElements with {attr}:")
                    for elem in elements[:5]:  # Show first 5
                        print(f"- {elem.name}: {attr}={elem.get(attr)}")
            
            # Print the HTML structure of the first card (first 500 chars)
            print("\nHTML structure of first card (preview):")
            card_html = str(first_card)
            print(card_html[:500] + "..." if len(card_html) > 500 else card_html)
            
            # Save the first card HTML to a file for further inspection
            with open(os.path.join(os.path.dirname(html_file), 'first_property_card.html'), 'w', encoding='utf-8') as f:
                f.write(str(first_card))
            
            print("\nFirst card HTML saved to 'first_property_card.html' for inspection")
            
        return True
    except Exception as e:
        logger.error(f"Error analyzing HTML structure: {str(e)}")
        return False

def test_connectivity():
    """
    Test connectivity to PropertyFinder.ae and print raw HTML
    """
    logger.info("Testing connectivity to PropertyFinder.ae...")
    
    test_url = "https://www.propertyfinder.ae/en/rent/properties-for-rent.html"
    
    # Use improved headers
    headers = get_random_headers()
    
    try:
        logger.info(f"Sending request to: {test_url}")
        logger.info(f"Using User-Agent: {headers['User-Agent']}")
        
        response = requests.get(test_url, headers=headers, timeout=30)
        
        # Check if request was successful
        if response.status_code == 200:
            logger.info(f"Successfully connected to PropertyFinder! Status code: {response.status_code}")
            
            # Create data directory if it doesn't exist
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
            os.makedirs(data_dir, exist_ok=True)
            
            # Save raw HTML for inspection
            html_file = os.path.join(data_dir, 'propertyfinder_raw.html')
            with open(html_file, "w", encoding="utf-8") as f:
                f.write(response.text)
            
            logger.info(f"Raw HTML saved to: {html_file}")
            
            analyze_html_structure(html_file)
            
            # Print first 1000 chars of HTML to console
            print("\n===== FIRST 1000 CHARACTERS OF RAW HTML =====")
            print(response.text[:1000])
            print("...\n")
            
            # Check for JSON-LD data
            soup = BeautifulSoup(response.text, "html.parser")
            json_ld = soup.find('script', {'id': 'serp-schema', 'type': 'application/ld+json'})
            
            if json_ld:
                logger.info("Found JSON-LD data in the page!")
                try:
                    schema_data = json.loads(json_ld.string)
                    # Save JSON-LD for inspection
                    with open(os.path.join(data_dir, 'json_ld_data.json'), 'w', encoding='utf-8') as f:
                        json.dump(schema_data, f, indent=2)
                    logger.info("JSON-LD data saved to json_ld_data.json")
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON-LD data: {str(e)}")
            else:
                logger.warning("No JSON-LD data found, will fall back to HTML scraping")
                
            # Parse HTML and look for common elements
            title = soup.title.text if soup.title else "No title found"
            logger.info(f"Page title: {title}")
            
            # Check for common selectors that might contain property listings
            selectors_to_try = [
                "div[data-testid*='property-card']", 
                "div.property-card", 
                "article.property-card", 
                "div.card-list__item",
                ".card",
                ".property",
                ".listing"
            ]
            
            print("===== TESTING SELECTORS =====")
            for selector in selectors_to_try:
                elements = soup.select(selector)
                print(f"Selector '{selector}': Found {len(elements)} elements")
                
                # If elements found, print a sample of the first element
                if elements:
                    print(f"\nSample of first element with '{selector}':")
                    print(str(elements[0])[:300] + "...\n")
            
            return True
        else:
            logger.error(f"Failed to connect! Status code: {response.status_code}")
            logger.error(f"Response content: {response.text[:500]}...")
            return False
            
    except Exception as e:
        logger.error(f"Error testing connectivity: {str(e)}")
        return False

def parse_propertyfinder_json(json_data):
    """
    Parse the JSON data from PropertyFinder and extract property listings
    
    Args:
        json_data: The raw JSON data as a dictionary
        
    Returns:
        List of property dictionaries
    """
    properties = []
    
    try:
        # Check if we have the expected structure
        if 'itemListElement' not in json_data:
            logger.error("Invalid JSON structure: 'itemListElement' not found")
            return properties
            
        # Extract each property from the itemListElement array
        for item in json_data['itemListElement']:
            if '@type' in item and 'mainEntity' in item:
                property_data = item['mainEntity']
                
                # Extract basic property details
                property_id = property_data.get('@id', '')
                title = property_data.get('name', '')
                description = property_data.get('description', '')
                
                # Extract property type
                property_types = property_data.get('@type', [])
                property_type = 'apartment'  # default
                if isinstance(property_types, list):
                    for ptype in property_types:
                        if ptype.lower() in ['house', 'villa', 'townhouse', 'apartment', 'apartmentcomplex']:
                            property_type = ptype.lower()
                            break
                
                # Extract location details
                address = property_data.get('address', {})
                location = address.get('name', '')
                neighborhood = address.get('addressRegion', '')
                city = address.get('addressLocality', '')
                
                # Extract bedrooms and bathrooms from description
                bedrooms = 0
                bathrooms = 0
                if description:
                    # Look for bedroom count
                    bed_match = re.search(r'(\d+)\s*(?:bed|BR|bedroom)', description, re.IGNORECASE)
                    if bed_match:
                        bedrooms = int(bed_match.group(1))
                    
                    # Look for bathroom count
                    bath_match = re.search(r'(\d+)\s*(?:bath|BA|bathroom)', description, re.IGNORECASE)
                    if bath_match:
                        bathrooms = int(bath_match.group(1))
                
                # Extract size
                area_sqft = 0
                floor_size = property_data.get('floorSize', {})
                if floor_size and isinstance(floor_size, dict) and 'value' in floor_size:
                    try:
                        area_sqft = float(floor_size['value'])
                    except (ValueError, TypeError):
                        pass
                
                # Extract price
                current_rent = 0
                offers = property_data.get('offers', [])
                if offers and isinstance(offers, list) and len(offers) > 0:
                    price_spec = offers[0].get('priceSpecification', {})
                    if price_spec and 'price' in price_spec:
                        try:
                            current_rent = float(price_spec['price'])
                        except (ValueError, TypeError):
                            pass
                
                # Extract URL and image
                property_url = property_data.get('url', '')
                image_url = property_data.get('image', '')
                
                # Only include properties with basic information
                if title or location or current_rent > 0:
                    property_info = {
                        "title": title,
                        "property_type": property_type,
                        "bedrooms": bedrooms,
                        "bathrooms": bathrooms,
                        "area_sqft": area_sqft,
                        "location": location,
                        "neighborhood": neighborhood,
                        "building": extract_building_name(title, location),
                        "current_rent": current_rent,
                        "previous_rent": None,
                        "annual_rent": current_rent,
                        "url": property_url,
                        "image_url": image_url,
                        "scraped_date": datetime.now().strftime("%Y-%m-%d")
                    }
                    properties.append(property_info)
                    logger.debug(f"Extracted property: {property_info}")
                else:
                    logger.debug(f"Skipped property {property_id} - missing basic information")
                    
    except Exception as e:
        logger.error(f"Error parsing JSON data: {str(e)}")
        
    return properties

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

def extract_from_json_ld(property_data):
    """Extract property details from JSON-LD data with improved robustness"""
    try:
        property_id = property_data.get('@id', '')
        
        # Basic details
        title = property_data.get('name', '')
        description = property_data.get('description', '')
        
        # Property type
        property_types = property_data.get('@type', [])
        property_type = 'apartment'  # default
        if isinstance(property_types, list):
            for ptype in property_types:
                if ptype.lower() in ['house', 'villa', 'townhouse', 'apartment']:
                    property_type = ptype.lower()
                    break
        
        # Location details
        address = property_data.get('address', {})
        location = address.get('name', '')
        neighborhood = address.get('addressRegion', '')
        city = address.get('addressLocality', '')
        
        # Extract bedrooms and bathrooms from description
        bedrooms = 0
        bathrooms = 0
        if description:
            # Look for bedroom count
            bed_match = re.search(r'(\d+)\s*(?:bed|BR|bedroom)', description, re.IGNORECASE)
            if bed_match:
                bedrooms = int(bed_match.group(1))
            
            # Look for bathroom count
            bath_match = re.search(r'(\d+)\s*(?:bath|BA|bathroom)', description, re.IGNORECASE)
            if bath_match:
                bathrooms = int(bath_match.group(1))
        
        # Size
        area_sqft = 0
        floor_size = property_data.get('floorSize', {})
        if floor_size and isinstance(floor_size, dict) and 'value' in floor_size:
            try:
                area_sqft = float(floor_size['value'])
            except (ValueError, TypeError):
                pass
        
        # Price
        current_rent = 0
        offers = property_data.get('offers', [])
        if offers and isinstance(offers, list) and len(offers) > 0:
            price_spec = offers[0].get('priceSpecification', {})
            if price_spec and 'price' in price_spec:
                try:
                    current_rent = float(price_spec['price'])
                except (ValueError, TypeError):
                    pass
        
        # Features/amenities
        features = {}
        amenities = property_data.get('amenityFeature', [])
        if amenities and isinstance(amenities, list):
            for amenity in amenities:
                if isinstance(amenity, dict) and 'name' in amenity and 'value' in amenity:
                    features[amenity['name']] = amenity['value']
        
        # Property URL and images
        property_url = property_data.get('url', '')
        image_url = property_data.get('image', '')
        
        # Only return if we have at least some basic information
        if not (title or location or current_rent > 0):
            return None
            
        return {
            "title": title,
            "property_type": property_type,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "area_sqft": area_sqft,
            "location": location,
            "neighborhood": neighborhood,
            "building": extract_building_name(title, location),
            "current_rent": current_rent,
            "previous_rent": None,  # This would need to be extracted from price history if available
            "annual_rent": current_rent,  # Assuming current_rent is annual
            "url": property_url,
            "image_url": image_url,
            "scraped_date": datetime.now().strftime("%Y-%m-%d")
        }
        
    except Exception as e:
        logger.error(f"Error extracting data from JSON-LD: {str(e)}")
        return None

def extract_from_property_card(card):
    """
    Extract property data from a PropertyFinder card element with improved selectors
    based on the current HTML structure
    """
    try:
        # First, check if this is a property card or some other element
        if not card.get('data-testid', '').startswith('property-card'):
            parent_card = card.find_parent('[data-testid*="property-card"]')
            if parent_card:
                card = parent_card
            else:
                logger.debug("Not a property card element")
                return None
        
        # Skip contact sections or ad cards
        card_text = card.get_text(strip=True)
        if any(term in card_text for term in ["CallEmailWhatsApp", "advertisement", "promoted"]):
            logger.debug("Skipping contact or ad section")
            return None
        
        # Find the property link - look for any anchor tag that leads to property details
        link_elem = card.select_one('a[href*="/property/"], a[href*="/plp/"]')
        if not link_elem:
            logger.debug("Could not find property link")
            return None
        
        property_url = urljoin("https://www.propertyfinder.ae", link_elem['href'])
        logger.debug(f"Found property URL: {property_url}")
        
        # Extract title from h2 or data-testid containing 'title'
        title_elem = card.select_one('h2, [data-testid*="title"]')
        title = title_elem.get_text(strip=True) if title_elem else "Unknown Title"
        logger.debug(f"Found title: {title}")
        
        # Extract price - look for data-testid with price or strong elements containing price
        price_elem = card.select_one('[data-testid*="price"], strong')
        price_text = price_elem.get_text(strip=True) if price_elem else "0"
        # Extract only the numbers from the price text
        current_rent = extract_number(price_text)
        logger.debug(f"Found price: {price_text} -> {current_rent}")
        
        # Extract location
        location_elem = card.select_one('[data-testid*="location"], [class*="location"]')
        location = location_elem.get_text(strip=True) if location_elem else ""
        logger.debug(f"Found location: {location}")
        
        # Extract property details - beds, baths, area
        bedrooms = 0
        bathrooms = 0
        area_sqft = 0
        
        # Look for spans or divs containing bed/bath/area info
        details_elements = card.select('span, div')
        for elem in details_elements:
            elem_text = elem.get_text(strip=True).lower()
            
            # Extract bedrooms
            if 'bed' in elem_text:
                bed_match = re.search(r'(\d+)\s*(?:bed|bedroom)', elem_text)
                if bed_match:
                    bedrooms = int(bed_match.group(1))
            
            # Extract bathrooms
            elif 'bath' in elem_text:
                bath_match = re.search(r'(\d+)\s*(?:bath|bathroom)', elem_text)
                if bath_match:
                    bathrooms = int(bath_match.group(1))
            
            # Extract area
            elif 'sqft' in elem_text or 'sq ft' in elem_text or 'sq.ft' in elem_text:
                area_match = re.search(r'(\d+(?:,\d+)*)\s*(?:sqft|sq\.ft|sq ft)', elem_text)
                if area_match:
                    area_sqft = extract_number(area_match.group(1))
        
        logger.debug(f"Found bedrooms: {bedrooms}, bathrooms: {bathrooms}, area: {area_sqft} sqft")
        
        # Determine property type from URL or title
        property_type = "apartment"  # default
        property_types = ["villa", "townhouse", "penthouse", "studio", "apartment"]
        for ptype in property_types:
            if ptype in property_url.lower() or ptype in title.lower():
                property_type = ptype
                break
        logger.debug(f"Determined property type: {property_type}")
        
        # Find image URL
        img_elem = card.select_one('img')
        image_url = ""
        if img_elem:
            if 'src' in img_elem.attrs:
                image_url = img_elem['src']
            elif 'data-src' in img_elem.attrs:
                image_url = img_elem['data-src']
            elif 'srcset' in img_elem.attrs:
                image_url = img_elem['srcset'].split(',')[0].split(' ')[0]
        logger.debug(f"Found image URL: {image_url}")
        
        # Only return if we have at least title, location or price
        if not (title or location or current_rent > 0):
            logger.debug("Property skipped - missing basic information")
            return None
        
        property_data = {
            "title": title,
            "property_type": property_type,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "area_sqft": area_sqft,
            "location": location,
            "neighborhood": extract_neighborhood(location),
            "building": extract_building_name(title, location),
            "current_rent": current_rent,
            "previous_rent": None,
            "annual_rent": current_rent,
            "url": property_url,
            "image_url": image_url,
            "scraped_date": datetime.now().strftime("%Y-%m-%d")
        }
        
        logger.debug(f"Successfully extracted property data: {property_data}")
        return property_data
        
    except Exception as e:
        logger.error(f"Error extracting data from property card: {str(e)}")
        logger.debug(f"Card HTML: {card}")
        return None

def fetch_from_propertyfinder(max_pages=3, max_retries=3, use_proxy=False, proxy_list=None):
    """
    Scrape property listings from PropertyFinder with improved methods.
    
    Args:
        max_pages: Maximum number of pages to scrape
        max_retries: Maximum retry attempts per page
        use_proxy: Whether to use proxies
        proxy_list: List of proxy servers to use
    
    Returns:
        DataFrame containing property data
    """
    listings = []
    base_url = "https://www.propertyfinder.ae/en/rent/properties-for-rent.html"
    
    # Proxy setup
    proxies = None
    if use_proxy and proxy_list:
        # Rotate through proxies
        proxy = random.choice(proxy_list)
        proxies = {
            'http': proxy,
            'https': proxy
        }
        logger.info(f"Using proxy: {proxy}")
    
        logger.info(f"[{datetime.now()}] Starting to scrape PropertyFinder using HTML scraping only...")
    
    # Create data directory if it doesn't exist
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    try:
        for page in range(1, max_pages + 1):
            retries = 0
            success = False
            
            while retries < max_retries and not success:
                try:
                    # Format URL correctly for pagination
                    url = base_url if page == 1 else f"{base_url}?page={page}"
                    logger.info(f"[{datetime.now()}] Scraping page {page}: {url} (attempt {retries+1}/{max_retries})")
                    
                    # Use rotating headers
                    headers = get_random_headers()
                    
                    # Send request with optional proxies
                    response = requests.get(url, headers=headers, proxies=proxies, timeout=30)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.text, "html.parser")
                    
                    # Find property cards
                    property_cards = soup.select("[data-testid*='property-card']")
                    if not property_cards:
                        logger.warning("Could not find property cards using primary selector. Trying alternatives...")
                        # Try various selectors that might contain property information
                        selectors_to_try = [
                            "div.card", "article", "div[class*='property']", "div[class*='card']", 
                            "div[class*='listing']", "div[class*='result']", 
                            # Add more potential selectors here
                        ]
                        
                        for selector in selectors_to_try:
                            property_cards = soup.select(selector)
                            if property_cards:
                                logger.info(f"Found {len(property_cards)} elements using selector: {selector}")
                                break
                            
                    if property_cards:
                        logger.info(f"Found {len(property_cards)} property cards")
                        # Process each property card
                        for card in property_cards:
                            extracted_data = extract_from_property_card(card)
                            if extracted_data:
                                listings.append(extracted_data)
                    else:
                        logger.warning("No property cards found on this page")
                    
                    # If we get here without exceptions, mark as success
                    success = True
                    # Add a small delay between pages
                    time.sleep(random.uniform(2, 4))
                    
                except (ConnectionError, Timeout) as e:
                    # Retry logic remains the same...
                    retries += 1
                    logger.warning(f"Network error on page {page}, retry {retries}/{max_retries}: {str(e)}")
                    time.sleep(random.uniform(5, 10))
                except RequestException as e:
                    retries += 1
                    logger.error(f"Request error on page {page}, retry {retries}/{max_retries}: {str(e)}")
                    time.sleep(random.uniform(5, 10))
                except Exception as e:
                    logger.error(f"Error scraping page {page}: {str(e)}")
                    break
        
        # Create DataFrame from listings
        if not listings:
            logger.error("Could not scrape any listings.")
            return pd.DataFrame()
            
        df = pd.DataFrame(listings)
        
        # Save to CSV
        csv_path = os.path.join(data_dir, 'propertyfinder_listings.csv')
        df.to_csv(csv_path, index=False)
        logger.info(f"[{datetime.now()}] Scraped {len(listings)} properties from PropertyFinder and saved to CSV at {csv_path}")
        
        # Also save to JSON for full data preservation
        json_path = os.path.join(data_dir, 'propertyfinder_listings.json')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(listings, f, indent=2)
        logger.info(f"Raw data also saved to JSON at {json_path}")
        
        # Display DataFrame preview
        logger.info("\nDataFrame Preview:")
        if not df.empty:
            preview_columns = ['title', 'property_type', 'bedrooms', 'bathrooms', 'area_sqft', 'current_rent', 'neighborhood']
            available_columns = [col for col in preview_columns if col in df.columns]
            logger.info(f"\n{df[available_columns].head()}")
        
        return df
        
    except Exception as e:
        logger.error(f"Error in fetch_from_propertyfinder: {str(e)}")
        return pd.DataFrame()

def test_scrape_and_print():
    """
    Test function to scrape property data using HTML only and print it to console
    """
    logger.info("Testing property scraping using HTML only...")
    
    # Read the saved HTML file
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    html_file = os.path.join(data_dir, 'propertyfinder_raw.html')
    
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Parse HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        print("\n" + "="*80)
        print("HTML SCRAPING RESULTS")
        print("="*80)
        
        # Find all property cards
        property_cards = soup.select("[data-testid*='property-card']")
        
        if not property_cards:
            logger.warning("No property cards found with the primary selector. Trying alternative selectors...")
            # Try alternative selectors
            for selector in ["div.card-list__item", "article.property-card", ".property-card"]:
                property_cards = soup.select(selector)
                if property_cards:
                    logger.info(f"Found {len(property_cards)} property cards using selector: {selector}")
                    break
        
        logger.info(f"Found {len(property_cards)} property cards")
        
        # Process each property card
        properties_found = 0
        for card in property_cards:
            property_data = extract_from_property_card(card)
            
            if property_data:
                properties_found += 1
                print("\n" + "="*80)
                print(f"PROPERTY #{properties_found}")
                print("="*80)
                print(f"Title: {property_data['title']}")
                print(f"Type: {property_data['property_type'].title()}")
                print(f"Price: {property_data['current_rent']:,.0f} AED/year")
                print(f"Bedrooms: {property_data['bedrooms']}")
                print(f"Bathrooms: {property_data['bathrooms']}")
                print(f"Area: {property_data['area_sqft']:,.0f} sq ft")
                print(f"Location: {property_data['location']}")
                print(f"Neighborhood: {property_data['neighborhood']}")
                print(f"Building: {property_data['building']}")
                print(f"URL: {property_data['url']}")
                print(f"Image: {property_data.get('image_url', 'N/A')}")
                print("-"*80)
                
                # Limit to 5 properties for readability
                if properties_found >= 5:
                    break
        
        print(f"\nTotal properties found: {properties_found}")
        return True
        
    except Exception as e:
        logger.error(f"Error in test_scrape_and_print: {str(e)}")
        return False

if __name__ == "__main__":
    # Test connectivity and save HTML
    if test_connectivity():
        # Test scraping and printing
        test_scrape_and_print()
        
        # Run actual scraper for multiple pages
        print("\n\nRunning full HTML scraper...")
        df = fetch_from_propertyfinder(max_pages=2)
        print(f"Scraping complete. Found {len(df)} properties.")
    else:
        logger.error("Failed to test connectivity. Cannot proceed with scraping test.")