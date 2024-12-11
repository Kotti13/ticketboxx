from flask import Flask, jsonify
from supabase import create_client, Client
import os

# Flask app setup
app = Flask(__name__)

# Supabase configuration (use your Supabase URL and key)
supabase_url = 'https://srjumswibbswcwjntcad.supabase.co'
supabase_key = 'YOUR_SUPABASE_KEY'
supabase: Client = create_client(supabase_url, supabase_key)

@app.route('/api/bookings/<user_email>', methods=['GET'])
def get_bookings(user_email):
    try:
        # Query bookings for the given user email
        response = supabase.from('bookings').select('*').eq('customer_email', user_email).execute()
        
        # Check if there was an error
        if response.error:
            return jsonify({"error": response.error.message}), 400
        
        # Return the data as JSON
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
