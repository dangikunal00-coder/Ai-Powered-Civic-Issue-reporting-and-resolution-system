from tensorflow.keras.models import load_model
import numpy as np
import tensorflow as tf
from PIL import Image

MODEL_PATH = "ai_model/model.h5"
model = load_model(MODEL_PATH, compile=False)

LABELS = ["streetlight",      # 0
    "trash_bins",       # 1
    "potholes",         # 2
    "water_leakage"]

def classify_image(image_path):
    img = Image.open(image_path).resize((224, 224))
    img = np.array(img) / 255.0
    img = img.reshape(1, 224, 224, 3)

    predictions = model.predict(img)
    index = np.argmax(predictions)
    confidence = float(np.max(predictions))

    return LABELS[index], confidence
