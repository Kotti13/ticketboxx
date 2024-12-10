# from flask import Flask, jsonify, request
# from supabase import create_client
# import os

# # Flask app setup
# app = Flask(__name__)

# # Supabase setup
# SUPABASE_URL = "https://srjumswibbswcwjntcad.supabase.co"
# SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY"  # Replace with your actual Supabase key


# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# @app.route('/api/bookings', methods=['GET'])
# def get_bookings():
#     customer_email = request.args.get('email')
    
#     if not customer_email:
#         return jsonify({"error": "User email is required."}), 400

#     # Query the Supabase table for bookings
#     bookings = supabase.table('bookings').select('*').eq('customer_email', customer_email).execute()
    
#     if bookings.error:
#         return jsonify({"error": bookings.error.message}), 500

#     return jsonify(bookings.data)

# if __name__ == '__main__':
#     app.run(debug=True)
