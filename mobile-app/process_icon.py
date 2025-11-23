from PIL import Image
import os

# Ruta de la imagen original
input_path = r"C:\Users\ludwi\Documents\HACKATHON\unnamed.png"
output_path = r"C:\Users\ludwi\Documents\HACKATHON\app_icon_transparent.png"

# Abrir la imagen
img = Image.open(input_path)

# Obtener información
print(f"Dimensiones originales: {img.size[0]} × {img.size[1]} px")
print(f"Modo de color: {img.mode}")

# Convertir a RGBA si no lo es
if img.mode != "RGBA":
    img = img.convert("RGBA")

# Obtener los datos de píxeles
data = img.getdata()

# Crear una nueva lista de píxeles con fondo transparente
# Si el píxel es rojo (fondo) lo hacemos transparente
new_data = []
for item in data:
    # Detectar píxeles rojos (R > 200, G < 100, B < 100)
    if item[0] > 200 and item[1] < 100 and item[2] < 100:
        # Hacer transparente (establecer alfa a 0)
        new_data.append((item[0], item[1], item[2], 0))
    else:
        # Mantener el píxel original
        new_data.append(item)

# Actualizar la imagen
img.putdata(new_data)

# Redimensionar a 512×512 px (tamaño maestro)
icon_512 = img.resize((512, 512), Image.Resampling.LANCZOS)

# Guardar la imagen con fondo transparente
icon_512.save(output_path, "PNG", optimize=True)

print(f"\n✅ Imagen procesada correctamente")
print(f"✅ Guardada en: {output_path}")
print(f"✅ Dimensiones finales: 512 × 512 px")
print(f"✅ Fondo: Transparente")
print(f"✅ Modo: RGBA (con canal alpha)")
