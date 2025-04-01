from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import sys

# Set up Selenium WebDriver (Here we're using Chrome)
options = webdriver.ChromeOptions()

# Use webdriver_manager to automatically manage the chromedriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# URL of the IMDb reviews page
url = 'https://www.imdb.com/title/tt7581902/reviews'

# Open the URL in the browser
driver.get(url)

# Optionally, wait for the page to load completely if needed
driver.implicitly_wait(20)  # Wait for elements to load (you can customize the wait)

# Get the page source (this includes dynamically loaded content)
html_content = driver.page_source

# Parse the HTML content with BeautifulSoup
soup = BeautifulSoup(html_content, "html.parser")

# Function to find all elements with the class 'ipc-list-card__content'
def find_elements_with_class(soup, class_name):
    return soup.find_all(class_=class_name)

# Function to extract the required child elements and their text
def extract_child_text(element):
    # Find child elements with class 'ipc-title__text', 'ipc-rating-star--rating' (span), 'ipc-html-content-inner-div' (div)
    title_text = element.find(class_="ipc-title__text")
    content_span = element.find(class_="ipc-rating-star--rating")  # Find rating span
    content_div = element.find("div", class_="ipc-html-content-inner-div")  # Find <div> child with the same class
    
    result = {}

    # Extract text from the title (if it exists)
    if title_text:
        result['title'] = title_text.text.strip()

    # Extract text from the content (if they exist)
    if content_span:
        result['content_span'] = content_span.text.strip()
    if content_div:
        result['content_div'] = content_div.text.strip()

    return result

# Example: Find all elements with the class 'ipc-list-card__content'
elements_with_class = find_elements_with_class(soup, "ipc-list-card__content")

# Output for each element
results = []
if elements_with_class:
    for i, element in enumerate(elements_with_class, 1):
        child_text = extract_child_text(element)
        results.append({
            "title": child_text.get('title', 'N/A'),
            "content_span": child_text.get('content_span', 'N/A'),
            "content_div": child_text.get('content_div', 'N/A'),
        })
else:
    results.append("No elements found with class 'ipc-list-card__content'.")

# Close the browser window
driver.quit()

# Output results as JSON
print(results)