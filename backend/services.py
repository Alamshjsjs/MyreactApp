from __future__ import annotations

import json
import os
import uuid
from typing import Any, Optional

import imagehash
from PIL import Image
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from models import Product, ProductImage


def ensure_upload_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def save_file(file: FileStorage, upload_dir: str) -> str:
    extension = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{extension}"
    filepath = os.path.join(upload_dir, secure_filename(filename))
    file.save(filepath)
    return filepath


def compute_hash(image_path: str) -> str:
    with Image.open(image_path) as img:
        phash = imagehash.phash(img)
    return str(phash)


def build_product_payload(product: Product, image_base_url: str = "") -> dict[str, Any]:
    image_urls = [f"{image_base_url}/{image.filename}" if image_base_url else image.filename for image in product.images]
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "sku": product.sku,
        "metadata": json.loads(product.metadata) if product.metadata else None,
        "images": image_urls,
        "created_at": product.created_at.isoformat(),
    }


def find_best_match(scan_hash: str, product_images: list[ProductImage], threshold: int) -> tuple[Optional[Product], Optional[int]]:
    best_product = None
    best_distance = None

    target_hash = imagehash.hex_to_hash(scan_hash)
    for product_image in product_images:
        source_hash = imagehash.hex_to_hash(product_image.image_hash)
        distance = target_hash - source_hash

        if best_distance is None or distance < best_distance:
            best_distance = distance
            best_product = product_image.product

    if best_distance is None or best_distance > threshold:
        return None, best_distance

    return best_product, best_distance
