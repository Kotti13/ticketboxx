from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import base64
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

SALT_KEY = 'your-salt-key'
SALT_INDEX = '1'
MERCHANT_ID = 'your-merchant-id'

@app.route('/api/phonepe/pay', methods=['POST'])
def phonepe_pay():
    try:
        data = request.json
        if not data or 'amount' not in data or 'mobile' not in data:
            return jsonify({"error": "Invalid input"}), 400

        amount = data['amount']
        mobile = data['mobile']
        redirect_url = 'https://your-redirect-url.com'
        callback_url = 'https://your-callback-url.com'

        payload = {
            "merchantId": MERCHANT_ID,
            "merchantTransactionId": "TXN" + str(hashlib.sha256(mobile.encode()).hexdigest()[:10]),
            "merchantUserId": "User" + mobile,
            "amount": amount,
            "redirectUrl": redirect_url,
            "redirectMode": "REDIRECT",
            "callbackUrl": callback_url,
            "mobileNumber": mobile,
            "paymentInstrument": {"type": "PAY_PAGE"},
        }

        encoded_payload = base64.b64encode(str(payload).encode()).decode()
        checksum = hashlib.sha256((encoded_payload + "/pg/v1/pay" + SALT_KEY).encode()).hexdigest()
        x_verify = f"{checksum}###{SALT_INDEX}"

        headers = {
            'Content-Type': 'application/json',
            'X-VERIFY': x_verify,
        }

        response = requests.post(
            "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
            json={"request": encoded_payload},
            headers=headers
        )

        if response.status_code != 200:
            return jsonify({"error": "PhonePe API error", "details": response.text}), 500

        return jsonify(response.json())

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
