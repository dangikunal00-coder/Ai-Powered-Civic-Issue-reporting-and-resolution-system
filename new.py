from tensorflow.keras.models import load_model

model = load_model("C:/Users/Divjot/Desktop/civic backend/civic_backend/complaints/model.h5")

for i, inp in enumerate(model.inputs):
    print(f"Input {i+1}: name={inp.name}, shape={inp.shape}")
    