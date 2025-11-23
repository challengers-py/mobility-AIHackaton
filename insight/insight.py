from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import re
import time
from collections import Counter
import math
import unicodedata  # <--- Librería necesaria para la limpieza universal

app = FastAPI(
    title="API de Análisis Multilingüe",
    description="Diccionario actualizado. Limpieza de acentos universal (FR, DE, PT) respetando la Ñ. Auto-detección de columnas.",
    version="13.2"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DICCIONARIO MAESTRO (Versión Completa) ---
MASTER_DICTIONARY2 = {
    'es': {
        'delays': ['retraso', 'tarde', 'demora', 'espera', 'lento', 'horario', 'cerrado', 'detenido', 'cancelacion'],
        'hygiene': ['sucio', 'suciedad', 'limpieza', 'olor', 'pegajoso', 'pegajosa', 'papelera', 'resbaladizo', 'resbaladiza'],
        'comfort': ['aire', 'calor', 'frio', 'asiento', 'seguro', 'calefaccion', 'equipaje', 'altura'],
        'infrastructure': ['puerta', 'averia', 'falla', 'roto', 'frenos', 'ruido', 'vias', 'mantenimiento', 'iluminacion', 'daño', 'guia', 'bicicleta', 'ascensor', 'enchufe', 'anuncio', 'rampa', 'accesibilidad', 'emergencia', 'señal', 'movilidad'],
        'service': ['grosero', 'personal', 'taquilla', 'tarjeta', 'cobro', 'informa', 'reserva', 'estres', 'tono', 'confusion', 'formulario', 'billete', 'duda', 'compensacion', 'megafonia', 'app'],
        'user': ['perdido', 'vandalismo', 'agresiva', 'accident', 'sospechoso', 'disturbio']
    },
    'en': {
        'delays': ['delay', 'late', 'wait', 'slow', 'schedule', 'closed', 'stopped', 'stuck', 'cancelled', 'cancellation'],
        'hygiene': ['dirty', 'filth', 'cleaning', 'smell', 'odor', 'sticky', 'bin', 'trash', 'slippery'],
        'comfort': ['air', 'heat', 'hot', 'cold', 'seat', 'safe', 'safety', 'heating', 'luggage', 'baggage', 'height', 'headroom'],
        'infrastructure': ['door', 'breakdown', 'failure', 'fault', 'broken', 'brakes', 'noise', 'loud', 'track', 'rails', 'maintenance', 'lighting', 'lights', 'damage', 'guide', 'bicycle', 'bike', 'elevator', 'lift', 'plug', 'socket', 'outlet', 'announcement', 'ramp', 'accessibility', 'emergency', 'signal', 'sign', 'mobility'],
        'service': ['rude', 'staff', 'personnel', 'counter', 'office', 'card', 'charge', 'payment', 'info', 'information', 'booking', 'reservation', 'stress', 'tone', 'confusion', 'form', 'ticket', 'doubt', 'question', 'compensation', 'refund', 'loudspeaker', 'pa system', 'app'],
        'user': ['lost', 'vandalism', 'aggressive', 'accident', 'suspicious', 'disturbance']
    },
    'de': {
        'delays': ['verspätung', 'spät', 'warten', 'verzögerung', 'langsam', 'fahrplan', 'geschlossen', 'gestoppt', 'angehalten', 'ausfall', 'stornierung'],
        'hygiene': ['schmutzig', 'dreckig', 'schmutz', 'reinigung', 'sauberkeit', 'geruch', 'stinken', 'klebrig', 'mülleimer', 'abfall', 'rutschig','mull'],
        'comfort': ['luft', 'klimaanlage', 'hitze', 'warm', 'kalt', 'kälte', 'sitz', 'sitzplatz', 'sicher', 'sicherheit', 'heizung', 'gepäck', 'koffer', 'höhe'],
        'infrastructure': ['tür', 'panne', 'defekt', 'fehler', 'störung', 'kaputt', 'bremse', 'lärm', 'laut', 'gleis', 'schiene', 'wartung', 'beleuchtung', 'licht', 'schaden', 'beschädigt', 'führer', 'fahrrad', 'aufzug', 'fahrstuhl', 'steckdose', 'ansage', 'durchsage', 'rampe', 'barrierefreiheit', 'notfall', 'signal', 'schild', 'mobilität','anzeigetafeln','lift','aüsfalle','blockiert'],
        'service': ['unfreundlich', 'grob', 'personal', 'mitarbeiter', 'schalter', 'karte', 'gebühr', 'zahlung', 'info', 'auskunft', 'reservierung', 'stress', 'ton', 'verwirrung', 'formular', 'fahrkarte', 'ticket', 'zweifel', 'frage', 'entschädigung', 'erstattung', 'lautsprecher', 'app','unklarheiten','personen','buchung','tarifzonen','maulkorbregel'],
        'user': ['verloren', 'vandalismus', 'aggressiv', 'unfall', 'verdächtig', 'störung', 'unruhe','verlust','randalierende']
    }
}

# --- DICCIONARIO RESUMIDO ---
MASTER_DICTIONARY = {
    'es': {
        'punctuality': ['punt', 'demora', 'espera', 'horario'],
        'hygiene': ['limpieza','limpio'],
        'comfort': ['aire', 'calor', 'frio', 'asiento', 'seguro', 'calefaccion','equipaje','altura'],
        'infrastructure': ['puerta', 'falla', 'iluminacion', 'guia', 'bicicleta', 'ascensor','enchufe','anuncio','rampa','accesibilidad','emergencia','seña','movilidad'],
        'service': ['buen', 'personal', 'taquilla', 'tarjeta', 'cobro', 'informa', 'reserva', 'amable', 'formulario', 'duda', 'compensacion','app'],
    },
  "en": {
    "punctuality": ["punctuality", "delay", "waiting", "schedule"],
    "hygiene": ["cleanliness", "clean"],
    "comfort": ["air", "heat", "cold", "seat", "safe", "heating", "luggage", "height"],
    "infrastructure": ["door", "failure", "lighting", "guide", "bicycle", "elevator", "outlet", "announcement", "ramp", "accessibility", "emergency", "signal", "mobility"],
    "service": ["good", "staff", "ticket office", "card", "charge", "inform", "reservation", "friendly", "form", "doubt", "compensation", "app", "personal"]
  },
  "de": {
    "punctuality": ["punktlichkeit", "verspatung", "warten", "fahrplan"],
    "hygiene": ["sauberkeit", "sauber"],
    "comfort": ["luft", "hitze", "kaelte", "sitz", "sicher", "heizung", "gepack", "hoehe" ],
    "infrastructure": ["tuer", "fehler", "beleuchtung", "leitung", "fahrrad", "aufzug", "steckdose", "ansage", "rampe", "barrierefreiheit", "notfall", "signal", "mobilitat"],
    "service": ["gut", "personal", "schalter", "karte", "gebuhr", "information", "reservierung", "freundlich", "formular", "zweifel", "entschadigung", "app","lob"]
  },
  "fr": {
    "punctuality": ["ponctualite", "retard", "attente", "horaire"],
    "hygiene": ["hygiene", "propre"],
    "comfort": ["air", "chaleur", "froid", "siege", "sur", "chauffage", "bagage", "hauteur"],
    "infrastructure": ["porte", "panne", "eclairage", "guide", "velo", "ascenseur", "prise", "annonce", "rampe", "accessibilite", "urgence", "signal", "mobilite"],
    "service": ["bon", "personnel", "guichet", "carte", "frais", "information", "reservation","aimable", "formulaire", "doute", "compensation", "app"]
  }
}

# --- NUEVA FUNCIÓN UNIVERSAL DE LIMPIEZA ---
def normalize_text(text):
    """
    Elimina acentos y diacríticos de cualquier idioma (fr, de, es, pt)
    usando normalización Unicode, pero preserva la ñ/Ñ.
    """
    if not isinstance(text, str): return ""
    
    # 1. Proteger la ñ/Ñ reemplazándolas por marcadores temporales
    text = text.replace('ñ', '\001').replace('Ñ', '\002')
    
    # 2. Normalizar a NFD (descompone caracteres, ej: ü -> u + ¨)
    text = unicodedata.normalize('NFD', text)
    
    # 3. Filtrar caracteres que sean marcas de no espaciado (Mn) - Elimina los acentos
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    
    # 4. Restaurar ñ/Ñ y convertir a minúsculas
    return text.replace('\001', 'ñ').replace('\002', 'ñ').lower()

@app.get("/")
def root():
    return {"status": "online", "version": "v13.2_universal_cleaner"}

@app.post("/analizar/")
async def analyze_complaints_endpoint(
    file: UploadFile = File(...), 
    language: str = Form("es"),
    col_subj: str = Form("Asunto"), 
    col_msg: str = Form("Contenido"), 
    col_date: str = Form("Fecha"),
    type: bool = Form("Tipo"),
    page: int = Form(1),
    limit: int = Form(50)
):
    t_start = time.time()
    
    # 1. Validación Idioma
    if language not in MASTER_DICTIONARY and language not in MASTER_DICTIONARY2:
        if language != "es":
             raise HTTPException(status_code=400, detail="Idioma no soportado.")
    
    # 2. Lectura CSV (Lógica de Separador Inteligente)
    contents = await file.read()
    df = None
    last_error = None

    # Intentos de lectura con diferentes separadores
    separators = [';', ',', '\t']
    
    # Primero intentamos UTF-8
    for sep in separators:
        try:
            temp_df = pd.read_csv(io.BytesIO(contents), sep=sep, encoding='utf-8', dtype=str)
            if len(temp_df.columns) > 1:
                df = temp_df
                break
        except Exception as e:
            last_error = e
            continue
    
    # Si falló UTF-8, intentamos Latin-1
    if df is None:
        for sep in separators:
            try:
                temp_df = pd.read_csv(io.BytesIO(contents), sep=sep, encoding='latin-1', dtype=str)
                if len(temp_df.columns) > 1:
                    df = temp_df
                    break
            except Exception as e:
                last_error = e
                continue

    if df is None:
         try:
             df = pd.read_csv(io.BytesIO(contents), sep=None, engine='python', encoding='utf-8', dtype=str)
         except:
             raise HTTPException(status_code=400, detail="No se pudo leer el archivo CSV. Verifica el formato y separadores.")

    # --- AUTO-DETECCIÓN DE COLUMNAS ---
    possible_msg_cols = ["Contenido", "Content", "Inhalt", "Message", "Comentario", "Body", "Description"]
    possible_subj_cols = ["Asunto", "Subject", "Betreff", "Title", "Titulo", "Topic"]
    possible_date_cols = ["Fecha", "Date", "Zeitstempel", "Time", "Timestamp", "Datum"]

    if col_msg not in df.columns:
        for candidate in possible_msg_cols:
            if candidate in df.columns:
                col_msg = candidate
                break
    
    if col_subj not in df.columns:
        for candidate in possible_subj_cols:
            if candidate in df.columns:
                col_subj = candidate
                break

    if col_date not in df.columns:
        for candidate in possible_date_cols:
            if candidate in df.columns:
                col_date = candidate
                break

    # 3. Validación Final de Columnas
    required_cols = [col_msg, col_subj]
    if not all(col in df.columns for col in required_cols):
        missing = [c for c in required_cols if c not in df.columns]
        raise HTTPException(status_code=400, detail=f"Faltan columnas. Columnas encontradas: {list(df.columns)}. Faltan: {missing}")
        
    has_date = col_date in df.columns

    # 4. Limpieza y Fecha
    df = df.dropna(subset=[col_msg]).fillna("")
    if has_date:
        df[col_date] = pd.to_datetime(df[col_date], errors='coerce').dt.strftime('%Y-%m-%d')
        df[col_date] = df[col_date].fillna("Fecha inválida")
    
    # --- PREPARACIÓN DE BÚSQUEDA ---
    # Aplicamos la función universal (normalize_text) a toda la columna
    search_series = df[col_subj].astype(str).apply(normalize_text)
    
    # 5. Selección del Diccionario
    if type:
        keywords = MASTER_DICTIONARY.get(language, MASTER_DICTIONARY.get('en'))
    else:
        keywords = MASTER_DICTIONARY2.get(language, MASTER_DICTIONARY2.get('en'))

    if not keywords:
         raise HTTPException(status_code=400, detail="No hay palabras clave para este idioma/tipo.")
    
    # 6. Análisis Global
    category_counts = Counter()
    global_mask = pd.Series([False] * len(df), index=df.index)

    for category, terms in keywords.items():
        # Limpiamos también los términos del diccionario con la misma función
        clean_terms = [normalize_text(t) for t in terms]
        if clean_terms:
            pattern = '|'.join([re.escape(t) for t in clean_terms])
            matches = search_series.str.contains(pattern, regex=True)
            category_counts[category] = int(matches.sum())
            global_mask = global_mask | matches

    # 7. Paginación
    total_rows = len(df)
    total_pages = math.ceil(total_rows / limit)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    df_page = df.iloc[start_idx:end_idx]
    
    page_data = []
    
    for idx, row in df_page.iterrows():
        subject_raw = str(row[col_subj])
        # Limpieza individual usando la función universal
        subject_clean = normalize_text(subject_raw)
        
        cats = []
        keywords_found_row = {}
        
        for cat, terms in keywords.items():
            clean_terms = [normalize_text(t) for t in terms]
            found = [t for t in clean_terms if t in subject_clean]
            if found:
                cats.append(cat)
                keywords_found_row[cat] = found
        
        if not cats: cats = ["sin_categoria"]
        
        item = {
            'row_id': int(idx) + 1,
            'date': row[col_date] if has_date else "N/A",
            'subject': subject_raw, 
            'preview': str(row[col_msg]),
            'detected_categories': cats,
            'keywords_found': keywords_found_row
        }
        page_data.append(item)

    sorted_summary = [{"category": c, "total_mentions": n} for c, n in category_counts.most_common()]
    uncategorized = total_rows - global_mask.sum()
    if uncategorized > 0:
        sorted_summary.append({"category": "sin_categoria", "total_mentions": int(uncategorized)})

    total_time = time.time() - t_start
    print(f"--- Pag {page} de {total_pages} procesada en {total_time:.4f}s ---")

    return {
        "status": "success",
        "pagination": {
            "current_page": page,
            "items_per_page": limit,
            "total_pages": total_pages,
            "total_items": total_rows
        },
        "statistics": sorted_summary,
        "data": page_data,
        "processing_time": round(total_time, 4)
    }
