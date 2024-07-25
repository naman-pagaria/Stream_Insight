from flask import Flask, request, jsonify
from transformers import TFBertForSequenceClassification, BertTokenizer
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model_name = "veb/twitch-bert-base-cased-finetuned"
model = TFBertForSequenceClassification.from_pretrained(model_name)
tokenizer = BertTokenizer.from_pretrained(model_name)

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    text = request.json.get('text')
    if not text:
        return jsonify({"error": "Text not provided"}),

    inputs = tokenizer(text, return_tensors="tf", truncation=True, padding=True, max_length=512)
    outputs = model(inputs["input_ids"], attention_mask=inputs["attention_mask"])
    probs = outputs.logits.numpy()[0]
    sentiment = "POSITIVE" if probs[1] > probs[0] else "NEGATIVE"

    return jsonify({"sentiment": sentiment})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
