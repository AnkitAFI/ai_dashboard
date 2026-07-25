import base64
import io
import logging
from PIL import Image

logger = logging.getLogger(__name__)

def is_background_white(img: Image.Image, tolerance: int = 210, edge_ratio: float = 0.85) -> bool:
    """
    Checks if the perimeter of the image is predominantly white.
    """
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    width, height = img.size
    if width <= 2 or height <= 2:
        return False
        
    white_pixels = 0
    total_edge_pixels = (width * 2) + ((height - 2) * 2)
    pixels = img.load()
    
    # Top and bottom edges
    for x in range(width):
        r, g, b = pixels[x, 0]
        if r >= tolerance and g >= tolerance and b >= tolerance:
            white_pixels += 1
        r, g, b = pixels[x, height - 1]
        if r >= tolerance and g >= tolerance and b >= tolerance:
            white_pixels += 1
            
    # Left and right edges
    for y in range(1, height - 1):
        r, g, b = pixels[0, y]
        if r >= tolerance and g >= tolerance and b >= tolerance:
            white_pixels += 1
        r, g, b = pixels[width - 1, y]
        if r >= tolerance and g >= tolerance and b >= tolerance:
            white_pixels += 1
            
    return (white_pixels / total_edge_pixels) >= edge_ratio

def make_amazon_compliant_image(base64_img: str) -> tuple[str, bool]:
    """
    Takes a base64 image string, places it on a white canvas.
    If the background isn't already white, removes it using rembg first.
    Returns (new_base64_string, was_background_removed_by_ai).
    """
    try:
        # 1. Handle base64 prefix
        prefix = ""
        if "," in base64_img:
            prefix, base64_img = base64_img.split(",", 1)
            prefix += ","
            
        # 2. Decode the image
        img_data = base64.b64decode(base64_img)
        input_img = Image.open(io.BytesIO(img_data)).convert("RGBA")
        
        # 3. Create a basic white composite first to test
        # This naturally handles transparent PNGs by giving them a white background
        test_canvas = Image.new("RGB", input_img.size, (255, 255, 255))
        test_canvas.paste(input_img, mask=input_img.split()[3])
        
        # 4. Check if the image already has a white background
        was_ai_used = False
        final_img = test_canvas
        
        if not is_background_white(test_canvas):
            logger.info("Background is not white. Running rembg AI model...")
            was_ai_used = True
            from rembg import remove
            transparent_img = remove(input_img)
            
            final_img = Image.new("RGB", transparent_img.size, (255, 255, 255))
            final_img.paste(transparent_img, mask=transparent_img.split()[3])
        else:
            logger.info("Image already has a white background. Skipping rembg AI.")
        
        # 5. Encode back to base64
        output_buffer = io.BytesIO()
        final_img.save(output_buffer, format="JPEG", quality=95)
        output_data = output_buffer.getvalue()
        
        new_base64 = base64.b64encode(output_data).decode("utf-8")
        
        return (f"data:image/jpeg;base64,{new_base64}", was_ai_used)
        
    except Exception as e:
        logger.error(f"Error removing background: {e}")
        raise ValueError(f"Failed to process image: {e}")
