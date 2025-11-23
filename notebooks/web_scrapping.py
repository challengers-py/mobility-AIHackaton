import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


RUTA_DRIVER = r"C:\Drivers\msedgedriver.exe" # declare the path to the Edge WebDriver
BASE_URL = "https://es.trustpilot.com/review/tickets.oebb.at?languages=all" # The base URL of the Trust Pilot OBB website


def start_driver():
    """
    function to start the Edge webdriver
    :return: webdriver.Edge instance
    """
    options = webdriver.EdgeOptions() # Instatiate Edge options
    options.add_argument('--headless') # Run in headless mode


    try:
        service = EdgeService(executable_path=RUTA_DRIVER)
        return webdriver.Edge(service=service, options=options)
    except Exception as e:

        print(f"Error starting driver: {e}")
        return None


def clean_dates(date_iso_str):
    """
    Casts '2024-11-22T14:30:00.000Z' a '2024-11-22'
    """
    if not date_iso_str:
        return None
    try:
        # Tomamos solo los primeros 10 caracteres (YYYY-MM-DD)
        return date_iso_str[:10]
    except:
        return date_iso_str


def select_rating(driver, rating):
    """
    Selects the checkbox for the specified rating.
    rating: 1 to 5

    """
    rating_map = {
        5: "star-filter-page-filter-five",
        4: "star-filter-page-filter-four",
        3: "star-filter-page-filter-three",
        2: "star-filter-page-filter-two",
        1: "star-filter-page-filter-one"
    }

    try:
        checkbox_id = rating_map.get(rating)
        if not checkbox_id:
            return False

        # Search the checkbox element

        checkbox = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, checkbox_id))
        )


        # If not selected, click on it
        if not checkbox.is_selected():
            # Click on the associated label
            label = driver.find_element(By.CSS_SELECTOR, f"label[for='{checkbox_id}']")
            driver.execute_script("arguments[0].click();", label)
            time.sleep(2)  # Wait for the filtered content to load

        return True
    except Exception as e:
        print(f"Error while selecting rating {rating}: {e}")
        return False



def unselect_rating(driver, rating):
    """
    Unselect the specified rating's checkbox

    """
    rating_map = {
        5: "star-filter-page-filter-five",
        4: "star-filter-page-filter-four",
        3: "star-filter-page-filter-three",
        2: "star-filter-page-filter-two",
        1: "star-filter-page-filter-one"
    }

    try:
        checkbox_id = rating_map.get(rating)
        if not checkbox_id:
            return False

        checkbox = driver.find_element(By.ID, checkbox_id)


        # If selected, click to unselect it

        if checkbox.is_selected():
            label = driver.find_element(By.CSS_SELECTOR, f"label[for='{checkbox_id}']")
            driver.execute_script("arguments[0].click();", label)
            time.sleep(2)

        return True
    except Exception as e:
        return False


def click_next(driver):
    """
    Clicks on the button 'Next' to go to the next page.
    :returns
    True if clicked, False if the button does not exist.
    """
    try:
        # Look for the button "Next"
        next_button = WebDriverWait(driver, 5).until(

            EC.presence_of_element_located((By.CSS_SELECTOR, "a.link_internal__Eam_b.button_button__EM6gX[name='pagination-button-next']"))
        )

        # Verify if the button is disabled 

        if "button_disabled" in next_button.get_attribute("class"):
            return False

        # Click the button using JS to avoid overlay issues
        driver.execute_script("arguments[0].click();", next_button)

        time.sleep(3)  # Wait for the next page to load
        return True
    except (TimeoutException, NoSuchElementException):
        return False


def scrapping_trustpilot_profesional():

    """
    function to scrape Trust Pilot reviews for OBB
    :return:
    """

    driver = start_driver()
    if not driver: return []

    dataset_final = []

    print("--- STARTING STRUCTURED EXTRACTION ---")
    print("Reviews from 2023 onwards will be extracted(Max 10 pages per rating)")

    # Load the base page
    driver.get(BASE_URL)
    time.sleep(3)

    # 1. Loop through Ratings (5 stars down to 1)
    ratings_to_scrape = [5, 4, 3, 2, 1]

    for rating in ratings_to_scrape:
        print(f"\nStarting extraction of {rating}-star reviews...")

        # Deselect any previous rating and select the current one
        if rating < 5:

            unselect_rating(driver, rating + 1)

        if not select_rating(driver, rating):

            print(f" Could not select rating {rating}. Skipping...")
            continue

        # Control variable to break the page loop if the date is old
        stop_rating_loop = False
        page = 1

        # 2. Loop through Pages (NOW MAX 10 PAGES)
        while page <= 10:

            # If the old date flag is activated, break this loop
            if stop_rating_loop:
                break

            print(f"  Processing page {page}...")
            
            # 3. Find the 'Cards'
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "article[class*='styles_reviewCard']"))
                )
            except TimeoutException:
                print(f"   No reviews found on page {page}. End of content for {rating}-star reviews.")
                break

            cards = driver.find_elements(By.CSS_SELECTOR, "article[class*='styles_reviewCard']")

            if not cards:
                cards = driver.find_elements(By.CSS_SELECTOR, "div[class*='styles_reviewCard']")

            if not cards:
                print(f"   No reviews found on page {page}. End of content for {rating}-star reviews.")
                break

            count_page = 0
            count_skipped = 0  # Counter for reviews skipped due to being duplicates or invalid
            # 4. Relative Extraction (Within each card)
            for card in cards:
                try:
                    # --- Extract DATE first (To check stop condition) ---
                    date_clean = None
                    try:
                        date_elem = card.find_element(By.TAG_NAME, "time")
                        raw_date = date_elem.get_attribute("datetime")

                        date_clean = clean_dates(raw_date)

                    except:
                        date_clean = None

                    # --- STOP CONDITION BY DATE ---
                    # If we have a date, check the year
                    if date_clean:
                        try:
                            review_year = int(date_clean[:4])  # The first 4 chars are the year
                            if review_year < 2023:
                                print(
                                    f" Old date detected ({date_clean}). Stopping search for {rating}-star reviews.")
                                stop_rating_loop = True
                                break  # Break the CARDS loop (goes to check stop_rating_loop)
                        except:
                            pass  # If conversion fails, continue for safety
                    # A. Extract title (subject) of the review
                    try:
                        title_elem = card.find_element(By.CSS_SELECTOR, "h2[class*='CDS_Typography_heading']")
                        subject = title_elem.text.strip()
                    except:
                        try:
                            title_elem = card.find_element(By.CSS_SELECTOR, "[data-service-review-title-typography='true']")
                            subject = title_elem.text.strip()
                        except:
                            subject = "No subject"

                    # B. Extract REVIEW
                    try:
                        body_elem = card.find_element(By.CSS_SELECTOR, "[data-service-review-text-typography='true']")
                        review = body_elem.text.strip()
                    except:
                        try:
                            body_elem = card.find_element(By.CSS_SELECTOR, "p[class*='typography_body']")
                            review = body_elem.text.strip()
                        except:
                            review = ""

                    # D. Save DATA (check for duplicates)
                    if len(subject) > 1 or len(review) > 1:
                        # Check if this review already exists
                        is_duplicate = False
                        for item in dataset_final:
                            if item['Review'] == review and item['Subject'] == subject:
                                is_duplicate = True
                                break

                        if not is_duplicate:
                            dataset_final.append({
                                "Subject": subject,
                                "Review": review,
                                "Date": date_clean,
                                "Rating": int(rating)
                            })
                            count_page += 1
                        else:
                            count_skipped += 1

                except Exception as e:
                    continue

            print(f"   -> Page {page}: {count_page} new reviews extracted, {count_skipped} duplicates skipped, {len(cards)} cards in total.")

            # If all reviews were duplicates, there are probably no more real pages
            if count_page == 0 and count_skipped > 0:
                print(f"   WARNING: All reviews on page {page} have already been extracted. No more pages for {rating}-star reviews.")
                break

            # If an old date is found, exit the loop
            if stop_rating_loop:
                break

            # Try to go to the next page using the button
            if page < 10:

                if not click_next(driver):

                    print(f"   No 'Next' button. End of pages for {rating}-star reviews.")
                    break
                page += 1
            else:
                print(f"   Reached the maximum of 10 pages for {rating}-star reviews.")
                break

    driver.quit()
    return dataset_final


# --- MAIN ---
if __name__ == "__main__":
    data = scrapping_trustpilot_profesional()

    if data:
        df = pd.DataFrame(data)

        file_name = "OBB_Reviews_Completo_TP.csv"
        df.to_csv(file_name, index=False, encoding='utf-8-sig')
        print(f"\n File saved: {file_name}")

    else:
        print(" Failed to extract data.")