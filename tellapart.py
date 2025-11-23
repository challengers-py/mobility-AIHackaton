import pandas as pd
import io
import re
import os

# --- CONFIGURACIÓN ---
INPUT_FILE = "Kundenemails-deutsch_5000.csv"
OUTPUT_POS = "reviews_positivas_asunto.csv"
OUTPUT_NEG = "reviews_negativas_asunto.csv"

# Diccionarios de Sentimiento
SENTIMENT_LEXICON = {
    'de': {
        # Positivos
        'danke': 2, 'vielen dank': 3, 'super': 2, 'toll': 2, 'lob': 3,
        'zufrieden': 2, 'hervorragend': 3, 'perfekt': 3, 'freundlich': 2,
        'pünktlich': 1, 'sauber': 1, 'gerne wieder': 3, 'bestens': 2,
        'angenehm': 1, 'weiterempfehlen': 2, 'kompetent': 2, 'schnell': 1,
        'hilfsbereit': 2, 'lösung': 1, 'gerettet': 2, 'klasse': 2,
        
        # Negativos
        'schlecht': -2, 'mies': -2, 'enttäuscht': -3, 'wütend': -3,
        'ärgerlich': -2, 'unfreundlich': -2, 'nie wieder': -3, 'chaos': -2,
        'katastrophe': -3, 'verspätung': -1, 'ausfall': -2, 'schmutzig': -2,
        'frieren': -1, 'unmöglich': -2, 'frechheit': -3, 'stunde warten': -2,
        'kalt': -1, 'laut': -1, 'defekt': -1, 'ignoriert': -2, 'keine info': -2,
        'stress': -1, 'belastend': -2, 'problem': -1, 'fehler': -1
    },
    'es': {
        'gracias': 2, 'excelente': 3, 'bueno': 1, 'feliz': 2, 'resuelto': 2,
        'malo': -2, 'pésimo': -3, 'triste': -2, 'enojado': -3, 'tarde': -1
    },
    'en': {
        'thanks': 2, 'great': 3, 'good': 1, 'happy': 2, 'solved': 2,
        'bad': -2, 'terrible': -3, 'sad': -2, 'angry': -3, 'late': -1
    }
}

def load_dataset(filepath):
    """Carga el CSV usando lógica robusta."""
    if not os.path.exists(filepath):
        print(f"❌ Error: No se encuentra el archivo {filepath}")
        return None

    separators = [';', ',', '\t']
    df = None
    
    try:
        df = pd.read_csv(filepath, sep=None, engine='python', encoding='utf-8', dtype=str)
    except:
        pass

    if df is None or len(df.columns) < 2:
        for sep in separators:
            try:
                temp_df = pd.read_csv(filepath, sep=sep, encoding='utf-8', dtype=str)
                if len(temp_df.columns) > 1:
                    df = temp_df
                    break
            except:
                try:
                    temp_df = pd.read_csv(filepath, sep=sep, encoding='latin-1', dtype=str)
                    if len(temp_df.columns) > 1:
                        df = temp_df
                        break
                except:
                    continue
    return df

def detect_columns(df):
    """Encuentra automáticamente las columnas de texto."""
    cols = {'subj': None, 'body': None}
    
    possible_body = ["Contenido", "Content", "Inhalt", "Message", "Body"]
    possible_subj = ["Asunto", "Subject", "Betreff", "Title"]

    for c in possible_body:
        if c in df.columns:
            cols['body'] = c
            break
            
    for c in possible_subj:
        if c in df.columns:
            cols['subj'] = c
            break
            
    return cols

def calculate_sentiment_score(text, lang='de'):
    """Calcula un puntaje basado en el diccionario."""
    if not isinstance(text, str):
        return 0
    
    text = text.lower()
    score = 0
    lexicon = SENTIMENT_LEXICON.get(lang, SENTIMENT_LEXICON['de'])
    
    for word, weight in lexicon.items():
        if re.search(r'\b' + re.escape(word) + r'\b', text):
            score += weight
            
    return score

def main():
    print(f"📂 Cargando {INPUT_FILE}...")
    df = load_dataset(INPUT_FILE)
    
    if df is None:
        return

    cols = detect_columns(df)
    if not cols['subj']:
        print("❌ No se encontró columna de Asunto (Betreff/Subject).")
        return

    print(f"✅ Analizando SOLO la columna: '{cols['subj']}'")
    
    pos_rows = []
    neg_rows = []
    
    total = len(df)
    print(f"🧠 Analizando {total} registros...")

    for index, row in df.iterrows():
        # --- MODIFICACIÓN CLAVE ---
        # Solo tomamos el texto del asunto para el análisis
        text_to_analyze = str(row[cols['subj']])
        
        # Calculamos score solo sobre el asunto
        score = calculate_sentiment_score(text_to_analyze, lang='de')
        
        # Buscamos 'lob' solo en el asunto
        has_lob = re.search(r'\blob\b', text_to_analyze.lower())
        
        # Guardamos todo el registro (incluido el cuerpo) pero clasificamos por el asunto
        row_dict = row.to_dict()
        row_dict['sentiment_score_subject'] = score
        
        # Lógica: Positivo si score > 0 O si el asunto dice "lob"
        if score > 0 or has_lob:
            pos_rows.append(row_dict)
        else:
            neg_rows.append(row_dict)

    df_pos = pd.DataFrame(pos_rows)
    df_neg = pd.DataFrame(neg_rows)

    print("-" * 30)
    # Guardar Positivos
    if not df_pos.empty:
        df_pos.to_csv(OUTPUT_POS, index=False, sep=';', encoding='utf-8-sig')
        print(f"🌞 Guardados {len(df_pos)} positivos en '{OUTPUT_POS}'")
    else:
        print("❄️ No se encontraron correos positivos en el asunto.")

    # Guardar Negativos
    if not df_neg.empty:
        df_neg.to_csv(OUTPUT_NEG, index=False, sep=';', encoding='utf-8-sig')
        print(f"🌧️ Guardados {len(df_neg)} negativos/neutrales en '{OUTPUT_NEG}'")

if __name__ == "__main__":
    main()