from __future__ import annotations

import json
import os

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from config import Config
from models import Product, ProductImage, db
from services import (
    build_product_payload,
    compute_hash,
    ensure_upload_dir,
    find_best_match,
    save_file,
)


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    with app.app_context():
        ensure_upload_dir(app.config["UPLOAD_FOLDER"])
        db.create_all()

    @app.get("/health")
    def health() -> tuple[dict[str, str], int]:
        return {"status": "ok"}, 200

    @app.post("/add-product")
    def add_product():
        files = request.files.getlist("images")
        name = request.form.get("name", "").strip()
        description = request.form.get("description", "").strip()
        price = request.form.get("price", "").strip()
        category = request.form.get("category", "").strip() or None
        sku = request.form.get("sku", "").strip() or None
        metadata = request.form.get("metadata", "").strip()

        if not files:
            return jsonify({"error": "At least one image is required."}), 400
        if not name or not description or not price:
            return jsonify({"error": "Name, description, and price are required."}), 400

        try:
            price_value = float(price)
        except ValueError:
            return jsonify({"error": "Price must be numeric."}), 400

        metadata_json = None
        if metadata:
            try:
                metadata_json = json.dumps(json.loads(metadata))
            except json.JSONDecodeError:
                return jsonify({"error": "Metadata must be valid JSON."}), 400

        product = Product(
            name=name,
            description=description,
            price=price_value,
            category=category,
            sku=sku,
            metadata=metadata_json,
        )
        db.session.add(product)
        db.session.flush()

        for file in files:
            filepath = save_file(file, app.config["UPLOAD_FOLDER"])
            image_hash = compute_hash(filepath)
            image = ProductImage(
                product_id=product.id,
                filename=os.path.basename(filepath),
                image_hash=image_hash,
            )
            db.session.add(image)

        db.session.commit()

        return jsonify(
            {
                "message": "Product added successfully.",
                "product": build_product_payload(product, "/uploads"),
            }
        ), 201

    @app.post("/scan-image")
    def scan_image():
        scan_file = request.files.get("image")
        if not scan_file:
            return jsonify({"error": "Scan image is required."}), 400

        scan_path = save_file(scan_file, app.config["UPLOAD_FOLDER"])
        scan_hash = compute_hash(scan_path)

        product_images = ProductImage.query.options(db.joinedload(ProductImage.product)).all()
        matched_product, distance = find_best_match(
            scan_hash=scan_hash,
            product_images=product_images,
            threshold=app.config["HASH_THRESHOLD"],
        )

        os.remove(scan_path)

        if not matched_product:
            return jsonify(
                {
                    "message": "No Match Found",
                    "matched": False,
                    "distance": distance,
                }
            ), 200

        return jsonify(
            {
                "message": "Match found",
                "matched": True,
                "distance": distance,
                "product": build_product_payload(matched_product, "/uploads"),
            }
        ), 200

    @app.get("/get-products")
    def get_products():
        products = Product.query.options(db.joinedload(Product.images)).all()
        payload = [build_product_payload(product, "/uploads") for product in products]
        return jsonify(payload), 200

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename: str):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
