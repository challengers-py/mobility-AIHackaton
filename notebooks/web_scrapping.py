import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# --- CONFIGURACIÓN ---
# Ajusta esta ruta a donde tienes tu msedgedriver.exe
RUTA_DRIVER = r"C:\Drivers\msedgedriver.exe"
BASE_URL = "https://es.trustpilot.com/review/tickets.oebb.at?languages=all"


def start_driver():
    options = webdriver.EdgeOptions()
    options.add_argument('--start-maximized')
    # options.add_argument('--headless') # Descomenta para que no se vea la ventana

    try:
        service = EdgeService(executable_path=RUTA_DRIVER)
        return webdriver.Edge(service=service, options=options)
    except Exception as e:
        print(f"❌ Error al iniciar driver: {e}")
        return None


def limpiar_fecha(fecha_iso_str):
    """
    Convierte '2024-11-22T14:30:00.000Z' a '2024-11-22'
    """
    if not fecha_iso_str:
        return None
    try:
        # Tomamos solo los primeros 10 caracteres (YYYY-MM-DD)
        return fecha_iso_str[:10]
    except:
        return fecha_iso_str


def seleccionar_rating(driver, rating):
    """
    Selecciona el checkbox del rating especificado.
    rating: número del 1 al 5
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

        # Buscar el checkbox
        checkbox = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, checkbox_id))
        )

        # Si no está seleccionado, hacer clic
        if not checkbox.is_selected():
            # Hacer clic en el label asociado (más confiable que el checkbox directamente)
            label = driver.find_element(By.CSS_SELECTOR, f"label[for='{checkbox_id}']")
            driver.execute_script("arguments[0].click();", label)
            time.sleep(2)  # Esperar a que cargue el contenido filtrado

        return True
    except Exception as e:
        print(f"   ⚠️ Error al seleccionar rating {rating}: {e}")
        return False


def deseleccionar_rating(driver, rating):
    """
    Deselecciona el checkbox del rating especificado.
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

        # Si está seleccionado, hacer clic para deseleccionar
        if checkbox.is_selected():
            label = driver.find_element(By.CSS_SELECTOR, f"label[for='{checkbox_id}']")
            driver.execute_script("arguments[0].click();", label)
            time.sleep(2)

        return True
    except Exception as e:
        return False


def click_siguiente(driver):
    """
    Hace clic en el botón 'Siguiente' para ir a la siguiente página.
    Retorna True si se pudo hacer clic, False si no existe el botón.
    """
    try:
        # Buscar el botón "Siguiente"
        siguiente_btn = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "a.link_internal__Eam_b.button_button__EM6gX[name='pagination-button-next']"))
        )

        # Verificar si el botón está deshabilitado
        if "button_disabled" in siguiente_btn.get_attribute("class"):
            return False

        # Hacer clic usando JavaScript para evitar problemas de elementos superpuestos
        driver.execute_script("arguments[0].click();", siguiente_btn)
        time.sleep(3)  # Esperar a que cargue la siguiente página
        return True
    except (TimeoutException, NoSuchElementException):
        return False


def scrapping_trustpilot_profesional():
    driver = start_driver()
    if not driver: return []

    dataset_final = []

    print("--- INICIANDO EXTRACCIÓN ESTRUCTURADA ---")
    print("🎯 Objetivo: Reseñas desde 2023 en adelante (Máx 10 páginas por rating)")

    # Cargar la página base
    driver.get(BASE_URL)
    time.sleep(3)

    # 1. Bucle por Calificación (5 estrellas bajando a 1)
    ratings_to_scrape = [5, 4, 3, 2, 1]

    for rating in ratings_to_scrape:
        print(f"\n⭐ Iniciando extracción de reseñas de {rating} estrellas...")

        # Deseleccionar cualquier rating previo y seleccionar el actual
        if rating < 5:
            deseleccionar_rating(driver, rating + 1)

        if not seleccionar_rating(driver, rating):
            print(f"   ❌ No se pudo seleccionar el rating {rating}. Saltando...")
            continue

        # Variable de control para romper el bucle de páginas si la fecha es vieja
        stop_rating_loop = False
        page = 1

        # 2. Bucle por Página (AHORA MÁXIMO 10 PÁGINAS)
        while page <= 10:

            # Si se activó la bandera de fecha antigua, rompemos este bucle
            if stop_rating_loop:
                break

            print(f"   📄 Procesando página {page}...")

            # 3. Encontrar las 'Tarjetas' (Cards)
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "article[class*='styles_reviewCard']"))
                )
            except TimeoutException:
                print(f"   ⚠️ No se encontraron reseñas en página {page}. Fin de contenido para {rating} estrellas.")
                break

            cards = driver.find_elements(By.CSS_SELECTOR, "article[class*='styles_reviewCard']")

            if not cards:
                cards = driver.find_elements(By.CSS_SELECTOR, "div[class*='styles_reviewCard']")

            if not cards:
                print(f"   ⚠️ No se encontraron reseñas en página {page}. Fin de contenido para {rating} estrellas.")
                break

            count_page = 0
            count_skipped = 0  # Contador de reseñas omitidas por estar duplicadas o ser inválidas

            # 4. Extracción RELATIVA (Dentro de cada tarjeta)
            for card in cards:
                try:
                    # --- EXTRACCIÓN DE FECHA PRIMERO (Para verificar paro) ---
                    fecha_limpia = None
                    try:
                        date_elem = card.find_element(By.TAG_NAME, "time")
                        fecha_raw = date_elem.get_attribute("datetime")
                        fecha_limpia = limpiar_fecha(fecha_raw)
                    except:
                        fecha_limpia = None

                    # --- CONDICIÓN DE PARO POR FECHA ---
                    # Si tenemos fecha, verificamos el año
                    if fecha_limpia:
                        try:
                            anio_review = int(fecha_limpia[:4])  # Los primeros 4 chars son el año
                            if anio_review < 2023:
                                print(
                                    f"   🛑 Fecha antigua detectada ({fecha_limpia}). Deteniendo búsqueda para {rating} estrellas.")
                                stop_rating_loop = True
                                break  # Rompe el bucle de CARDS (pasa al check de stop_rating_loop)
                        except:
                            pass  # Si falla la conversión, seguimos por seguridad

                    # A. Extraer ASUNTO
                    try:
                        title_elem = card.find_element(By.CSS_SELECTOR, "h2[class*='CDS_Typography_heading']")
                        asunto = title_elem.text.strip()
                    except:
                        try:
                            title_elem = card.find_element(By.CSS_SELECTOR,
                                                           "[data-service-review-title-typography='true']")
                            asunto = title_elem.text.strip()
                        except:
                            asunto = "Sin Título"

                    # B. Extraer RESEÑA
                    try:
                        body_elem = card.find_element(By.CSS_SELECTOR, "[data-service-review-text-typography='true']")
                        resena = body_elem.text.strip()
                    except:
                        try:
                            body_elem = card.find_element(By.CSS_SELECTOR, "p[class*='typography_body']")
                            resena = body_elem.text.strip()
                        except:
                            resena = ""

                    # D. Guardar DATOS (verificar que no sea duplicado)
                    if len(asunto) > 1 or len(resena) > 1:
                        # Verificar si ya existe esta reseña
                        es_duplicado = False
                        for item in dataset_final:
                            if item['Reseña'] == resena and item['Asunto'] == asunto:
                                es_duplicado = True
                                break

                        if not es_duplicado:
                            dataset_final.append({
                                "Asunto": asunto,
                                "Reseña": resena,
                                "Fecha": fecha_limpia,
                                "Calificación": int(rating)
                            })
                            count_page += 1
                        else:
                            count_skipped += 1

                except Exception as e:
                    continue

            print(f"   -> Pag {page}: {count_page} reseñas nuevas extraídas, {count_skipped} duplicados omitidos, {len(cards)} cards en total.")

            # Si todas las reseñas fueron duplicadas, probablemente no hay más páginas reales
            if count_page == 0 and count_skipped > 0:
                print(f"   ⚠️ Todas las reseñas en página {page} ya fueron extraídas. No hay más páginas para {rating} estrellas.")
                break

            # Si encontramos fecha antigua, salir del bucle
            if stop_rating_loop:
                break

            # Intentar ir a la siguiente página usando el botón
            if page < 10:
                if not click_siguiente(driver):
                    print(f"   ℹ️ No hay botón 'Siguiente'. Fin de páginas para {rating} estrellas.")
                    break
                page += 1
            else:
                print(f"   ℹ️ Se alcanzó el máximo de 10 páginas para {rating} estrellas.")
                break

    driver.quit()
    return dataset_final


# --- EJECUCIÓN PRINCIPAL ---
if __name__ == "__main__":
    datos = scrapping_trustpilot_profesional()

    if datos:
        df = pd.DataFrame(datos)


        print("\n--- RESUMEN DEL DATASET ---")
        print(df.info())
        print("\n--- DISTRIBUCIÓN POR CALIFICACIÓN ---")
        print(df['Calificación'].value_counts().sort_index(ascending=False))
        print("\n--- MUESTRA ---")
        print(df.head())

        nombre_archivo = "OBB_Reviews_Completo.csv"
        df.to_csv(nombre_archivo, index=False, encoding='utf-8-sig')
        print(f"\n✅ ¡Éxito! Archivo guardado: {nombre_archivo}")

    else:
        print("❌ No se pudieron extraer datos.")