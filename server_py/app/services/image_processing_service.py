import base64
import io
import logging
from PIL import Image

logger = logging.getLogger(__name__)

def make_amazon_compliant_image(base64_img: str) -> str:
    """
    Takes a base64 image string (with or without 'data:image/...;base64,' prefix),
    removes the background using local AI (rembg), places it on a pure white canvas
    to meet strict Amazon/Flipkart compliance, and returns the new base64 string.
    """
    try:
        # 1. Handle base64 prefix if present
        prefix = ""
        if "," in base64_img:
            prefix, base64_img = base64_img.split(",", 1)
            prefix += ","
            
        # 2. Decode the image
        img_data = base64.b64decode(base64_img)
        input_img = Image.open(io.BytesIO(img_data)).convert("RGBA")
        
        # 3. Remove background using rembg (outputs RGBA with transparent bg)
        # We import it here at runtime to ensure it picks up the newly installed package
        from rembg import remove
        transparent_img = remove(input_img)
        
        # 4. Create a pure white canvas of the same size
        white_canvas = Image.new("RGB", transparent_img.size, (255, 255, 255))
        
        # 5. Composite the transparent image onto the white canvas
        # using the alpha channel from transparent_img as the mask
        white_canvas.paste(transparent_img, mask=transparent_img.split()[3])
        
        # 6. Encode back to base64
        output_buffer = io.BytesIO()
        # Convert to JPEG for best size/compatibility
        white_canvas.save(output_buffer, format="JPEG", quality=95)
        output_data = output_buffer.getvalue()
        
        new_base64 = base64.b64encode(output_data).decode("utf-8")
        
        # Return with the JPEG prefix since we output as JPEG
        return f"data:image/jpeg;base64,{new_base64}"
        
    except Exception as e:
        logger.error(f"Error removing background: {e}")
        raise ValueError(f"Failed to process image: {e}")
