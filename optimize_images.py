import os
from PIL import Image

files = [
    "Hub image.png",
    "No.1 Award.png",
    "hanging bowl.png",
    "logo.png",
    "Christmas_Banner.jpg"
]

for filename in files:
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        continue
    
    try:
        name, ext = os.path.splitext(filename)
        output_name = f"{name}.webp"
        
        with Image.open(filename) as img:
            rgb_im = img.convert('RGB') # JPG/PNG might have alpha, but WebP handles it. 
            # Actually, for PNG with transparency, we should keep RGBA.
            # Convert to RGBA if not already? WebP supports transparency.
            # But JPEG is RGB.
            # PIL handles this automatically usually, but let's be safe.
            # If it's JPEG, it's RGB. If PNG, might be RGBA.
            
            img.save(output_name, "webp", quality=80)
            print(f"Converted {filename} -> {output_name}")
    except Exception as e:
        print(f"Failed to convert {filename}: {e}")
