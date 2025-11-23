from PIL import Image, ImageDraw
import math

# Crear una imagen de 512×512 con fondo rojo ÖBB
size = 512
background_color = (220, 20, 60)  # Rojo ÖBB
img = Image.new("RGBA", (size, size), (255, 255, 255, 0))  # Fondo transparente
draw = ImageDraw.Draw(img)

# Dibujar círculo rojo como fondo
circle_radius = 180
circle_center = (256, 256)
draw.ellipse(
    [circle_center[0] - circle_radius, circle_center[1] - circle_radius,
     circle_center[0] + circle_radius, circle_center[1] + circle_radius],
    fill=background_color
)

# Dibujar el símbolo ÖBB (círculo con línea)
# Círculo blanco exterior
outer_radius = 140
draw.ellipse(
    [circle_center[0] - outer_radius, circle_center[1] - outer_radius,
     circle_center[0] + outer_radius, circle_center[1] + outer_radius],
    outline=(255, 255, 255), width=25, fill=None
)

# Línea diagonal blanca (el "/" del logo)
line_width = 30
angle = 45
start_x = circle_center[0] - 60
start_y = circle_center[1] - 120
end_x = circle_center[0] + 60
end_y = circle_center[1] - 10

draw.line([(start_x, start_y), (end_x, end_y)], fill=(255, 255, 255), width=line_width)

# Círculo rojo interior (hueco)
inner_radius = 95
draw.ellipse(
    [circle_center[0] - inner_radius, circle_center[1] - inner_radius,
     circle_center[0] + inner_radius, circle_center[1] + inner_radius],
    fill=(255, 255, 255, 0)
)

# Guardar la imagen
output_path = r"C:\Users\ludwi\Documents\HACKATHON\obb_icon_new.png"
img.save(output_path, "PNG", optimize=True)

print(f"✅ Imagen ÖBB creada")
print(f"✅ Guardada en: {output_path}")
print(f"✅ Dimensiones: 512 × 512 px")
print(f"✅ Fondo: Transparente")
print(f"✅ Logo: Rojo ÖBB con símbolo blanco")
